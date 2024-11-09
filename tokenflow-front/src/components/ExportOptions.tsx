import { Button, Input, Select, SelectItem, Checkbox } from "@nextui-org/react"
import { useStore } from "@/store/useStore"
import { filterConversations } from "@/utils/filterConversations"
import { useState } from "react"

type ExportFormat = 'json' | 'jsonl'

interface ExportConfig {
  baseFileName: string
  maxConversationsPerFile: number
  includeMetadata: boolean
  separateBySource: boolean
  format: ExportFormat
}

interface ExportOptionsProps {
  onSuccess: () => void
}

export const ExportOptions = ({ onSuccess }: ExportOptionsProps) => {
  const { conversations, filters } = useStore()
  const filteredConversations = filterConversations(conversations, filters)
  
  const [exportConfig, setExportConfig] = useState<ExportConfig>({
    baseFileName: `conversations_${new Date().toLocaleDateString('pt-BR').replace(/\//g, '-')}`,
    maxConversationsPerFile: 100,
    includeMetadata: true,
    separateBySource: false,
    format: 'json'
  })

  const handleExport = () => {
    if (filteredConversations.length === 0) {
      alert('Não há conversas para exportar')
      return
    }

    exportConversations(filteredConversations, {
      ...exportConfig,
      onProgress: (progress) => {
        console.log('Progresso da exportação:', progress)
      },
      onComplete: (files) => {
        console.log('Arquivos exportados:', files)
        onSuccess()
      }
    })
  }

  return (
    <div className="space-y-4">
      <Input
        label="Nome base do arquivo"
        placeholder="Nome para os arquivos exportados"
        value={exportConfig.baseFileName}
        onChange={(e) => setExportConfig({
          ...exportConfig,
          baseFileName: e.target.value
        })}
      />

      <Select
        label="Conversas por arquivo"
        selectedKeys={[String(exportConfig.maxConversationsPerFile)]}
        onChange={(e) => setExportConfig({
          ...exportConfig,
          maxConversationsPerFile: Number(e.target.value)
        })}
      >
        <SelectItem key="50" value="50">50 conversas</SelectItem>
        <SelectItem key="100" value="100">100 conversas</SelectItem>
        <SelectItem key="200" value="200">200 conversas</SelectItem>
        <SelectItem key="500" value="500">500 conversas</SelectItem>
        <SelectItem key="1000" value="1000">1000 conversas</SelectItem>
      </Select>

      <Select
        label="Formato de exportação"
        selectedKeys={[exportConfig.format]}
        onChange={(e) => setExportConfig({
          ...exportConfig,
          format: e.target.value as ExportFormat
        })}
      >
        <SelectItem key="json" value="json">JSON (Padrão)</SelectItem>
        <SelectItem key="jsonl" value="jsonl">JSONL (Uma conversa por linha)</SelectItem>
      </Select>

      <div className="flex flex-col gap-2">
        <Checkbox
          isSelected={exportConfig.includeMetadata}
          onValueChange={(checked) => setExportConfig({
            ...exportConfig,
            includeMetadata: checked
          })}
        >
          Incluir metadados (data de criação, fonte, etc)
        </Checkbox>

        <Checkbox
          isSelected={exportConfig.separateBySource}
          onValueChange={(checked) => setExportConfig({
            ...exportConfig,
            separateBySource: checked
          })}
        >
          Separar por fonte (Claude/GPT)
        </Checkbox>
      </div>

      <div className="text-sm text-default-500">
        {filteredConversations.length} conversas serão exportadas em{' '}
        {Math.ceil(filteredConversations.length / exportConfig.maxConversationsPerFile)} arquivo(s)
      </div>

      <div className="flex justify-end gap-2 mt-4">
        <Button color="primary" onClick={handleExport}>
          Exportar
        </Button>
      </div>
    </div>
  )
} 