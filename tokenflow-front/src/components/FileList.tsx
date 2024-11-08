import { Card } from '@nextui-org/react'
import { useStore } from '@/store/useStore'

export const FileList = () => {
  const { files, removeFile, removeConversationsFromFile } = useStore()

  if (files.length === 0) return null

  const handleRemoveFile = (index: number) => {
    const file = files[index]
    removeFile(index)
    removeConversationsFromFile(file.name)
  }

  return (
    <div className="mt-4 space-y-2">
      {files.map((file: File, index: number) => (
        <Card key={index} className="p-4">
          <div className="flex justify-between items-center">
            <span>{file.name}</span>
            <button 
              onClick={() => handleRemoveFile(index)}
              className="text-danger"
            >
              Remover
            </button>
          </div>
        </Card>
      ))}
    </div>
  )
} 