import { Input, Button, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Card } from '@nextui-org/react'
import { IconSearch, IconSortAscending, IconSortDescending, IconCalendar, IconMessages, IconStar, IconStarFilled, IconChevronDown, IconTags } from '@tabler/icons-react'
import { useState } from 'react'
import { useStore } from '@/components/store/useStore'
import { filterConversations } from '@/components/utils/filterConversations'
import { TagsFilter } from './TagsFilter'
import { DateRangeFilter } from './DateRangeFilter'

type SortDirection = 'asc' | 'desc'
interface SortState {
  date: SortDirection;
  messages: SortDirection;
}

export const FilterControls = () => {
  const { conversations, filters, favorites, toggleAllFavorites } = useStore()
  const [viewMode, setViewMode] = useState<'all' | 'favorites'>('all')
  const [sortState, setSortState] = useState<SortState>({
    date: 'desc',
    messages: 'desc'
  })

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
    <div className="space-y-4">
      {/* Linha 1: Filtros em Cards */}
      <div className="grid grid-cols-3 gap-4">
        {/* Card de Tags AND */}
        <Card className="p-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <IconTags size={18} />
              <h3 className="text-sm font-semibold">TODAS as tags (AND)</h3>
            </div>
            <TagsFilter 
              operator="AND"
              placeholder="Adicionar tag..."
            />
          </div>
        </Card>

        {/* Card de Tags OR */}
        <Card className="p-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <IconTags size={18} />
              <h3 className="text-sm font-semibold">QUALQUER tag (OR)</h3>
            </div>
            <TagsFilter 
              operator="OR"
              placeholder="Adicionar tag..."
            />
          </div>
        </Card>

        {/* Card de Período */}
        <Card className="p-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 mb-2">
              <IconCalendar size={18} />
              <h3 className="text-sm font-semibold">Período</h3>
            </div>
            <DateRangeFilter />
          </div>
        </Card>
      </div>

      {/* Linha 2: Busca, Visualização e Ordenação */}
      <div className="flex items-center gap-4">
        <Dropdown>
          <DropdownTrigger>
            <Button 
              variant="flat"
              size="md"
              endContent={<IconChevronDown size={18} />}
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

        <Input
          type="text"
          placeholder="Buscar em todos os campos..."
          startContent={<IconSearch size={18} />}
          size="md"
          className="flex-1"
        />

        <Button
          variant="flat"
          size="md"
          color="primary"
          startContent={allAreFavorited ? <IconStarFilled size={18} /> : <IconStar size={18} />}
          onClick={() => toggleAllFavorites(visibleConversations.map(c => c.id))}
        >
          {allAreFavorited ? 'Desfavoritar' : 'Favoritar'} Todos ({visibleConversations.length})
        </Button>

        <Button
          variant="flat"
          size="md"
          startContent={<IconCalendar size={18} />}
          endContent={sortState.date === 'desc' ? <IconSortDescending size={18} /> : <IconSortAscending size={18} />}
          onClick={() => toggleSort('date')}
        >
          Data
        </Button>
        <Button
          variant="flat"
          size="md"
          startContent={<IconMessages size={18} />}
          endContent={sortState.messages === 'desc' ? <IconSortDescending size={18} /> : <IconSortAscending size={18} />}
          onClick={() => toggleSort('messages')}
        >
          Mensagens
        </Button>
      </div>
    </div>
  )
} 