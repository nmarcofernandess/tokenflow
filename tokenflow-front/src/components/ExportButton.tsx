import { useState } from 'react'
import { Button, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Input, Select, SelectItem, Checkbox } from '@nextui-org/react'
import { useStore } from '@/store/useStore'
import { filterConversations } from '@/utils/filterConversations'
import { exportConversations } from '@/utils/exportConversations'

type ExportFormat = 'json' | 'jsonl'

interface ExportConfig {
  baseFileName: string;
  maxConversationsPerFile: number;
  includeMetadata: boolean;
  separateBySource: boolean;
  format: ExportFormat;
}

export const ExportButton = () => {
  const { conversations, filters } = useStore()
  const filteredConversations = filterConversations(conversations, filters)
  const [isOpen, setIsOpen] = useState(false)
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
        setIsOpen(false)
      }
    })
  }

  return (
    <>
      <Button 
        color="primary"
        onClick={() => setIsOpen(true)}
        isDisabled={filteredConversations.length === 0}
        className="mt-4"
      >
        Exportar Conversas Filtradas ({filteredConversations.length})
      </Button>

      <Modal 
        isOpen={isOpen} 
        onOpenChange={setIsOpen}
        size="lg"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Configurações de Exportação
              </ModalHeader>
              <ModalBody>
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
                      onValueChange={(checked: boolean) => setExportConfig({
                        ...exportConfig,
                        includeMetadata: checked
                      })}
                    >
                      Incluir metadados (data de criação, fonte, etc)
                    </Checkbox>

                    <Checkbox
                      isSelected={exportConfig.separateBySource}
                      onValueChange={(checked: boolean) => setExportConfig({
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
                </div>
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Cancelar
                </Button>
                <Button color="primary" onPress={handleExport}>
                  Exportar
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  )
} 