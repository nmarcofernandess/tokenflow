import { UnifiedConversation } from '@/components/types/chat'
import { createAndDownloadZip } from '@/utils/zipExporter'

interface ExportConfig {
  baseFileName: string
  maxConversationsPerFile: number
  includeMetadata: boolean
  separateBySource: boolean
  format: 'json' | 'md' | 'html'
  onProgress?: (progress: number) => void
  onComplete?: (files: string[]) => void
}

// Função para formatar o texto da mensagem
const formatMessageText = (text: any): string => {
  if (typeof text === 'string') return text
  if (Array.isArray(text)) {
    return text
      .map(item => typeof item === 'string' ? item : JSON.stringify(item))
      .join(' ')
  }
  if (typeof text === 'object' && text !== null) {
    try {
      return JSON.stringify(text, null, 2)
    } catch {
      return '[Conteúdo não textual]'
    }
  }
  return String(text || '')
}

// Função para converter uma conversa para markdown
const conversationToMarkdown = (conversation: UnifiedConversation) => {
  const header = [
    `# ${conversation.title || 'Conversa sem título'}`,
    `Data: ${new Date(conversation.created_at).toLocaleDateString('pt-BR')}`,
    `Fonte: ${conversation.source.toUpperCase()}`,
    `Total de mensagens: ${conversation.messages.length}`,
    ''
  ].join('\n')

  const messages = conversation.messages.map(msg => {
    const sender = msg.sender === 'human' ? '👤 Usuário' : '🤖 Assistente'
    const text = formatMessageText(msg.text)
    const attachments = msg.attachments?.length 
      ? `\n\nAnexos: ${msg.attachments.map(a => `📎 ${a.file_name}`).join(', ')}`
      : ''

    return `### ${sender}\n\n${text}${attachments}\n`
  }).join('\n---\n\n')

  return `${header}\n${messages}\n\n`
}

// Função para converter uma conversa para HTML
const conversationToHTML = (conversation: UnifiedConversation) => {
  const css = `
    <style>
      :root {
        --primary: #0EA5E9;
        --background: #FFFFFF;
        --text: #11181C;
        --border: #E4E4E7;
      }
      
      @media (prefers-color-scheme: dark) {
        :root {
          --primary: #38BDF8;
          --background: #18181B;
          --text: #FAFAFA;
          --border: #27272A;
        }
      }

      body {
        font-family: system-ui, -apple-system, sans-serif;
        line-height: 1.5;
        color: var(--text);
        background: var(--background);
        max-width: 800px;
        margin: 0 auto;
        padding: 2rem;
      }

      .header {
        border-bottom: 1px solid var(--border);
        padding-bottom: 1rem;
        margin-bottom: 2rem;
      }

      .header h1 {
        margin: 0;
        color: var(--primary);
      }

      .metadata {
        font-size: 0.875rem;
        color: var(--text);
        opacity: 0.8;
      }

      .messages {
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }

      .message {
        display: flex;
        gap: 1rem;
        padding: 1rem;
        border-radius: 0.5rem;
        background: var(--background);
        border: 1px solid var(--border);
      }

      .message.human {
        margin-left: 2rem;
        border-color: var(--primary);
      }

      .message.assistant {
        margin-right: 2rem;
      }

      .avatar {
        width: 2.5rem;
        height: 2.5rem;
        border-radius: 50%;
        background: var(--primary);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: bold;
      }

      .content {
        flex: 1;
      }

      .sender {
        font-weight: 600;
        margin-bottom: 0.5rem;
      }

      .text {
        white-space: pre-wrap;
      }

      .attachments {
        margin-top: 0.5rem;
        font-size: 0.875rem;
        opacity: 0.8;
      }

      code {
        background: var(--border);
        padding: 0.2em 0.4em;
        border-radius: 0.25rem;
        font-family: monospace;
      }

      pre {
        background: var(--border);
        padding: 1rem;
        border-radius: 0.5rem;
        overflow-x: auto;
      }
    </style>
  `

  const header = `
    <div class="header">
      <h1>${conversation.title || 'Conversa sem título'}</h1>
      <div class="metadata">
        <div>Data: ${new Date(conversation.created_at).toLocaleDateString('pt-BR')}</div>
        <div>Fonte: ${conversation.source.toUpperCase()}</div>
        <div>Total de mensagens: ${conversation.messages.length}</div>
      </div>
    </div>
  `

  const messages = conversation.messages.map(msg => {
    const avatar = msg.sender === 'human' ? '👤' : '🤖'
    const senderName = msg.sender === 'human' ? 'Usuário' : 'Assistente'
    const text = formatMessageText(msg.text)
    const attachments = msg.attachments?.length 
      ? `<div class="attachments">
          ${msg.attachments.map(a => `📎 ${a.file_name}`).join(', ')}
         </div>`
      : ''

    return `
      <div class="message ${msg.sender}">
        <div class="avatar">${avatar}</div>
        <div class="content">
          <div class="sender">${senderName}</div>
          <div class="text">${text}</div>
          ${attachments}
        </div>
      </div>
    `
  }).join('\n')

  return `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${conversation.title || 'Conversa'}</title>
      ${css}
    </head>
    <body>
      ${header}
      <div class="messages">
        ${messages}
      </div>
    </body>
    </html>
  `
}

