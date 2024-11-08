import { Card, Button } from '@nextui-org/react'
import { useState } from 'react'
import { DateRangeFilter } from './DateRangeFilter'
import { TagsFilter } from './TagsFilter'
import { IconChevronDown, IconChevronUp, IconFilter } from '@tabler/icons-react'

interface FiltersSectionProps {
  title: string;
  operator?: 'AND' | 'OR';
  type?: 'tags' | 'date';
}

export const FiltersSection = ({ title, operator = 'AND', type = 'tags' }: FiltersSectionProps) => {
  const [isExpanded, setIsExpanded] = useState(true)

  return (
    <Card className="w-full">
      <Button
        className="w-full flex justify-between items-center px-4 py-3"
        variant="light"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          <IconFilter size={18} />
          <span className="font-medium">{title}</span>
        </div>
        {isExpanded ? <IconChevronUp size={18} /> : <IconChevronDown size={18} />}
      </Button>

      {isExpanded && (
        <div className="p-4">
          {type === 'date' ? (
            <DateRangeFilter />
          ) : (
            <TagsFilter operator={operator} />
          )}
        </div>
      )}
    </Card>
  )
} 