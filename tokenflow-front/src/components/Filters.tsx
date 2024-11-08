import { useState, useMemo } from 'react'
import { Card, Input, Button, Select, SelectItem, Chip, Divider } from '@nextui-org/react'
import { useStore } from '@/store/useStore'
import { TagFilter } from '@/types/filters'
import { IconChevronDown, IconChevronUp, IconCalendar, IconTag } from '@tabler/icons-react'

export const Filters = () => {
  const { filters, setDateFilter, addTagFilter, removeTagFilter } = useStore()
  const [isExpanded, setIsExpanded] = useState(true)
  const [newTag, setNewTag] = useState('')
  const [tagOperator, setTagOperator] = useState<'AND' | 'OR'>('AND')

  // Calcula o range de datas disponível
  const dateRange = useMemo(() => {
    const now = new Date()
    const monthsAgo = new Date()
    monthsAgo.setMonth(monthsAgo.getMonth() - 24) // 24 meses atrás
    return { start: monthsAgo, end: now }
  }, [])

  const handleDateChange = (type: 'start' | 'end', date: string) => {
    setDateFilter({
      ...filters.dateFilter,
      [type === 'start' ? 'startDate' : 'endDate']: date ? new Date(date).toISOString() : null
    })
  }

  const handleAddTag = () => {
    if (newTag.trim()) {
      addTagFilter({
        tag: newTag.trim(),
        operator: tagOperator
      })
      setNewTag('')
    }
  }

  const activeDateRange = filters.dateFilter.startDate || filters.dateFilter.endDate
    ? `${filters.dateFilter.startDate 
        ? new Date(filters.dateFilter.startDate).toLocaleDateString('pt-BR')
        : 'Início'} até ${
        filters.dateFilter.endDate
          ? new Date(filters.dateFilter.endDate).toLocaleDateString('pt-BR')
          : 'Fim'}`
    : null

  return (
    <Card className="p-4">
      {/* Cabeçalho com Toggle */}
      <div 
        className="flex items-center justify-between cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-bold">Filtros</h2>
          <div className="flex gap-2">
            {activeDateRange && (
              <Chip 
                size="sm" 
                variant="flat" 
                color="primary"
                startContent={<IconCalendar size={14} />}
              >
                {activeDateRange}
              </Chip>
            )}
            {filters.tagFilters.length > 0 && (
              <Chip 
                size="sm" 
                variant="flat" 
                color="secondary"
                startContent={<IconTag size={14} />}
              >
                {filters.tagFilters.length} tag{filters.tagFilters.length !== 1 ? 's' : ''}
              </Chip>
            )}
          </div>
        </div>
        {isExpanded ? <IconChevronUp size={20} /> : <IconChevronDown size={20} />}
      </div>

      {/* Conteúdo Colapsável */}
      {isExpanded && (
        <div className="mt-4 space-y-6">
          {/* Filtro de Data */}
          <div>
            <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
              <IconCalendar size={16} />
              Período
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <Input
                type="date"
                label="Data Inicial"
                placeholder="Selecione"
                value={filters.dateFilter.startDate 
                  ? new Date(filters.dateFilter.startDate).toISOString().split('T')[0]
                  : ''
                }
                onChange={(e) => handleDateChange('start', e.target.value)}
                min={dateRange.start.toISOString().split('T')[0]}
                max={dateRange.end.toISOString().split('T')[0]}
              />
              <Input
                type="date"
                label="Data Final"
                placeholder="Selecione"
                value={filters.dateFilter.endDate
                  ? new Date(filters.dateFilter.endDate).toISOString().split('T')[0]
                  : ''
                }
                onChange={(e) => handleDateChange('end', e.target.value)}
                min={filters.dateFilter.startDate || dateRange.start.toISOString().split('T')[0]}
                max={dateRange.end.toISOString().split('T')[0]}
              />
            </div>
          </div>

          <Divider />

          {/* Filtro de Tags */}
          <div>
            <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
              <IconTag size={16} />
              Tags
            </h3>
            <div className="space-y-4">
              {/* Input de Tags */}
              <div className="flex gap-2">
                <Input
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="Digite uma tag..."
                  className="flex-1"
                  onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                />
                <Select 
                  value={tagOperator}
                  onChange={(e) => setTagOperator(e.target.value as 'AND' | 'OR')}
                  className="w-24"
                >
                  <SelectItem key="AND" value="AND">AND</SelectItem>
                  <SelectItem key="OR" value="OR">OR</SelectItem>
                </Select>
                <Button 
                  color="primary"
                  onClick={handleAddTag}
                  isDisabled={!newTag.trim()}
                >
                  Adicionar
                </Button>
              </div>

              {/* Lista de Tags */}
              {filters.tagFilters.length > 0 && (
                <div className="flex flex-wrap gap-2 p-2 bg-default-100 rounded-lg">
                  {filters.tagFilters.map((filter: TagFilter, index: number) => (
                    <Chip
                      key={index}
                      onClose={() => removeTagFilter(index)}
                      variant="flat"
                      color="secondary"
                      className="h-auto py-1"
                    >
                      <div className="flex items-center gap-1">
                        <span>{filter.tag}</span>
                        <span className="text-tiny opacity-70 bg-default-200 px-1 rounded">
                          {filter.operator}
                        </span>
                      </div>
                    </Chip>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </Card>
  )
} 