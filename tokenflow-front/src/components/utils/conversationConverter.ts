import { 
  ClaudeConversation, 
  GPTConversation, 
  UnifiedConversation,
  UnifiedMessage,
  ClaudeMessage,
  ClaudeAttachment,
  GPTMessage,
  GPTNode
} from '@/components/types/chat'

// Adicionar export na interface
export interface ConversionResult {
  conversations: UnifiedConversation[];
  metadata: {
    source: 'gpt' | 'claude';
    totalChats: number;
    dateRange: {
      firstDate: string;
      lastDate: string;
    };
  };
}

// Função para converter conversas do Claude
export const convertClaudeConversation = (
  conversation: ClaudeConversation
): UnifiedConversation => {
  try {
    console.log('Debug - Convertendo conversa Claude:', {
      uuid: conversation.uuid,
      name: conversation.name,
      messagesCount: conversation.chat_messages?.length,
      rawData: conversation // Log completo para debug
    });

    // Validações iniciais mais flexíveis
    if (!conversation?.uuid) {
      console.warn('Conversa Claude sem UUID:', conversation);
      // Gera um UUID temporário se necessário
      conversation.uuid = `claude_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    if (!Array.isArray(conversation?.chat_messages)) {
      console.warn('Conversa Claude sem mensagens válidas:', conversation);
      conversation.chat_messages = [];
    }

    const messages: UnifiedMessage[] = conversation.chat_messages
      .map((msg: ClaudeMessage) => {
        try {
          if (!msg?.uuid) {
            console.warn('Mensagem Claude sem UUID, gerando um:', msg);
            msg.uuid = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          }

          if (!msg?.sender) {
            console.warn('Mensagem Claude sem remetente, assumindo "human":', msg);
            msg.sender = 'human';
          }

          const text = msg.text || msg.content?.[0]?.text || '';
          const sender: 'human' | 'assistant' =
            msg.sender === 'human' ? 'human' : 'assistant';

          const processedMessage: UnifiedMessage = {
            id: msg.uuid,
            text,
            sender,
            created_at: msg.created_at || new Date().toISOString(),
            updated_at: msg.updated_at || msg.created_at || new Date().toISOString()
          };

          if (msg.attachments && msg.attachments.length > 0) {
            processedMessage.attachments = msg.attachments;
          }

          if (msg.files && msg.files.length > 0) {
            processedMessage.files = msg.files;
          }

          return processedMessage;
        } catch (error) {
          console.error('Debug - Erro ao converter mensagem Claude:', error);
          return null;
        }
      })
      .filter((msg): msg is UnifiedMessage => msg !== null);

    const unifiedConversation: UnifiedConversation = {
      id: `claude_${conversation.uuid}`,
      title: conversation.name || 'Sem título',
      created_at: conversation.created_at || new Date().toISOString(),
      updated_at: conversation.updated_at || conversation.created_at || new Date().toISOString(),
      source: 'claude' as const,
      messages
    };

    return unifiedConversation;
  } catch (error) {
    console.error('Debug - Erro ao converter conversa Claude:', error);
    throw error;
  }
};

// Função para converter conversas do GPT
export const convertGPTConversation = (
  conversation: GPTConversation
): UnifiedConversation => {
  try {
    console.log('Debug - Convertendo conversa GPT:', {
      title: conversation.title,
      createTime: conversation.create_time,
      nodesCount: Object.keys(conversation.mapping).length
    });

    const messages: UnifiedMessage[] = [];
    const nodes = conversation.mapping;

    // Encontra o nó raiz (que não tem parent)
    const rootNodeId = Object.values(nodes).find(node => !node.parent)?.id;

    if (!rootNodeId) {
      throw new Error('Nó raiz não encontrado na conversa GPT');
    }

    // Função para processar uma mensagem GPT
    const processMessage = (message: GPTMessage): UnifiedMessage | null => {
      try {
        if (!message.id || !message.author?.role) return null;

        if (
          message.author.role === 'system' &&
          message.metadata?.is_visually_hidden_from_conversation === true
        ) {
          return null;
        }

        const text = message.content?.parts?.[0];
        if (!text) return null;

        const sender: 'human' | 'assistant' =
          message.author.role === 'user' ? 'human' : 'assistant';

        return {
          id: message.id,
          text,
          sender,
          created_at: new Date(message.create_time * 1000).toISOString(),
          updated_at: message.update_time
            ? new Date(message.update_time * 1000).toISOString()
            : new Date(message.create_time * 1000).toISOString()
        };
      } catch (error) {
        console.error('Debug - Erro ao processar mensagem GPT:', error);
        return null;
      }
    };

    // Função para percorrer a árvore de mensagens
    const traverseMessages = (nodeId: string) => {
      const node = nodes[nodeId];
      if (!node) return;

      if (node.message) {
        const processedMessage = processMessage(node.message);
        if (processedMessage) {
          messages.push(processedMessage);
        }
      }

      node.children?.forEach(childId => {
        traverseMessages(childId);
      });
    };

    traverseMessages(rootNodeId);

    if (messages.length === 0) {
      throw new Error('Nenhuma mensagem válida na conversa GPT');
    }

    const unifiedConversation: UnifiedConversation = {
      id: `gpt_${conversation.create_time}`,
      title: conversation.title || 'Sem título',
      created_at: new Date(conversation.create_time * 1000).toISOString(),
      updated_at: new Date(conversation.update_time * 1000).toISOString(),
      source: 'gpt',
      messages
    };

    return unifiedConversation;
  } catch (error) {
    console.error('Debug - Erro ao converter conversa GPT:', error);
    throw error;
  }
};

// Função principal de detecção e conversão
export const detectAndConvertConversation = (
  jsonData: any,
  fileName: string
): ConversionResult => {
  try {
    let conversations: UnifiedConversation[] = [];
    let source: 'gpt' | 'claude' = 'gpt';
    let dates: Date[] = [];

    // Processa array ou objeto único
    if (Array.isArray(jsonData)) {
      conversations = jsonData.map(item => {
        if (isClaudeFormat(item)) {
          source = 'claude';
          return convertClaudeConversation(item);
        } else if (isGPTFormat(item)) {
          source = 'gpt';
          return convertGPTConversation(item);
        }
        throw new Error('Formato não reconhecido');
      });
    } else {
      if (isClaudeFormat(jsonData)) {
        source = 'claude';
        conversations = [convertClaudeConversation(jsonData)];
      } else if (isGPTFormat(jsonData)) {
        source = 'gpt';
        conversations = [convertGPTConversation(jsonData)];
      }
    }

    // Coleta todas as datas
    conversations.forEach(conv => {
      dates.push(new Date(conv.created_at));
      dates.push(new Date(conv.updated_at));
    });

    // Ordena as datas
    dates.sort((a, b) => a.getTime() - b.getTime());

    const result = {
      conversations,
      metadata: {
        source,
        totalChats: conversations.length,
        dateRange: {
          firstDate: dates[0].toISOString(),
          lastDate: dates[dates.length - 1].toISOString()
        }
      }
    };

    console.log('Debug - Conversão concluída:', {
      fileName,
      totalChats: result.metadata.totalChats,
      source: result.metadata.source,
      dateRange: result.metadata.dateRange
    });

    return result;
  } catch (error) {
    console.error('Erro na conversão:', error);
    throw error;
  }
};

// Funções auxiliares para identificar o formato
const isGPTFormat = (data: any): boolean => {
  return (
    data &&
    typeof data === 'object' &&
    'mapping' in data &&
    'create_time' in data
  );
};

const isClaudeFormat = (data: any): boolean => {
  const isValid = data && 
    typeof data === 'object' &&
    'uuid' in data &&
    'chat_messages' in data;
  
  console.log('Verificando formato Claude:', {
    data,
    isValid,
    hasUuid: 'uuid' in data,
    hasMessages: 'chat_messages' in data
  });
  
  return isValid;
}; 