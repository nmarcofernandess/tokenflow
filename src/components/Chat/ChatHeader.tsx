'use client'

import { Input, Chip } from '@nextui-org/react'
import { IconSearch } from '@tabler/icons-react'
import { useStore } from '@/components/store/useStore'
import { estimateTokens, formatTokenCount } from '@/utils/tokenCounter';

export const ChatHeader = () => {
  const { selectedConversationId, conversations, searchInChat, setSearchInChat } = useStore()
  
  const selectedConversation = conversations.find(
    conv => conv.id === selectedConversationId
  )

  if (!selectedConversation) return null

  const totalTokens = selectedConversation.messages.reduce((acc, msg) => acc + estimateTokens(msg.text), 0);

  return (
    <div className="flex justify-between items-center p-4 border-b">
      <div className="flex items-center gap-4 flex-1">
        <div className="flex-1">
          <h2 className="text-xl font-bold">{selectedConversation.title}</h2>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-sm text-default-500">
              Criado em: {new Date(selectedConversation.created_at).toLocaleDateString('pt-BR')}
            </span>
            <Chip variant="flat" size="sm" className="text-xs text-default-500">
              {formatTokenCount(totalTokens)}
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
  )
} 