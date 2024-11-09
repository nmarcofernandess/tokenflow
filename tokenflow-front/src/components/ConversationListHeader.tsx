import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Button } from '@nextui-org/react'
import { IconStar, IconStarFilled, IconChevronDown } from '@tabler/icons-react'
import { useStore } from '@/store/useStore'
import { filterConversations } from '@/utils/filterConversations'
import { useState } from 'react'

export const ConversationListHeader = () => {
  const { conversations, filters, favorites, toggleAllFavorites } = useStore()
  const [viewMode, setViewMode] = useState<'all' | 'favorites'>('all')
  
  const filteredConversations = filterConversations(conversations, filters)
  const visibleConversations = viewMode === 'all' 
    ? filteredConversations 
    : filteredConversations.filter(conv => favorites.has(conv.id))

  const allAreFavorited = visibleConversations.length > 0 && 
    visibleConversations.every(conv => favorites.has(conv.id))

  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2">
        <h2 className="text-xl font-semibold">
          {viewMode === 'all' ? 'Todos' : 'Favoritos'} ({visibleConversations.length})
        </h2>
        <Dropdown>
          <DropdownTrigger>
            <Button 
              variant="light" 
              size="sm"
              endContent={<IconChevronDown size={16} />}
            >
              {viewMode === 'all' ? 'Todos' : 'Favoritos'}
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
      </div>

      <Button
        variant="light"
        size="sm"
        startContent={allAreFavorited ? <IconStarFilled size={16} /> : <IconStar size={16} />}
        onClick={() => toggleAllFavorites(visibleConversations.map(c => c.id))}
      >
        {allAreFavorited ? 'Desfavoritar Todos' : 'Favoritar Todos'}
      </Button>
    </div>
  )
} 