// Função principal de exportação
export const exportConversations = async (
  conversations: UnifiedConversation[],
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
  const prepareConversationData = (conversation: UnifiedConversation) => {
    if (!includeMetadata) {
      return {
        messages: conversation.messages
      }
    }
    return conversation
  }

  // Divide as conversas em grupos
  const conversationGroups: Record<string, UnifiedConversation[]> = {}
  
  if (separateBySource) {
    conversations.forEach(conv => {
      const source = conv.source || 'unknown'
      if (!conversationGroups[source]) {
        conversationGroups[source] = []
      }
      conversationGroups[source].push(conv)
    })
  } else {
    conversationGroups['all'] = conversations
  }

  const exportedFiles: string[] = []

  // Processa cada grupo
  await Promise.all(Object.entries(conversationGroups).map(async ([source, groupConvs]) => {
    if (!groupConvs || groupConvs.length === 0) return

    // Divide em chunks do tamanho especificado
    const chunks = Array.from({ 
      length: Math.ceil(groupConvs.length / maxConversationsPerFile) 
    }).map((_, index) => groupConvs.slice(
      index * maxConversationsPerFile,
      (index + 1) * maxConversationsPerFile
    ))

    // Array para coletar arquivos antes de decidir se usa ZIP
    const filesToExport: Array<{
      name: string
      content: string
      type: string
    }> = []

    // Processa cada chunk
    chunks.forEach((chunk, index) => {
      // Nome do arquivo com formato apenas quando for dentro do ZIP
      const fileName = separateBySource
        ? `${baseFileName}_${source}_${index + 1}.${format}`
        : `${baseFileName}_${index + 1}.${format}`

      // Cria o conteúdo do arquivo baseado no formato
      let content: string
      const mimeType = {
        'json': 'application/json',
        'md': 'text/markdown',
        'html': 'text/html'
      }[format]

      switch (format) {
        case 'json':
          content = JSON.stringify(chunk.map(prepareConversationData), null, 2)
          break
        case 'md':
          const index = chunk.map((conv, i) => 
            `${i + 1}. [${conv.title || 'Conversa sem título'}](#conversa-${i + 1})`
          ).join('\n')
          const conversations = chunk.map((conv, i) => 
            `<a id="conversa-${i + 1}"></a>\n\n${conversationToMarkdown(conv)}`
          ).join('\n\n---\n\n')
          content = [
            '# Índice\n',
            index,
            '\n---\n\n',
            conversations
          ].join('\n')
          break
        case 'html':
          content = chunk.map(conversationToHTML).join('\n\n')
          break
      }

      filesToExport.push({
        name: `${format}_${fileName}`,
        content,
        type: mimeType
      })

      // Se for apenas um arquivo, fazer download direto
      if (filesToExport.length === 1) {
        const file = filesToExport[0]
        const blob = new Blob([file.content], { type: file.type })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        // Usa o nome original sem o formato no prefixo
        a.download = file.name.replace(`${format}_`, '') // Removemos o prefixo do formato
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
      }
    })

    // Decide se usa ZIP baseado no número de arquivos
    if (filesToExport.length > 1) {
      // Cria um ZIP com todos os arquivos (os arquivos dentro já têm o formato no nome)
      await createAndDownloadZip(
        filesToExport,
        `${baseFileName}.zip`, // Nome do ZIP sem o formato
        onProgress
      )
    }

    onComplete?.(filesToExport.map(f => f.name))
  }))
} 