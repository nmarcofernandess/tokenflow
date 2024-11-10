'use client'

import { useState, useEffect } from 'react'
import { useStore } from "@/components/store/useStore"
import { Export } from "@/components/Export/Export"
import { Button, Switch, Popover, PopoverTrigger, PopoverContent } from '@nextui-org/react'
import { IconBrain, IconUpload, IconDownload, IconSun, IconMoon } from '@tabler/icons-react'

interface HeaderProps {
  onImportClick: () => void;
}

export const Header = ({ onImportClick }: HeaderProps) => {
  const { files } = useStore()
  const [isDark, setIsDark] = useState<boolean | null>(null)
  const [isExportOpen, setIsExportOpen] = useState(false)

  useEffect(() => {
    const darkMode = document.documentElement.classList.contains('dark')
    setIsDark(darkMode)
  }, [])

  const toggleTheme = () => {
    if (isDark === null) return
    const newTheme = !isDark
    setIsDark(newTheme)
    document.documentElement.classList.toggle('dark', newTheme)
  }

  if (isDark === null) {
    return null
  }

  return (
    <header className="h-16 border-b bg-background/70 backdrop-blur-md fixed top-0 w-full z-50">
      <div className="container mx-auto h-full flex items-center justify-between px-4">
        {/* Logo e Nome */}
        <div className="flex items-center gap-2">
          <div className="bg-primary p-2 rounded-lg">
            <IconBrain size={24} className="text-white" />
          </div>
          <span className="font-bold text-xl">TokenFlow</span>
        </div>

        {/* Ações */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 border-r border-divider pr-4 mr-4">
            <Button
              variant="flat"
              color="primary"
              size="md"
              startContent={<IconUpload size={18} />}
              onClick={onImportClick}
              className="min-w-[200px]"
            >
              Importar Arquivos {files.length > 0 && `(${files.length})`}
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

      <Export 
        isOpen={isExportOpen} 
        onClose={() => setIsExportOpen(false)} 
      />
    </header>
  )
} 