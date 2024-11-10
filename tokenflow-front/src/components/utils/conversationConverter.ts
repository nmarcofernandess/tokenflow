import { 
  ClaudeConversation, 
  GPTConversation, 
  UnifiedConversation,
  UnifiedMessage,
  GPTMessage 
} from '@/components/types/chat'

// Função de validação para mensagens unificadas
const validateMessage = (message: UnifiedMessage): boolean => {
  const isValid = !!(
    message.id &&
    message.text &&
    message.sender &&
    message.timestamp &&
    ['human', 'assistant'].includes(message.sender)
  )

  if (!isValid) {
    console.warn('Debug - Mensagem inválida:', message)
  }

  return isValid
}

// Função de validação para conversas unificadas
const validateConversation = (conversation: UnifiedConversation): boolean => {
  const isValid = !!(
    conversation.id &&
    conversation.title &&
    conversation.created_at &&
    conversation.updated_at &&
    Array.isArray(conversation.messages) &&
    conversation.messages.every(validateMessage)
  )

  if (!isValid) {
    console.warn('Debug - Conversa inválida:', {
      id: conversation.id,
      title: conversation.title,
      messagesCount: conversation.messages.length
    })
  }

  return isValid
}

export const convertClaudeConversation = (
  conversation: ClaudeConversation
): UnifiedConversation => {
  console.log('Debug - Convertendo conversa Claude:', {
    uuid: conversation.uuid,
    name: conversation.name,
    messagesCount: conversation.chat_messages.length
  })

  const unifiedConversation = {
    id: conversation.uuid,
    title: conversation.name,
    created_at: conversation.created_at,
    updated_at: conversation.updated_at,
    messages: conversation.chat_messages.map(msg => ({
      id: msg.uuid,
      text: msg.text,
      sender: msg.sender,
      timestamp: msg.created_at,
      attachments: msg.attachments
    })),
    source: 'claude' as const
  }

  if (!validateConversation(unifiedConversation)) {
    throw new Error('Conversa Claude inválida')
  }

  return unifiedConversation
}

