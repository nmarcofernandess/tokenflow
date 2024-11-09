import { Card } from '@nextui-org/react'
import { DateRangeFilter } from './DateRangeFilter'
import { TagsFilter } from './TagsFilter'

export const FilterGroup = () => {
  return (
    <Card className="p-4">
      <div className="grid grid-cols-3 gap-4">
        {/* TODAS as tags */}
        <div>
          <h3 className="text-sm font-semibold mb-2">TODAS as tags</h3>
          <TagsFilter 
            operator="AND"
            autoCreate={true}
            placeholder="Digite tags (AND)..."
          />
        </div>

        {/* QUALQUER tag */}
        <div>
          <h3 className="text-sm font-semibold mb-2">QUALQUER tag</h3>
          <TagsFilter 
            operator="OR"
            autoCreate={true}
            placeholder="Digite tags (OR)..."
          />
        </div>

        {/* Período */}
        <div>
          <h3 className="text-sm font-semibold mb-2">Período</h3>
          <DateRangeFilter />
        </div>
      </div>
    </Card>
  )
} 