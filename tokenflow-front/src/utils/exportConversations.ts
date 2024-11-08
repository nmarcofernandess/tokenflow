import { UnifiedConversation } from '@/types/chat'

interface ExportOptions {
  baseFileName?: string;
  maxConversationsPerFile?: number;
  includeMetadata?: boolean;
  separateBySource?: boolean;
  format?: 'json' | 'jsonl';
  onProgress?: (progress: number) => void;
  onComplete?: (files: string[]) => void;
}

type ConversationGroup = {
  [key: string]: UnifiedConversation[];
}

export const exportConversations = async (
  conversations: UnifiedConversation[],
  options: ExportOptions = {}
) => {
  const {
    maxConversationsPerFile = 100,
    baseFileName = `conversations_${new Date().toISOString().split('T')[0]}`,
    includeMetadata = true,
    separateBySource = false,
    format = 'json',
    onProgress,
    onComplete
  } = options

  const exportedFiles: string[] = []

  // Função para preparar os dados da conversa
  const prepareConversationData = (conversation: UnifiedConversation) => {
    if (!includeMetadata) {
      return {
        title: conversation.title,
        messages: conversation.messages.map(msg => ({
          text: msg.text,
          sender: msg.sender,
          attachments: msg.attachments
        }))
      }
    }
    return conversation
  }

  // Separa as conversas por fonte se necessário
  const conversationGroups: ConversationGroup = separateBySource
    ? {
        claude: conversations.filter(c => c.source === 'claude'),
        gpt: conversations.filter(c => c.source === 'gpt')
      }
    : { all: conversations }

  // Processa cada grupo
  for (const [source, convs] of Object.entries(conversationGroups)) {
    // Divide as conversas em chunks
    const chunks = convs.reduce((acc: UnifiedConversation[][], conv: UnifiedConversation, i: number) => {
      const chunkIndex = Math.floor(i / maxConversationsPerFile)
      if (!acc[chunkIndex]) {
        acc[chunkIndex] = []
      }
      acc[chunkIndex].push(conv)
      return acc
    }, [])

    // Exporta cada chunk
    for (let i = 0; i < chunks.length; i++) {
      const suffix = chunks.length > 1 ? `_part_${i + 1}` : ''
      const sourcePrefix = separateBySource ? `_${source}` : ''
      const fileName = `${baseFileName}${sourcePrefix}${suffix}.${format}`

      const preparedData = chunks[i].map(prepareConversationData)
      let fileContent: string

      if (format === 'jsonl') {
        fileContent = preparedData.map((data: ReturnType<typeof prepareConversationData>) => 
          JSON.stringify(data)
        ).join('\n')
      } else {
        fileContent = JSON.stringify(preparedData, null, 2)
      }

      const blob = new Blob([fileContent], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      
      const link = document.createElement('a')
      link.href = url
      link.download = fileName
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      exportedFiles.push(fileName)
      onProgress?.((i + 1) / chunks.length * 100)
    }
  }

  onComplete?.(exportedFiles)
} 