export const convertGPTConversation = (
  conversation: GPTConversation
): UnifiedConversation => {
  try {
    console.log('Debug - Iniciando conversão GPT:', {
      title: conversation.title,
      createTime: conversation.create_time,
      nodesCount: Object.keys(conversation.mapping).length,
      mapping: conversation.mapping // Log completo do mapping para debug
    })

    const messages: UnifiedMessage[] = []
    const nodes = conversation.mapping
    
    // Encontra o nó raiz (que não tem parent)
    const rootNodeId = Object.values(nodes)
      .find(node => !node.parent)?.id

    console.log('Debug - Nó raiz:', { rootNodeId })

    if (!rootNodeId) {
      console.warn('Debug - Nó raiz não encontrado')
      return {
        id: `gpt_${conversation.create_time}_${conversation.title.replace(/\s+/g, '_')}`,
        title: conversation.title || 'Conversa sem título',
        created_at: new Date(conversation.create_time * 1000).toISOString(),
        updated_at: new Date(conversation.update_time * 1000).toISOString(),
        messages: [],
        source: 'gpt'
      }
    }

    // Função para processar uma mensagem GPT
    const processMessage = (message: GPTMessage): UnifiedMessage | null => {
      console.log('Debug - Processando mensagem:', {
        id: message.id,
        role: message.author.role,
        content: message.content,
        metadata: message.metadata
      })

      // Ignora mensagens de sistema ocultas
      if (
        message.author.role === 'system' && 
        message.metadata?.is_visually_hidden_from_conversation
      ) {
        console.debug('Debug - Mensagem de sistema oculta ignorada:', message.id)
        return null
      }

      // Verifica se tem conteúdo válido
      if (!message.content?.parts?.length) {
        console.debug('Debug - Mensagem sem conteúdo:', message.id)
        return null
      }

      const text = message.content.parts[0]
      if (!text || text.length === 0) {
        console.debug('Debug - Mensagem com texto vazio:', message.id)
        return null
      }

      // Determina o sender baseado no role
      let sender: "human" | "assistant"
      if (message.author.role === 'user') {
        sender = 'human'
      } else if (['assistant', 'tool', 'system'].includes(message.author.role)) {
        sender = 'assistant'
      } else {
        console.warn('Debug - Role desconhecido:', message.author.role)
        sender = 'assistant' // fallback para assistant
      }

      return {
        id: message.id,
        text,
        sender,
        timestamp: message.create_time 
          ? new Date(message.create_time * 1000).toISOString()
          : new Date(conversation.create_time * 1000).toISOString()
      }
    }

    // Função para percorrer a árvore de mensagens em ordem
    const traverseMessages = (nodeId: string, depth = 0) => {
      const node = nodes[nodeId]
      if (!node) {
        console.warn('Debug - Nó não encontrado:', nodeId)
        return
      }

      console.debug('Debug - Processando nó:', {
        id: nodeId,
        depth,
        hasMessage: !!node.message,
        childrenCount: node.children?.length,
        parentId: node.parent
      })

      if (node.message) {
        const processedMessage = processMessage(node.message)
        if (processedMessage) {
          messages.push(processedMessage)
        }
      }

      // Percorre os filhos em ordem
      node.children?.forEach(childId => {
        traverseMessages(childId, depth + 1)
      })
    }

    // Inicia a travessia a partir do nó raiz
    traverseMessages(rootNodeId)

    console.log('Debug - Mensagens processadas:', {
      total: messages.length,
      messages: messages.map(m => ({
        id: m.id,
        sender: m.sender,
        textLength: m.text.length
      }))
    })

    // Gera um ID único para a conversa
    const uniqueId = `gpt_${conversation.create_time}_${conversation.title.replace(/\s+/g, '_')}`

    const unifiedConversation = {
      id: uniqueId,
      title: conversation.title || 'Conversa sem título',
      created_at: new Date(conversation.create_time * 1000).toISOString(),
      updated_at: new Date(conversation.update_time * 1000).toISOString(),
      messages,
      source: 'gpt' as const
    }

    // Validação mais flexível
    if (!unifiedConversation.id || !unifiedConversation.created_at || !Array.isArray(unifiedConversation.messages)) {
      console.error('Debug - Validação falhou:', unifiedConversation)
      throw new Error('Estrutura básica da conversa GPT inválida')
    }

    // Garante que todas as mensagens têm os campos necessários
    const invalidMessages = unifiedConversation.messages.filter(
      msg => !msg.id || !msg.text || !msg.sender || !msg.timestamp
    )

    if (invalidMessages.length > 0) {
      console.error('Debug - Mensagens inválidas:', invalidMessages)
      throw new Error(`${invalidMessages.length} mensagens com estrutura inválida`)
    }

    return unifiedConversation
  } catch (error) {
    console.error('Debug - Erro na conversão GPT:', error)
    throw error
  }
}

export const detectAndConvertConversation = (
  jsonData: any
): UnifiedConversation => {
  try {
    console.log('Debug - Detectando formato:', {
      hasMapping: !!jsonData.mapping,
      hasCreateTime: !!jsonData.create_time,
      hasUuid: !!jsonData.uuid,
      hasChatMessages: !!jsonData.chat_messages
    })

    // Detecta o formato baseado na estrutura do JSON
    if (jsonData.mapping && jsonData.create_time) {
      return convertGPTConversation(jsonData as GPTConversation)
    } else if (jsonData.uuid && jsonData.chat_messages) {
      return convertClaudeConversation(jsonData as ClaudeConversation)
    }
    
    throw new Error('Formato de conversa não reconhecido')
  } catch (error) {
    console.error('Debug - Erro na conversão:', error)
    throw error
  }
} 