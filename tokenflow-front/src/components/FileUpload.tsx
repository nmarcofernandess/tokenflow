import { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Card } from '@nextui-org/react'
import { useStore } from '@/store/useStore'
import { detectAndConvertConversation } from '@/utils/conversationConverter'

const CHUNK_SIZE = 1024 * 1024 * 10 // 10MB chunks

export const FileUpload = () => {
  const { addFiles, setConversations, setLoading, setLoadingMessage } = useStore()

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
    } catch (error) {
      console.error('Erro ao processar arquivos:', error)
      alert('Erro ao processar um ou mais arquivos. Verifique o formato.')
    } finally {
      setLoading(false)
      setLoadingMessage('')
    }
  }, [addFiles, setConversations, setLoading, setLoadingMessage])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/json': ['.json']
    },
    maxSize: 1024 * 1024 * 200 // 200MB max
  })

  return (
    <div {...getRootProps()}>
      <Card className="w-full h-48 flex items-center justify-center cursor-pointer border-2 border-dashed">
        <input {...getInputProps()} />
        <div className="text-center">
          <span className="block">
            {isDragActive
              ? 'Solte os arquivos aqui...'
              : 'Arraste arquivos JSON ou clique para selecionar'}
          </span>
          <span className="text-sm text-default-500 mt-2">
            Tamanho máximo: 200MB
          </span>
        </div>
      </Card>
    </div>
  )
} 