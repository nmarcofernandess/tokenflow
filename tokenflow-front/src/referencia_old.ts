import type { Message, Conversation, AISource } from '../types'

// Interfaces específicas para cada formato de conversa
interface ClaudeMessage {
  uuid: string;
  text: string;
  content: Array<{
    type: string;
    text: string;
  }>;
  sender: 'human' | 'assistant';
  created_at: string;
  attachments?: Array<{
    file_name: string;
    content?: string;
  }>;
}

interface ClaudeConversation {
  uuid: string;
  name: string;
  created_at: string;
  updated_at: string;
  chat_messages: ClaudeMessage[];
}

interface GPTMessage {
  id: string;
  author: {
    role: string;
  };
  content: {
    parts: string[];
  };
  create_time: number;
  metadata?: {
    is_visually_hidden_from_conversation?: boolean;
  };
}

interface GPTNode {
  id: string;
  message?: GPTMessage;
  parent?: string;
  children: string[];
}

interface GPTConversation {
  id: string;
  title: string;
  create_time: number;
  update_time: number;
  mapping: Record<string, GPTNode>;
}

// Função de validação para mensagens com melhor tratamento de erros
const validateMessage = (message: Message): boolean => {
  try {
    const isValid = !!(
      message.id &&
      message.text &&
      message.sender &&
      message.timestamp &&
      ['human', 'assistant'].includes(message.sender)
    )

    if (!isValid) {
      console.warn('Debug - Mensagem inválida:', {
        id: message.id,
        hasSender: !!message.sender,
        hasText: !!message.text,
        hasTimestamp: !!message.timestamp,
        validSender: ['human', 'assistant'].includes(message.sender || '')
      })
    }

    return isValid
  } catch (error) {
    console.error('Debug - Erro ao validar mensagem:', error)
    return false
  }
}

// Adicionar validação de fonte
const validateSource = (source: unknown): source is AISource => {
  return source === 'gpt' || source === 'claude'
}

// Função de validação para conversas com melhor tratamento de erros
const validateConversation = (conversation: Conversation): boolean => {
  try {
    const isValid = !!(
      conversation.id &&
      conversation.title &&
      conversation.created_at &&
      validateSource(conversation.source) &&
      Array.isArray(conversation.messages) &&
      conversation.messages.length > 0 &&
      conversation.messages.some(validateMessage)
    )

    if (!isValid) {
      console.warn('Debug - Conversa inválida:', {
        hasId: !!conversation.id,
        hasTitle: !!conversation.title,
        hasCreatedAt: !!conversation.created_at,
        hasValidSource: validateSource(conversation.source),
        messagesCount: conversation.messages?.length,
        hasValidMessages: conversation.messages?.some(validateMessage)
      })
    }

    return isValid
  } catch (error) {
    console.error('Debug - Erro ao validar conversa:', error)
    return false
  }
}

export const convertClaudeConversation = (
  conversation: ClaudeConversation
): Conversation | null => {
  try {
    console.log('Debug - Convertendo conversa Claude:', {
      uuid: conversation.uuid,
      name: conversation.name,
      messagesCount: conversation.chat_messages?.length
    })

    // Validações iniciais
    if (!conversation.uuid || !conversation.chat_messages?.length) {
      console.warn('Debug - Conversa Claude sem UUID ou mensagens')
      return null
    }

    const messages = conversation.chat_messages
      .map((msg: ClaudeMessage) => {
        try {
          if (!msg.uuid || !msg.sender) return null

          const message: Message = {
            id: msg.uuid,
            text: msg.text || msg.content?.[0]?.text || '',
            sender: msg.sender,
            timestamp: msg.created_at,
            attachments: msg.attachments || undefined
          }
          return message
        } catch (error) {
          console.error('Debug - Erro ao converter mensagem Claude:', error)
          return null
        }
      })
      .filter((msg): msg is Message => msg !== null && validateMessage(msg))

    if (messages.length === 0) {
      console.warn('Debug - Nenhuma mensagem válida na conversa Claude')
      return null
    }

    const unifiedConversation: Conversation = {
      id: conversation.uuid,
      title: conversation.name || 'Sem título',
      created_at: conversation.created_at,
      source: 'claude',
      messages
    }

    if (!validateConversation(unifiedConversation)) {
      console.warn('Debug - Conversa Claude unificada inválida')
      return null
    }

    return unifiedConversation
  } catch (error) {
    console.error('Debug - Erro ao converter conversa Claude:', error)
    return null
  }
}

