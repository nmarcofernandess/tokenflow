import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Button, Input } from '@nextui-org/react'
import { IconStar, IconStarFilled, IconChevronDown, IconSearch } from '@tabler/icons-react'
import { useStore } from '@/store/useStore'
import { filterConversations } from '@/utils/filterConversations'
import { useState } from 'react'

export const ConversationsHeader = () => {
  const { conversations, filters, favorites, toggleAllFavorites, selectedConversationId, searchInChat, setSearchInChat } = useStore()
  const [viewMode, setViewMode] = useState<'all' | 'favorites'>('all')
  
  const filteredConversations = filterConversations(conversations, filters)
  const visibleConversations = viewMode === 'all' 
    ? filteredConversations 
    : filteredConversations.filter(conv => favorites.has(conv.id))

  const allAreFavorited = visibleConversations.length > 0 && 
    visibleConversations.every(conv => favorites.has(conv.id))

  const selectedConversation = conversations.find(conv => conv.id === selectedConversationId)

  return (
    <div className="flex items-center gap-4 mb-4">
      {/* Área de Todos/Favoritos */}
      <div className="flex items-center gap-2">
        <Dropdown>
          <DropdownTrigger>
            <Button 
              variant="light" 
              size="sm"
              endContent={<IconChevronDown size={16} />}
            >
              {viewMode === 'all' ? 'Todos' : 'Favoritos'} ({visibleConversations.length})
            </Button>
          </DropdownTrigger>
          <DropdownMenu
            selectedKeys={[viewMode]}
            onSelectionChange={(keys) => setViewMode(Array.from(keys)[0] as 'all' | 'favorites')}
          >
            <DropdownItem key="all">Todos</DropdownItem>
            <DropdownItem key="favorites">Favoritos</DropdownItem>
          </DropdownMenu>
        </Dropdown>

        <Button
          variant="light"
          size="sm"
          startContent={allAreFavorited ? <IconStarFilled size={16} /> : <IconStar size={16} />}
          onClick={() => toggleAllFavorites(visibleConversations.map(c => c.id))}
        >
          {allAreFavorited ? 'Desfavoritar Todos' : 'Favoritar Todos'}
        </Button>
      </div>

      {/* Título da Conversa Selecionada */}
      {selectedConversation && (
        <div className="flex-1">
          <h2 className="text-xl font-bold">{selectedConversation.title}</h2>
          <p className="text-sm text-default-500">
            Criado em: {new Date(selectedConversation.created_at).toLocaleDateString('pt-BR')}
          </p>
        </div>
      )}

      {/* Busca */}
      <Input
        type="text"
        placeholder="Buscar nesta conversa..."
        size="sm"
        startContent={<IconSearch size={16} />}
        value={searchInChat}
        onChange={(e) => setSearchInChat(e.target.value)}
        className="w-64"
      />
    </div>
  )
} 