import { Card, Chip } from '@nextui-org/react'
import { useStore } from '@/store/useStore'
import { filterConversations } from '@/utils/filterConversations'

export const ConversationSidebar = () => {
  const { conversations, filters, setSelectedConversation, selectedConversationId } = useStore()
  const filteredConversations = filterConversations(conversations, filters)

  return (
    <Card className="h-[calc(100vh-400px)] overflow-y-auto">
      <div className="p-2 space-y-1">
        {filteredConversations.map(conversation => (
          <div
            key={conversation.id}
            onClick={() => setSelectedConversation(conversation.id)}
            className={`
              p-3 rounded-lg cursor-pointer transition-colors
              ${selectedConversationId === conversation.id 
                ? 'bg-primary/10 border-primary' 
                : 'hover:bg-default-100 border-transparent'}
              border
            `}
          >
            <h3 className="font-medium text-lg mb-1.5 line-clamp-2">
              {conversation.title}
            </h3>

            <div className="flex items-center gap-2">
              <Chip
                size="sm"
                variant="flat"
                color={conversation.source === 'gpt' ? 'primary' : 'warning'}
              >
                {conversation.source}
              </Chip>

              <Chip size="sm" variant="flat">
                {conversation.messages.length} msgs
              </Chip>

              <span className="text-xs text-default-500 ml-auto">
                {new Date(conversation.created_at).toLocaleDateString('pt-BR')}
              </span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
} 