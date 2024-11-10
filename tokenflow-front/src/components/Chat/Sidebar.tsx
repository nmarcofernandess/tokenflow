'use client'

import { Card, Chip, Button } from '@nextui-org/react'
import { useStore } from '@/components/store/useStore'
import { filterConversations } from '@/components/utils/filterConversations'
import { IconStar, IconStarFilled } from '@tabler/icons-react'

export const Sidebar = () => {
  const { conversations, filters, setSelectedConversation, selectedConversationId, favorites, toggleFavorite } = useStore()
  
  // Ordena todas as conversas por data
  const sortedConversations = [...conversations].sort((a, b) => 
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  const filteredConversations = filterConversations(sortedConversations, filters)

  return (
    <Card className="h-[calc(100vh-200px)]">
      <div className="p-4 space-y-4 h-full overflow-y-auto">
        {filteredConversations.map((conversation) => (
          <div
            key={conversation.id}
            className={`p-4 rounded-lg cursor-pointer transition-all hover:bg-default-100 ${
              selectedConversationId === conversation.id ? 'bg-default-100' : ''
            }`}
            onClick={() => setSelectedConversation(conversation.id)}
          >
            <div className="flex items-center justify-between">
              <h3 className="font-medium">{conversation.title}</h3>
              <IconStar
                size={18}
                className={favorites.has(conversation.id) ? 'text-warning' : ''}
                onClick={(e) => {
                  e.stopPropagation()
                  toggleFavorite(conversation.id)
                }}
              />
            </div>

            <div className="flex items-center gap-2 mt-2">
              <Chip 
                size="sm" 
                variant="flat" 
                color={conversation.source === 'claude' ? 'secondary' : 'primary'}
              >
                {conversation.source.toUpperCase()}
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