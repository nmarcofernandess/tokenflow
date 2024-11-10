'use client'

import { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Card, Chip } from '@nextui-org/react'
import { IconBrain, IconRobot } from '@tabler/icons-react'
import { useStore } from '@/components/store/useStore'
import { detectAndConvertConversation } from '@/components/utils/conversationConverter'
import type { UnifiedConversation } from '@/components/types/chat'

const CHUNK_SIZE = 1024 * 1024 * 10 // 10MB

interface FileManagementProps {
  onClose?: () => void
}

export const FileManagement = ({ onClose }: FileManagementProps) => {
  const { 
    files, 
    addFiles, 
    removeFile,
    setConversations,
    fileConversations,
    setLoading,
    setLoadingMessage 
  } = useStore()

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

  const processFileInChunks = async (file: File) => {
    const fileReader = new FileReader()
    let offset = 0
    let result = ''
    const totalChunks = Math.ceil(file.size / CHUNK_SIZE)
    let currentChunk = 0

    const readChunk = (file: File, offset: number): Promise<string> => {
      return new Promise((resolve, reject) => {
        const chunk = file.slice(offset, offset + CHUNK_SIZE)
        fileReader.onload = (e) => resolve(e.target?.result as string)
        fileReader.onerror = reject
        fileReader.readAsText(chunk)
      })
    }

    while (offset < file.size) {
      currentChunk++
      setLoadingMessage(
        `Processando arquivo ${file.name}: ${Math.round((currentChunk/totalChunks) * 100)}%`
      )
      const chunk = await readChunk(file, offset)
      result += chunk
      offset += CHUNK_SIZE
    }

    return result
  }

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    setLoading(true)
    addFiles(acceptedFiles)

    try {
      for (const file of acceptedFiles) {
        setLoadingMessage(`Iniciando processamento do arquivo: ${file.name}`)
        
        const text = file.size > CHUNK_SIZE 
          ? await processFileInChunks(file)
          : await file.text()

        setLoadingMessage(`Convertendo arquivo: ${file.name}`)
        const jsonData = JSON.parse(text)
        
        let conversations = []
        if (Array.isArray(jsonData)) {
          setLoadingMessage(`Processando ${jsonData.length} conversas de ${file.name}`)
          conversations = await Promise.all(
            jsonData.map(async (conv, index) => {
              setLoadingMessage(
                `Processando conversa ${index + 1} de ${jsonData.length} do arquivo ${file.name}`
              )
              return detectAndConvertConversation(conv)
            })
          )
        } else {
          setLoadingMessage(`Processando conversa única do arquivo ${file.name}`)
          conversations = [detectAndConvertConversation(jsonData)]
        }

        setConversations(conversations, file.name)
      }

      setLoadingMessage('Finalizando processamento...')
      await new Promise(resolve => setTimeout(resolve, 500))
      onClose?.()
    } catch (error) {
      console.error('Erro ao processar arquivos:', error)
      alert('Erro ao processar um ou mais arquivos. Verifique o formato.')
    } finally {
      setLoading(false)
      setLoadingMessage('')
    }
  }, [addFiles, setConversations, setLoading, setLoadingMessage, onClose])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/json': ['.json']
    },
    maxSize: 1024 * 1024 * 200 // 200MB max
  })

  return (
    <div className="w-full flex flex-col gap-4">
      {/* Área de Upload */}
      <div {...getRootProps()}>
        <div className="w-full h-48 flex items-center justify-center cursor-pointer border-2 border-dashed rounded-xl border-default-200 hover:border-primary transition-colors">
          <input {...getInputProps()} />
          <div className="text-center">
            <span className="block text-lg">
              {isDragActive
                ? 'Solte os arquivos aqui...'
                : 'Arraste arquivos JSON ou clique para selecionar'}
            </span>
            <span className="text-sm text-default-500 mt-2">
              Tamanho máximo: 200MB
            </span>
          </div>
        </div>
      </div>

      {/* Lista de Arquivos */}
      {files.length > 0 && (
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Arquivos Importados</h3>
            <span className="text-sm text-default-500">
              {files.length} arquivo{files.length !== 1 ? 's' : ''}
            </span>
          </div>
          
          <div className="space-y-2">
            {files.map((file, index) => (
              <div key={index} className="p-4 rounded-xl bg-default-100">
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
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
} 