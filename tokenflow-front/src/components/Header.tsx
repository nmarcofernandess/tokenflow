import { Button, Switch } from "@nextui-org/react"
import { IconUpload, IconDownload, IconSun, IconMoon, IconBrain, IconChevronUp, IconChevronDown } from "@tabler/icons-react"
import { useState, useEffect, useRef } from 'react'
import { useStore } from "@/store/useStore"
import { ExportModal } from "./ExportModal"
import { UploadSection } from "./UploadSection"

export const Header = () => {
  const { files, fileConversations } = useStore()
  const [isDark, setIsDark] = useState(false)
  const [isUploadOpen, setIsUploadOpen] = useState(false)
  const [isExportOpen, setIsExportOpen] = useState(false)
  const uploadSectionRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const isDarkMode = document.documentElement.classList.contains('dark')
    setIsDark(isDarkMode)

    // Handler para fechar ao clicar fora
    const handleClickOutside = (event: MouseEvent) => {
      if (isUploadOpen && 
          uploadSectionRef.current && 
          !uploadSectionRef.current.contains(event.target as Node) &&
          !(event.target as Element).closest('button')?.id === 'upload-button') {
        setIsUploadOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isUploadOpen])

  const toggleTheme = () => {
    const newTheme = !isDark
    setIsDark(newTheme)
    document.documentElement.classList.toggle('dark')
  }

  // Estatísticas
  const stats = {
    totalFiles: files.length,
    totalConversations: Object.values(fileConversations).reduce(
      (acc, file) => acc + file.conversations.length, 
      0
    )
  }

  return (
    <>
      <header className="h-16 border-b bg-background/70 backdrop-blur-md fixed top-0 w-full z-50">
        <div className="container mx-auto h-full flex items-center justify-between px-4">
          {/* Logo e Nome */}
          <div className="flex items-center gap-2">
            <div className="bg-primary p-2 rounded-lg">
              <IconBrain size={24} className="text-white" />
            </div>
            <span className="font-bold text-xl">TokenFlow</span>
          </div>

          {/* Ações Principais */}
          <div className="flex items-center gap-4">
            {/* Botões Principais */}
            <div className="flex items-center gap-2 border-r border-divider pr-4 mr-4">
              <Button
                id="upload-button"
                variant="flat"
                color="primary"
                size="md"
                startContent={<IconUpload size={18} />}
                endContent={isUploadOpen ? <IconChevronUp size={18} /> : <IconChevronDown size={18} />}
                onClick={() => setIsUploadOpen(!isUploadOpen)}
                className="min-w-[200px]"
              >
                Importar Arquivos {stats.totalFiles > 0 && `(${stats.totalFiles})`}
              </Button>

              <Button
                variant="flat"
                color="primary"
                size="md"
                startContent={<IconDownload size={18} />}
                onClick={() => setIsExportOpen(true)}
                className="min-w-[200px]"
              >
                Exportar Arquivos
              </Button>
            </div>

            {/* Tema */}
            <Switch
              isSelected={isDark}
              size="lg"
              color="primary"
              startContent={<IconSun size={18} />}
              endContent={<IconMoon size={18} />}
              onValueChange={toggleTheme}
            />
          </div>
        </div>
      </header>

      {/* Seção de Upload Expansível */}
      {isUploadOpen && (
        <div 
          ref={uploadSectionRef}
          className="fixed top-16 left-0 w-full bg-background/95 backdrop-blur-md border-b z-40 transition-all duration-200 ease-in-out"
        >
          <div className="container mx-auto p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Gerenciar Arquivos</h2>
              <Button
                isIconOnly
                variant="light"
                onClick={() => setIsUploadOpen(false)}
              >
                <IconChevronUp size={20} />
              </Button>
            </div>
            <UploadSection onClose={() => setIsUploadOpen(false)} />
          </div>
        </div>
      )}

      {/* Modal de Exportação */}
      <ExportModal 
        isOpen={isExportOpen} 
        onClose={() => setIsExportOpen(false)}
      />
    </>
  )
} 