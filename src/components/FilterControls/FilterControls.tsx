import { Input, Button, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Card } from '@nextui-org/react'
import { IconSearch, IconSortAscending, IconSortDescending, IconCalendar, IconMessages, IconStar, IconStarFilled, IconChevronDown, IconTags } from '@tabler/icons-react'
import { useState } from 'react'
import { useStore } from '@/components/store/useStore'
import { TagsFilter } from './TagsFilter'
import { DateRangeFilter } from './DateRangeFilter'

export const FilterControls = () => {
  const { 
    favorites, 
    toggleAllFavorites,
    search,
    setSearch,
    sortConfig,
    setSortConfig,
    viewMode,
    setViewMode
  } = useStore()
  
  // Usar diretamente o resultado filtrado do store
  const filteredConversations = useStore(state => state.getFilteredConversations())
  
  const allAreFavorited = filteredConversations.length > 0 && 
    filteredConversations.every(conv => favorites.has(conv.id))

  const toggleSort = (field: 'date' | 'messages') => {
    setSortConfig({
      field,
      direction: sortConfig.field === field && sortConfig.direction === 'desc' ? 'asc' : 'desc'
    })
  }

  const handleViewModeChange = (keys: any) => {
    const newMode = Array.from(keys)[0] as 'all' | 'favorites'
    console.log('Mudando viewMode para:', newMode)
    setViewMode(newMode)
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
            aria-label="Modo de visualização"
            selectionMode="single"
            selectedKeys={new Set([viewMode])}
            onSelectionChange={handleViewModeChange}
          >
            <DropdownItem key="all">Todos</DropdownItem>
            <DropdownItem key="favorites">Favoritos</DropdownItem>
          </DropdownMenu>
        </Dropdown>

        <Input
          type="text"
          placeholder="Buscar em títulos e conteúdo das mensagens..."
          startContent={<IconSearch size={18} />}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          size="md"
          className="flex-1"
        />

        <Button
          variant="flat"
          size="md"
          color="primary"
          startContent={allAreFavorited ? <IconStarFilled size={18} /> : <IconStar size={18} />}
          onClick={() => toggleAllFavorites(filteredConversations.map(c => c.id))}
        >
          {allAreFavorited ? 'Desfavoritar' : 'Favoritar'} Todos ({filteredConversations.length})
        </Button>

        <Button
          variant="flat"
          size="md"
          startContent={<IconCalendar size={18} />}
          endContent={sortConfig.direction === 'desc' 
            ? <IconSortDescending size={18} /> 
            : <IconSortAscending size={18} />}
          onClick={() => toggleSort('date')}
          className={`
            transition-colors
            ${sortConfig.field === 'date' 
              ? 'bg-primary/10 hover:bg-primary/20' 
              : 'hover:bg-default-100'}
          `}
        >
          Data {sortConfig.direction === 'asc' ? '(Antigas)' : '(Recentes)'}
        </Button>

        <Button
          variant="flat"
          size="md"
          startContent={<IconMessages size={18} />}
          endContent={sortConfig.direction === 'desc' 
            ? <IconSortDescending size={18} /> 
            : <IconSortAscending size={18} />}
          onClick={() => toggleSort('messages')}
          className={`
            transition-colors
            ${sortConfig.field === 'messages' 
              ? 'bg-primary/10 hover:bg-primary/20' 
              : 'hover:bg-default-100'}
          `}
        >
          Mensagens {sortConfig.direction === 'asc' ? '(Menos)' : '(Mais)'}
        </Button>
      </div>
    </div>
  )
} 