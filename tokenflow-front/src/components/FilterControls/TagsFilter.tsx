import { Input, Button, Chip } from '@nextui-org/react'
import { IconTag, IconPlus } from '@tabler/icons-react'
import { useState, useRef } from 'react'
import { useStore } from '@/components/store/useStore'
import { useVirtualizer, VirtualItem } from '@tanstack/react-virtual'

interface TagsFilterProps {
  operator: 'AND' | 'OR'
  placeholder?: string
  autoCreate?: boolean
}

export const TagsFilter = ({ operator, placeholder = "Adicionar tag..." }: TagsFilterProps) => {
  const { filters, addTagFilter, removeTagFilter } = useStore()
  const [input, setInput] = useState('')

  const currentTags = filters.tagFilters.filter(filter => filter.operator === operator)

  const parentRef = useRef<HTMLDivElement>(null)
  
  const virtualizer = useVirtualizer({
    count: currentTags.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 32,
    overscan: 5
  })

  const handleAddTag = () => {
    if (input.trim()) {
      const tagExists = currentTags.some(
        tag => tag.tag.toLowerCase() === input.trim().toLowerCase()
      )

      if (!tagExists) {
        addTagFilter({
          tag: input.trim(),
          operator
        })
      }
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

      {/* Área de tags virtualizada */}
      {currentTags.length > 0 && (
        <div 
          ref={parentRef}
          className="flex flex-wrap gap-2 p-2 min-h-12 max-h-32 overflow-auto rounded-lg bg-default-100"
          style={{
            height: `${Math.min(currentTags.length * 32, 128)}px`
          }}
        >
          <div
            style={{
              height: `${virtualizer.getTotalSize()}px`,
              width: '100%',
              position: 'relative',
            }}
          >
            {virtualizer.getVirtualItems().map((virtualRow: VirtualItem) => (
              <div
                key={virtualRow.key}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: `${virtualRow.size}px`,
                  transform: `translateY(${virtualRow.start}px)`,
                }}
              >
                <Chip
                  key={`${currentTags[virtualRow.index].tag}-${virtualRow.index}`}
                  onClose={() => removeTagFilter(virtualRow.index, operator)}
                  variant="flat"
                  color="primary"
                  size="sm"
                >
                  {currentTags[virtualRow.index].tag}
                </Chip>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
} 