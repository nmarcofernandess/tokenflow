'use client'

import { Input } from '@nextui-org/react'
import { IconSearch } from '@tabler/icons-react'
import { useStore } from '@/components/store/useStore'

export const ChatHeader = () => {
  const { selectedConversationId, conversations, searchInChat, setSearchInChat } = useStore()
  
  const selectedConversation = conversations.find(
    conv => conv.id === selectedConversationId
  )

  if (!selectedConversation) return null

  return (
    <div className="flex justify-between items-center p-4 border-b">
      <div className="flex items-center gap-4 flex-1">
        <div className="flex-1">
          <h2 className="text-xl font-bold">{selectedConversation.title}</h2>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-sm text-default-500">
              Criado em: {new Date(selectedConversation.created_at).toLocaleDateString('pt-BR')}
            </span>
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
  )
} 