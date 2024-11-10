import { Card, Chip, Divider } from '@nextui-org/react'
import { IconFileZip, IconBraces, IconMarkdown, IconCode } from '@tabler/icons-react'

interface ExportPreviewProps {
  totalConversations: number
  totalTokens: number
  conversationsPerFile: number
  totalFiles: number
  formats: string[]
  willZip: boolean
  scope: 'all' | 'favorites'
  availableConversations?: number
}

export const ExportPreview = ({
  totalConversations,
  totalTokens,
  conversationsPerFile,
  totalFiles,
  formats,
  willZip,
  scope,
  availableConversations
}: ExportPreviewProps) => {
  const formatIcons = {
    'json': <IconBraces size={16} />,
    'md': <IconMarkdown size={16} />,
    'html': <IconCode size={16} />
  }

  return (
    <Card className="bg-default-50">
      <div className="p-4">
        {/* Linha 1: Escopo, Formatos e ZIP */}
        <div className="flex items-center gap-2">
          <Chip 
            size="sm" 
            variant="flat" 
            color="primary"
            startContent={scope === 'favorites' ? '⭐' : '📁'}
          >
            {scope === 'all' ? 'Todas as conversas' : 'Apenas favoritas'}
          </Chip>
          {formats.map(format => (
            <Chip 
              key={format}
              size="sm" 
              variant="flat"
              startContent={formatIcons[format as keyof typeof formatIcons]}
            >
              {format.toUpperCase()}
            </Chip>
          ))}
          {willZip && (
            <Chip 
              size="sm" 
              color="warning" 
              variant="flat"
              startContent={<IconFileZip size={16} />}
              className="ml-auto"
            >
              Será exportado como ZIP
            </Chip>
          )}
        </div>

        <Divider className="my-3" />

        {/* Linha 2: Informações principais em grid */}
        <div className="grid grid-cols-4 gap-4">
          <div>
            <p className="text-sm text-default-500">Total de conversas</p>
            <p className="text-base font-medium">
              {totalConversations.toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-sm text-default-500">Total de tokens</p>
            <p className="text-base font-medium">
              {(totalTokens / 1000).toFixed(1)}k
            </p>
          </div>
          <div>
            <p className="text-sm text-default-500">Conversas/arquivo</p>
            <p className="text-base font-medium">{conversationsPerFile}</p>
          </div>
          <div>
            <p className="text-sm text-default-500">Arquivos por formato</p>
            <p className="text-base font-medium text-primary">
              {totalFiles}
            </p>
          </div>
        </div>
      </div>
    </Card>
  )
} 