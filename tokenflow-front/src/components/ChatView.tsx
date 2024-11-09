import { Card, Input, Button, Chip } from '@nextui-org/react'
import { useStore } from '@/store/useStore'
import { IconSearch, IconStar, IconStarFilled } from '@tabler/icons-react'

export const ChatView = () => {
  const { conversations, selectedConversationId, searchInChat, setSearchInChat, favorites, toggleFavorite } = useStore()
  
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
    <Card className="h-[calc(100vh-200px)]">
      {/* Header */}
      <div className="flex justify-between items-center p-4 border-b">
        <div className="flex items-center gap-4 flex-1">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold">{selectedConversation.title}</h2>
              <Button
                isIconOnly
                variant="light"
                size="sm"
                onClick={() => toggleFavorite(selectedConversation.id)}
              >
                {favorites.has(selectedConversation.id) 
                  ? <IconStarFilled size={16} className="text-warning" />
                  : <IconStar size={16} />
                }
              </Button>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-sm text-default-500">
                Criado em: {new Date(selectedConversation.created_at).toLocaleDateString('pt-BR')}
              </span>
              <Chip
                size="sm"
                variant="flat"
                color={selectedConversation.source === 'gpt' ? 'primary' : 'warning'}
              >
                {selectedConversation.source}
              </Chip>
              <Chip size="sm" variant="flat">
                {selectedConversation.messages.length} msgs
              </Chip>
            </div>
          </div>
          <Input
            type="text"
            placeholder="Buscar nesta conversa..."
            size="md"
            startContent={<IconSearch size={16} />}
            value={searchInChat}
            onChange={(e) => setSearchInChat(e.target.value)}
            className="w-64"
          />
        </div>
      </div>

      {/* Mensagens */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
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
    </Card>
  )
} 