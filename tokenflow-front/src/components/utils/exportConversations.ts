import { Conversation } from '@/types'

interface ExportConfig {
  baseFileName: string
  maxConversationsPerFile: number
  includeMetadata: boolean
  separateBySource: boolean
  format: 'json' | 'jsonl'
  onProgress?: (progress: number) => void
  onComplete?: (files: string[]) => void
}

export const exportConversations = (
  conversations: Conversation[],
  config: ExportConfig
) => {
  const {
    baseFileName,
    maxConversationsPerFile,
    includeMetadata,
    separateBySource,
    format,
    onProgress,
    onComplete
  } = config

  // Função para preparar os dados de uma conversa
  const prepareConversationData = (conversation: Conversation) => {
    if (!includeMetadata) {
      return {
        messages: conversation.messages
      }
    }
    return conversation
  }

  // Divide as conversas em grupos
  const conversationGroups = separateBySource
    ? Object.groupBy(conversations, conv => conv.source)
    : { all: conversations }

  const exportedFiles: string[] = []

  // Processa cada grupo
  Object.entries(conversationGroups).forEach(([source, groupConversations]) => {
    // Divide em chunks do tamanho especificado
    const chunks = Array.from({ length: Math.ceil(groupConversations.length / maxConversationsPerFile) })
      .map((_, index) => groupConversations.slice(
        index * maxConversationsPerFile,
        (index + 1) * maxConversationsPerFile
      ))

    // Processa cada chunk
    chunks.forEach((chunk, index) => {
      const fileName = separateBySource
        ? `${baseFileName}_${source}_${index + 1}.${format}`
        : `${baseFileName}_${index + 1}.${format}`

      const data = chunk.map(prepareConversationData)

      // Cria o conteúdo do arquivo
      const content = format === 'jsonl'
        ? data.map(d => JSON.stringify(d)).join('\n')
        : JSON.stringify(data, null, 2)

      // Cria e faz download do arquivo
      const blob = new Blob([content], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = fileName
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      exportedFiles.push(fileName)
      onProgress?.(exportedFiles.length / chunks.length)
    })
  })

  onComplete?.(exportedFiles)
} 