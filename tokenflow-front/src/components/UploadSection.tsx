import { Card, Button, Divider } from '@nextui-org/react'
import { useState } from 'react'
import { FileUpload } from './FileUpload'
import { FileList } from './FileList'
import { IconChevronDown, IconChevronUp, IconUpload } from '@tabler/icons-react'

export const UploadSection = () => {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <Card className="mb-4">
      <Button
        className="w-full flex justify-between items-center px-4 py-3"
        variant="light"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          <IconUpload size={18} />
          <span className="font-medium">Upload de Arquivos</span>
        </div>
        {isExpanded ? <IconChevronUp size={18} /> : <IconChevronDown size={18} />}
      </Button>

      {isExpanded && (
        <div className="p-4">
          <FileUpload />
          <Divider className="my-4" />
          <FileList />
        </div>
      )}
    </Card>
  )
} 