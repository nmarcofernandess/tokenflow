import { Card, Button } from '@nextui-org/react'
import { useState } from 'react'
import { IconChevronDown, IconChevronUp, IconSettings } from '@tabler/icons-react'
import { DateRangeFilter } from './DateRangeFilter'
import { TagsFilter } from './TagsFilter'
import { FileUpload } from './FileUpload'
import { FileList } from './FileList'

export const ConfigSection = () => {
  const [isExpanded, setIsExpanded] = useState(true)

  return (
    <Card className="mb-4">
      <Button
        className="w-full flex justify-between items-center px-4 py-3"
        variant="light"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          <IconSettings size={18} />
          <span className="font-medium">Configurações de Filtro</span>
        </div>
        {isExpanded ? <IconChevronUp size={18} /> : <IconChevronDown size={18} />}
      </Button>

      {isExpanded && (
        <div className="p-4">
          <div className="grid grid-cols-3 gap-4">
            {/* Upload de Arquivos */}
            <Card className="p-4">
              <h3 className="text-sm font-semibold mb-2">Upload de Arquivos</h3>
              <FileUpload />
              <div className="mt-4">
                <FileList />
              </div>
            </Card>

            {/* Tags Combinadas */}
            <Card className="p-4">
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-semibold mb-2">TODAS as tags</h3>
                  <TagsFilter 
                    operator="AND"
                    autoCreate={true}
                    placeholder="Digite tags (AND)..."
                  />
                </div>
                <div>
                  <h3 className="text-sm font-semibold mb-2">QUALQUER tag</h3>
                  <TagsFilter 
                    operator="OR"
                    autoCreate={true}
                    placeholder="Digite tags (OR)..."
                  />
                </div>
              </div>
            </Card>

            {/* Período */}
            <Card className="p-4">
              <h3 className="text-sm font-semibold mb-2">Período</h3>
              <DateRangeFilter />
            </Card>
          </div>
        </div>
      )}
    </Card>
  )
} 