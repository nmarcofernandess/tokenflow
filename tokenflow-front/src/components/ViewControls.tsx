import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Button, Input } from '@nextui-org/react'
import { IconSearch, IconStar, IconStarFilled, IconChevronDown } from '@tabler/icons-react'
import { useStore } from '@/store/useStore'
import { filterConversations } from '@/utils/filterConversations'
import { useState } from 'react'

export const ViewControls = () => {
  const { conversations, filters, favorites, toggleAllFavorites, searchInChat, setSearchInChat } = useStore()
  const [viewMode, setViewMode] = useState<'all' | 'favorites'>('all')
  
  const filteredConversations = filterConversations(conversations, filters)
  const visibleConversations = viewMode === 'all' 
    ? filteredConversations 
    : filteredConversations.filter(conv => favorites.has(conv.id))

  const allAreFavorited = visibleConversations.length > 0 && 
    visibleConversations.every(conv => favorites.has(conv.id))

  return (
    <div className="flex items-center gap-4 mb-4">
      <div className="flex items-center gap-2">
        <Dropdown>
          <DropdownTrigger>
            <Button 
              variant="light" 
              size="md"
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
          size="md"
          startContent={allAreFavorited ? <IconStarFilled size={16} /> : <IconStar size={16} />}
          onClick={() => toggleAllFavorites(visibleConversations.map(c => c.id))}
        >
          Favoritar Todos
        </Button>
      </div>

      <Input
        type="text"
        placeholder="Buscar em todos os campos..."
        size="md"
        startContent={<IconSearch size={16} />}
        value={searchInChat}
        onChange={(e) => setSearchInChat(e.target.value)}
        className="w-64"
      />
    </div>
  )
} 