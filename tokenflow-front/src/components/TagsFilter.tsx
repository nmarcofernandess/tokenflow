import { Card, Input, Button, Chip } from '@nextui-org/react'
import { useStore } from '@/store/useStore'
import { useState } from 'react'
import { IconTag } from '@tabler/icons-react'

interface TagsFilterProps {
  operator: 'AND' | 'OR';
}

export const TagsFilter = ({ operator }: TagsFilterProps) => {
  const { filters, addTagFilter, removeTagFilter } = useStore()
  const [newTag, setNewTag] = useState('')

  const handleAddTag = () => {
    if (newTag.trim()) {
      addTagFilter({
        tag: newTag.trim(),
        operator: operator // Usando o operator recebido via props
      })
      setNewTag('')
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Input
          value={newTag}
          onChange={(e) => setNewTag(e.target.value)}
          placeholder="Adicionar tag..."
          size="sm"
          startContent={<IconTag size={16} />}
          onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
        />
        <Button
          color="primary"
          size="sm"
          onClick={handleAddTag}
          isDisabled={!newTag.trim()}
        >
          Adicionar
        </Button>
      </div>

      {filters.tagFilters.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {filters.tagFilters.map((filter, index) => (
            <Chip
              key={index}
              onClose={() => removeTagFilter(index)}
              variant="flat"
              color="secondary"
              size="sm"
            >
              {filter.tag}
            </Chip>
          ))}
        </div>
      )}
    </div>
  )
} 