'use client'

import { useState } from 'react'
import { 
  Button, 
  Modal, 
  ModalContent, 
  ModalHeader, 
  ModalBody,
  ModalFooter,
  Input,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Slider,
  Chip
} from '@nextui-org/react'
import { IconDownload, IconChevronDown } from '@tabler/icons-react'
import { useStore } from '@/components/store/useStore'
import { exportConversations } from '@/components/utils/exportConversations'
import { conversationsInterpreter, tokensInterpreter } from '@/utils/sliderInterpreter'
import { ExportPreview } from './ExportPreview'
import { estimateTokens } from '@/utils/tokenCounter'

type ExportFormat = 'json' | 'md' | 'html'
type ExportMode = 'conversations' | 'tokens'

interface ExportConfig {
  baseFileName: string
  formats: ExportFormat[]
  mode: ExportMode
  conversationsLimit: number
  tokensLimit: number
  scope: 'all' | 'favorites'
}

interface ExportProps {
  isOpen: boolean
  onClose: () => void
}

const CONVERSATIONS_PRESETS = [1, 2, 3, 4, 5, 10, 20, 30, 50, 100, 200, 500, 1000]
const TOKENS_PRESETS = [1000, 2000, 4000, 8000, 16000, 32000]

interface ExportStats {
  totalConversations: number
  totalFiles: number
  conversationsPerFile: number
}

// Presets para conversas por arquivo
const CONVERSATIONS_STEPS = [
  // 1 em 1 até 5
  1, 2, 3, 4, 5,
  // 5 em 5 até 50
  10, 15, 20, 25, 30, 35, 40, 45, 50,
  // 10 em 10 até 100
  60, 70, 80, 90, 100,
  // 50 em 50 até 500
  150, 200, 250, 300, 350, 400, 450, 500,
  // 100 em 100 até 1000
  600, 700, 800, 900, 1000
]

// Presets para tokens (em milhares)
const TOKENS_STEPS = [
  // 1k em 1k até 5k
  1, 2, 3, 4, 5,
  // 5k em 5k até 50k
  10, 15, 20, 25, 30, 35, 40, 45, 50,
  // 10k em 10k até 200k
  60, 70, 80, 90, 100, 110, 120, 130, 140, 150, 160, 170, 180, 190, 200
]

