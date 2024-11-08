import { Card } from '@nextui-org/react'
import { useStore } from '@/store/useStore'

export const ChatView = () => {
  const { conversations, selectedConversationId } = useStore()
  
  const selectedConversation = conversations.find(
    conv => conv.id === selectedConversationId
  )

  if (!selectedConversation) {
    return (
      <Card className="h-[calc(100vh-200px)] flex items-center justify-center">
        <p className="text-default-500">
          Selecione uma conversa para visualizar
        </p>
      </Card>
    )
  }

  return (
    <Card className="h-[calc(100vh-200px)] p-4">
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="border-b pb-4 mb-4">
          <h2 className="text-xl font-bold">{selectedConversation.title}</h2>
          <p className="text-sm text-default-500">
            Criado em: {new Date(selectedConversation.created_at).toLocaleDateString('pt-BR')}
          </p>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto space-y-4">
          {selectedConversation.messages.map(message => (
            <div
              key={message.id}
              className={`flex ${message.sender === 'human' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`
                  max-w-[80%] p-3 rounded-lg
                  ${message.sender === 'human' 
                    ? 'bg-primary text-white rounded-br-none' 
                    : 'bg-default-100 rounded-bl-none'}
                `}
              >
                <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                {message.attachments && message.attachments.length > 0 && (
                  <div className="mt-2 space-x-2">
                    {message.attachments.map(att => (
                      <span 
                        key={att.file_name}
                        className="text-xs opacity-70"
                      >
                        📎 {att.file_name}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  )
} 