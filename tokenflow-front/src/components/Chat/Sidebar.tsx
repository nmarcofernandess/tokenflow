'use client'

import { Card, Chip } from '@nextui-org/react'
import { useStore } from '@/components/store/useStore'
import { IconStar } from '@tabler/icons-react'
import { useState, useRef, useEffect } from 'react'

export const Sidebar = () => {
  const [page, setPage] = useState(1)
  const itemsPerPage = 20
  
  const { 
    favorites, 
    toggleFavorite, 
    selectedConversationId, 
    setSelectedConversation
  } = useStore()
  
  // Usar diretamente o resultado filtrado e ordenado do store
  const filteredConversations = useStore(state => state.getFilteredConversations())

  // Aplicar apenas paginação
  const paginatedConversations = filteredConversations.slice(0, page * itemsPerPage)

  // Usar IntersectionObserver para infinite scroll
  const loadMoreRef = useRef<HTMLDivElement>(null)
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && paginatedConversations.length < filteredConversations.length) {
          setPage(p => p + 1)
        }
      },
      { threshold: 0.1 }
    )

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current)
    }

    return () => observer.disconnect()
  }, [paginatedConversations.length, filteredConversations.length])

  // Reset da paginação quando mudam os filtros
  useEffect(() => {
    setPage(1)
  }, [filteredConversations])

  return (
    <Card className="h-[calc(100vh-200px)]">
      <div className="p-4 space-y-4 h-full overflow-y-auto">
        {paginatedConversations.map((conversation) => (
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
                className={favorites.has(conversation.id) ? 'text-warning fill-warning' : ''}
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
        <div ref={loadMoreRef} className="h-4" />
      </div>
    </Card>
  )
} 