export const Export = ({ isOpen, onClose }: ExportProps) => {
  const { conversations, favorites } = useStore()
  const [exportConfig, setExportConfig] = useState<ExportConfig>({
    baseFileName: `conversations_${new Date().toLocaleDateString('pt-BR').replace(/\//g, '-')}`,
    formats: ['json'],
    mode: 'conversations',
    conversationsLimit: 100,
    tokensLimit: 4000,
    scope: 'all'
  })
  const [isExporting, setIsExporting] = useState(false)
  const [exportProgress, setExportProgress] = useState(0)

  const handleExport = async () => {
    setIsExporting(true)
    setExportProgress(0)

    try {
      // Filtra as conversas baseado no escopo
      const conversationsToExport = exportConfig.scope === 'favorites'
        ? conversations.filter(c => favorites.has(c.id))
        : conversations

      // Exporta para cada formato selecionado
      for (const format of exportConfig.formats) {
        await exportConversations(conversationsToExport, {
          baseFileName: exportConfig.baseFileName,
          maxConversationsPerFile: exportConfig.conversationsLimit, // Usar o limite como tamanho do chunk
          includeMetadata: false,
          separateBySource: false,
          format,
          onProgress: (progress) => setExportProgress(progress),
          onComplete: (files) => {
            console.log(`Exportação concluída: ${files.join(', ')}`)
          }
        })
      }
    } catch (error) {
      console.error('Erro na exportação:', error)
    } finally {
      setIsExporting(false)
      setExportProgress(0)
      onClose()
    }
  }

  const toggleFormat = (format: ExportFormat) => {
    setExportConfig(prev => ({
      ...prev,
      formats: prev.formats.includes(format)
        ? prev.formats.filter(f => f !== format)
        : [...prev.formats, format]
    }))
  }

  const getConversationsCount = () => {
    const availableConversations = exportConfig.scope === 'favorites' 
      ? conversations.filter(c => favorites.has(c.id))
      : conversations

    return Math.min(
      availableConversations.length,
      exportConfig.mode === 'conversations' 
        ? exportConfig.conversationsLimit 
        : Math.ceil(exportConfig.tokensLimit / 1000)
    )
  }

  // Função para calcular estatísticas de exportação
  const getExportStats = () => {
    const conversationsToExport = exportConfig.scope === 'favorites'
      ? conversations.filter(c => favorites.has(c.id))
      : conversations

    const totalConversations = conversationsToExport.length
    const totalTokens = conversationsToExport.reduce((acc, conv) => 
      acc + conv.messages.reduce((msgAcc, msg) => 
        msgAcc + estimateTokens(msg.text), 0
      ), 0
    )
    
    const conversationsPerFile = exportConfig.conversationsLimit
    const totalFiles = Math.ceil(totalConversations / conversationsPerFile)
    const willZip = totalFiles > 1

    return {
      totalConversations,
      totalTokens,
      conversationsPerFile,
      totalFiles,
      willZip
    }
  }

  // Função para encontrar o step mais próximo
  const findNearestStep = (value: number, steps: number[]) => {
    return steps.reduce((prev, curr) => 
      Math.abs(curr - value) < Math.abs(prev - value) ? curr : prev
    )
  }

  // Função para formatar valor de tokens
  const formatTokenValue = (value: number) => {
    if (value < 1000) return `${value}`
    return `${value/1000}k`
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="2xl">
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          Configurações de Exportação
        </ModalHeader>
        
        <ModalBody>
          <div className="space-y-6">
            {/* Nome do arquivo */}
            <Input
              label="Nome base do arquivo"
              placeholder="Nome para os arquivos exportados"
              value={exportConfig.baseFileName}
              onChange={(e) => setExportConfig({
                ...exportConfig,
                baseFileName: e.target.value
              })}
            />

            {/* Escopo e Formato */}
            <div className="flex gap-4">
              <div className="flex-1">
                <Dropdown>
                  <DropdownTrigger>
                    <Button 
                      variant="flat" 
                      className="w-full"
                      endContent={<IconChevronDown size={18} />}
                    >
                      {exportConfig.scope === 'all' ? 'Todas as conversas' : 'Apenas favoritas'}
                    </Button>
                  </DropdownTrigger>
                  <DropdownMenu
                    aria-label="Escopo da exportação"
                    selectedKeys={[exportConfig.scope]}
                    onSelectionChange={(keys) => setExportConfig({
                      ...exportConfig,
                      scope: Array.from(keys)[0] as 'all' | 'favorites'
                    })}
                    selectionMode="single"
                  >
                    <DropdownItem key="all">Todas as conversas</DropdownItem>
                    <DropdownItem key="favorites">Apenas favoritas</DropdownItem>
                  </DropdownMenu>
                </Dropdown>
              </div>

              <div className="flex-1 flex gap-2">
                <Button
                  className="flex-1"
                  color={exportConfig.formats.includes('json') ? 'primary' : 'default'}
                  variant={exportConfig.formats.includes('json') ? 'solid' : 'flat'}
                  onClick={() => toggleFormat('json')}
                >
                  JSON
                </Button>
                <Button
                  className="flex-1"
                  color={exportConfig.formats.includes('md') ? 'primary' : 'default'}
                  variant={exportConfig.formats.includes('md') ? 'solid' : 'flat'}
                  onClick={() => toggleFormat('md')}
                >
                  Markdown
                </Button>
                <Button
                  className="flex-1"
                  color={exportConfig.formats.includes('html') ? 'primary' : 'default'}
                  variant={exportConfig.formats.includes('html') ? 'solid' : 'flat'}
                  onClick={() => toggleFormat('html')}
                >
                  HTML
                </Button>
              </div>
            </div>

            {/* Sliders */}
            <div className="grid grid-cols-2 gap-8">
              {/* Slider de Conversas */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-default-700">Conversas por arquivo</span>
                  <span className="text-sm font-medium text-default-700">
                    {exportConfig.conversationsLimit}
                  </span>
                </div>
                <Slider 
                  aria-label="Conversas por arquivo"
                  size="lg"
                  step={25}
                  showSteps={false}
                  maxValue={conversationsInterpreter.getMaxSliderValue()}
                  minValue={conversationsInterpreter.getMinSliderValue()}
                  value={conversationsInterpreter.getReverseValue(exportConfig.conversationsLimit)}
                  onChange={(value) => {
                    const interpretedValue = conversationsInterpreter.interpretValue(Number(value))
                    setExportConfig({
                      ...exportConfig,
                      conversationsLimit: interpretedValue
                    })
                  }}
                  classNames={{
                    base: "max-w-full",
                    track: "bg-default-500/30",
                    filler: "bg-primary",
                    thumb: "bg-primary shadow-medium",
                  }}
                />
              </div>

              {/* Slider de Tokens */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-default-700">Limite de tokens</span>
                  <span className="text-sm font-medium text-default-700">
                    {`${(exportConfig.tokensLimit / 1000)}k`}
                  </span>
                </div>
                <Slider 
                  aria-label="Limite de tokens"
                  size="lg"
                  step={25}
                  showSteps={false}
                  maxValue={tokensInterpreter.getMaxSliderValue()}
                  minValue={tokensInterpreter.getMinSliderValue()}
                  value={tokensInterpreter.getReverseValue(exportConfig.tokensLimit / 1000)}
                  onChange={(value) => {
                    const interpretedValue = tokensInterpreter.interpretValue(Number(value))
                    setExportConfig({
                      ...exportConfig,
                      tokensLimit: interpretedValue * 1000
                    })
                  }}
                  classNames={{
                    base: "max-w-full",
                    track: "bg-default-500/30",
                    filler: "bg-primary",
                    thumb: "bg-primary shadow-medium",
                  }}
                />
              </div>
            </div>

            {/* Substituir o resumo antigo pelo novo preview */}
            <ExportPreview
              {...getExportStats()}
              formats={exportConfig.formats}
              scope={exportConfig.scope}
              availableConversations={conversations.length}
            />
          </div>
        </ModalBody>

        <ModalFooter>
          <Button color="danger" variant="light" onPress={onClose}>
            Cancelar
          </Button>
          <Button 
            color="primary" 
            onPress={handleExport}
            startContent={<IconDownload size={18} />}
            isDisabled={exportConfig.formats.length === 0 || isExporting}
            isLoading={isExporting}
          >
            {isExporting 
              ? `Exportando (${Math.round(exportProgress * 100)}%)`
              : `Exportar ${getExportStats().totalFiles * exportConfig.formats.length} arquivo(s)`
            }
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
