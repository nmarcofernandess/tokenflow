import { Input, Button, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from '@nextui-org/react'
import { IconSearch, IconSortAscending, IconSortDescending, IconCalendar, IconMessages, IconStar, IconStarFilled, IconChevronDown } from '@tabler/icons-react'
import { useState } from 'react'
import { useStore } from '@/store/useStore'
import { filterConversations } from '@/utils/filterConversations'

type SortDirection = 'asc' | 'desc'
interface SortState {
  date: SortDirection;
  messages: SortDirection;
}

export const SearchAndSort = () => {
  const { conversations, filters, favorites, toggleAllFavorites } = useStore()
  const [sortState, setSortState] = useState<SortState>({
    date: 'desc',
    messages: 'desc'
  })
  const [viewMode, setViewMode] = useState<'all' | 'favorites'>('all')

  const filteredConversations = filterConversations(conversations, filters)
  const visibleConversations = viewMode === 'all' 
    ? filteredConversations 
    : filteredConversations.filter(conv => favorites.has(conv.id))

  const allAreFavorited = visibleConversations.length > 0 && 
    visibleConversations.every(conv => favorites.has(conv.id))

  const toggleSort = (field: keyof SortState) => {
    setSortState(prev => ({
      ...prev,
      [field]: prev[field] === 'desc' ? 'asc' : 'desc'
    }))
  }

  return (
    <div className="flex justify-between items-center gap-4">
      {/* Controles à Esquerda */}
      <div className="flex items-center gap-2">
        {/* Dropdown Todos/Favoritos */}
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

        {/* Botão Favoritar Todos */}
        <Button
          variant="light"
          size="md"
          startContent={allAreFavorited ? <IconStarFilled size={16} /> : <IconStar size={16} />}
          onClick={() => toggleAllFavorites(visibleConversations.map(c => c.id))}
        >
          Favoritar Todos
        </Button>

        {/* Botões de Ordenação */}
        <Button
          size="md"
          variant="light"
          startContent={<IconCalendar size={16} />}
          endContent={sortState.date === 'desc' ? <IconSortDescending size={16} /> : <IconSortAscending size={16} />}
          onClick={() => toggleSort('date')}
        >
          Data
        </Button>
        <Button
          size="md"
          variant="light"
          startContent={<IconMessages size={16} />}
          endContent={sortState.messages === 'desc' ? <IconSortDescending size={16} /> : <IconSortAscending size={16} />}
          onClick={() => toggleSort('messages')}
        >
          Mensagens
        </Button>
      </div>

      {/* Campo de Busca à Direita */}
      <Input
        type="text"
        placeholder="Buscar em todos os campos..."
        startContent={<IconSearch size={18} />}
        size="md"
        className="w-80"
      />
    </div>
  )
} 