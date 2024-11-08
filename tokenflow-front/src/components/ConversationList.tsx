import { Card } from '@nextui-org/react'
import { useStore } from '@/store/useStore'
import { filterConversations } from '@/utils/filterConversations'

export const ConversationList = () => {
  const { conversations, filters } = useStore()
  const filteredConversations = filterConversations(conversations, filters)

  if (filteredConversations.length === 0) {
    return (
      <Card className="p-4 mt-4">
        <p className="text-center text-gray-500">
          Nenhuma conversa encontrada com os filtros selecionados
        </p>
      </Card>
    )
  }

  return (
    <div className="mt-4 space-y-4">
      {filteredConversations.map(conversation => (
        <Card key={conversation.id} className="p-4">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">{conversation.title}</h3>
              <span className="text-sm text-gray-500">
                {new Date(conversation.created_at).toLocaleDateString('pt-BR')}
              </span>
            </div>
            
            <div className="space-y-2">
              {conversation.messages.map(message => (
                <div 
                  key={message.id}
                  className={`p-2 rounded ${
                    message.sender === 'human' 
                      ? 'bg-blue-100 ml-auto max-w-[80%]' 
                      : 'bg-gray-100 mr-auto max-w-[80%]'
                  }`}
                >
                  <p className="text-sm">{message.text}</p>
                  {message.attachments && message.attachments.length > 0 && (
                    <div className="mt-1 text-xs text-gray-500">
                      {message.attachments.map(att => (
                        <span key={att.file_name} className="mr-2">
                          📎 {att.file_name}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
} 