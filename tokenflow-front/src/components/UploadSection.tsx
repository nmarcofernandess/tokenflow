import { Card } from '@nextui-org/react'
import { FileUpload } from './FileUpload'
import { ImportedFiles } from './ImportedFiles'
import { useStore } from '@/store/useStore'

interface UploadSectionProps {
  onClose?: () => void;
}

export const UploadSection = ({ onClose }: UploadSectionProps) => {
  const { files } = useStore()

  return (
    <div className="flex gap-4">
      {/* Área de Upload */}
      <Card className="flex-[3] p-4">
        <FileUpload onSuccess={onClose} />
      </Card>

      {/* Lista de Arquivos */}
      {files.length > 0 && (
        <Card className="flex-[2]">
          <div className="p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-semibold">Arquivos Importados</h3>
              <span className="text-sm text-default-500">
                {files.length} arquivo{files.length !== 1 ? 's' : ''}
              </span>
            </div>
            <ImportedFiles />
          </div>
        </Card>
      )}
    </div>
  )
} 