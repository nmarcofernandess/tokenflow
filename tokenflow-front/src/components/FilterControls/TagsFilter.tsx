import { Input, Button, Chip } from '@nextui-org/react'
import { IconTag, IconPlus } from '@tabler/icons-react'
import { useState } from 'react'
import { useStore } from '@/components/store/useStore'

interface TagsFilterProps {
  operator: 'AND' | 'OR'
  placeholder?: string
  autoCreate?: boolean
}

export const TagsFilter = ({ operator, placeholder = "Adicionar tag..." }: TagsFilterProps) => {
  const { filters, addTagFilter, removeTagFilter } = useStore()
  const [input, setInput] = useState('')

  const currentTags = filters.tagFilters.filter(filter => filter.operator === operator)

  const handleAddTag = () => {
    if (input.trim()) {
      addTagFilter({
        tag: input.trim(),
        operator
      })
      setInput('')
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleAddTag()
    }
  }

  return (
    <div className="space-y-3">
      {/* Input com botão de adicionar */}
      <div className="flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={placeholder}
          startContent={<IconTag size={16} className="text-default-400" />}
          size="sm"
          className="flex-1"
        />
        <Button
          isIconOnly
          size="sm"
          color="primary"
          onClick={handleAddTag}
          isDisabled={!input.trim()}
        >
          <IconPlus size={16} />
        </Button>
      </div>

      {/* Área de tags */}
      {currentTags.length > 0 && (
        <div className="flex flex-wrap gap-2 p-2 min-h-12 rounded-lg bg-default-100">
          {currentTags.map((filter, index) => (
            <Chip
              key={`${filter.tag}-${index}`}
              onClose={() => removeTagFilter(index)}
              variant="flat"
              color="primary"
              size="sm"
              className="transition-all hover:scale-105"
              classNames={{
                base: "cursor-pointer",
                content: "text-sm"
              }}
            >
              {filter.tag}
            </Chip>
          ))}
        </div>
      )}
    </div>
  )
} 