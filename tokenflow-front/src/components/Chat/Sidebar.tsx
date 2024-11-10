'use client'

import { Card, Chip, Button } from '@nextui-org/react'
import { useStore } from '@/components/store/useStore'
import { filterConversations } from '@/components/utils/filterConversations'
import { IconStar, IconStarFilled } from '@tabler/icons-react'

export const Sidebar = () => {
  const { conversations, filters, setSelectedConversation, selectedConversationId, favorites, toggleFavorite } = useStore()
  const filteredConversations = filterConversations(conversations, filters)

  return (
    <Card className="h-[calc(100vh-200px)]">
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
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
            <div className="flex items-center justify-between gap-2">
              <h3 className="font-medium text-lg truncate flex-1">
                {conversation.title}
              </h3>
              <Button
                isIconOnly
                variant="light"
                size="sm"
                className="min-w-unit-8 flex-none"
                onClick={(e) => {
                  e.stopPropagation()
                  toggleFavorite(conversation.id)
                }}
              >
                {favorites.has(conversation.id) 
                  ? <IconStarFilled size={16} className="text-warning" />
                  : <IconStar size={16} />
                }
              </Button>
            </div>

            <div className="flex items-center gap-2 mt-2">
              <Chip size="sm" variant="flat" color="primary">
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