export const convertGPTConversation = (
  conversation: GPTConversation
): Conversation | null => {
  try {
    console.log('Debug - Iniciando conversão GPT:', {
      title: conversation.title,
      createTime: conversation.create_time,
      nodesCount: Object.keys(conversation.mapping).length
    })

    const messages: Message[] = []
    const nodes = conversation.mapping
    
    // Encontra o nó raiz (que não tem parent)
    const rootNodeId = Object.values(nodes)
      .find((node: GPTNode) => !node.parent)?.id

    if (!rootNodeId) {
      console.warn('Debug - Nó raiz não encontrado')
      return {
        id: `gpt_${conversation.create_time}_${conversation.title.replace(/\s+/g, '_')}`,
        title: conversation.title || 'Conversa sem título',
        created_at: new Date(conversation.create_time * 1000).toISOString(),
        source: 'gpt',
        messages: []
      }
    }

    // Função para processar uma mensagem GPT com melhor tratamento de erros
    const processMessage = (message: GPTMessage): Message | null => {
      try {
        if (!message.id || !message.author?.role) return null
        
        if (
          message.author.role === 'system' && 
          message.metadata?.is_visually_hidden_from_conversation
        ) {
          return null
        }

        const text = message.content?.parts?.[0]
        if (!text) return null

        const sender: 'human' | 'assistant' = 
          message.author.role === 'user' ? 'human' : 'assistant'

        return {
          id: message.id,
          text,
          sender,
          timestamp: new Date(message.create_time * 1000).toISOString()
        }
      } catch (error) {
        console.error('Debug - Erro ao processar mensagem GPT:', error)
        return null
      }
    }

    // Função para percorrer a árvore de mensagens
    const traverseMessages = (nodeId: string) => {
      const node = nodes[nodeId] as GPTNode
      if (!node) return

      if (node.message) {
        const processedMessage = processMessage(node.message)
        if (processedMessage) {
          messages.push(processedMessage)
        }
      }

      node.children?.forEach((childId: string) => {
        traverseMessages(childId)
      })
    }

    traverseMessages(rootNodeId)

    const unifiedConversation: Conversation = {
      id: `gpt_${conversation.create_time}_${conversation.title.replace(/\s+/g, '_')}`,
      title: conversation.title || 'Conversa sem título',
      created_at: new Date(conversation.create_time * 1000).toISOString(),
      source: 'gpt',
      messages
    }

    if (!validateConversation(unifiedConversation)) {
      console.warn('Debug - Conversa GPT unificada inválida')
      return null
    }

    return unifiedConversation
  } catch (error) {
    console.error('Debug - Erro ao converter conversa GPT:', error)
    return null
  }
}

// Criar interface para o tipo de entrada esperado
interface ConversionInput {
  mapping?: Record<string, unknown>;
  create_time?: number;
  uuid?: string;
  chat_messages?: unknown[];
}

// Adicionar validação de formato antes da conversão
const isValidGPTFormat = (data: unknown): data is GPTConversation => {
  const gpt = data as GPTConversation
  return !!(
    gpt.mapping &&
    gpt.create_time &&
    typeof gpt.title === 'string' &&
    Object.keys(gpt.mapping).length > 0
  )
}

const isValidClaudeFormat = (data: unknown): data is ClaudeConversation => {
  const claude = data as ClaudeConversation
  return !!(
    claude.uuid &&
    claude.chat_messages &&
    Array.isArray(claude.chat_messages) &&
    claude.chat_messages.length > 0
  )
}

export const detectAndConvertConversation = (
  jsonData: ConversionInput
): Conversation | null => {
  try {
    if (isValidGPTFormat(jsonData)) {
      return convertGPTConversation(jsonData)
    } 
    
    if (isValidClaudeFormat(jsonData)) {
      return convertClaudeConversation(jsonData)
    }
    
    console.warn('Debug - Formato de conversa não reconhecido:', jsonData)
    return null
  } catch (error) {
    console.error('Debug - Erro na conversão:', error)
    return null
  }
} 