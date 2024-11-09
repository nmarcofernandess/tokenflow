import { Card, Chip } from '@nextui-org/react'
import { IconBrain, IconRobot } from '@tabler/icons-react'
import { useStore } from '@/store/useStore'
import type { UnifiedConversation } from '@/types/chat'

export const ImportedFiles = () => {
  const { files, fileConversations, removeFile } = useStore()

  // Conta quantas conversas cada arquivo tem
  const getConversationCount = (fileName: string) => {
    return fileConversations[fileName]?.conversations.length || 0
  }

  // Identifica quais IAs estão presentes no arquivo
  const getAITypes = (fileName: string) => {
    const conversations = fileConversations[fileName]?.conversations || []
    const types = new Set(conversations.map((conv: UnifiedConversation) => conv.source))
    return Array.from(types)
  }

  return (
    <div className="space-y-2">
      {files.map((file, index) => (
        <Card key={index} className="p-3 bg-default-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-medium">{file.name}</span>
              <span className="text-xs text-default-500">
                ({(file.size / (1024 * 1024)).toFixed(2)} MB)
              </span>
            </div>
            <button 
              onClick={() => removeFile(index)}
              className="text-danger text-sm"
            >
              Remover
            </button>
          </div>
          <div className="flex items-center gap-2 mt-2">
            {getAITypes(file.name).map((type, i) => (
              <Chip
                key={i}
                size="sm"
                variant="flat"
                color={type === 'gpt' ? 'primary' : 'warning'}
                startContent={type === 'gpt' ? <IconBrain size={14} /> : <IconRobot size={14} />}
              >
                {type === 'gpt' ? 'GPT' : 'Claude'}
              </Chip>
            ))}
            <Chip size="sm" variant="flat">
              {getConversationCount(file.name)} conversas
            </Chip>
          </div>
        </Card>
      ))}
    </div>
  )
} 