'use client'

import { useState } from 'react'
import { useStore } from "@/components/store/useStore"
import { Export } from "@/components/Export/Export"
import { FileManagement } from "@/components/FileManagement/FileManagement"
import { Button, Switch, Popover, PopoverTrigger, PopoverContent } from '@nextui-org/react'
import { IconBrain, IconUpload, IconDownload, IconSun, IconMoon, IconChevronUp, IconChevronDown } from '@tabler/icons-react'

export const Header = () => {
  const { files } = useStore()
  const [isDark, setIsDark] = useState(true)
  const [isUploadOpen, setIsUploadOpen] = useState(false)
  const [isExportOpen, setIsExportOpen] = useState(false)

  const toggleTheme = () => {
    const newTheme = !isDark
    setIsDark(newTheme)
    document.documentElement.classList.toggle('dark', newTheme)
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

          {/* Ações */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 border-r border-divider pr-4 mr-4">
              <Popover placement="bottom">
                <PopoverTrigger>
                  <Button
                    variant="flat"
                    color="primary"
                    size="md"
                    startContent={<IconUpload size={18} />}
                    endContent={isUploadOpen ? <IconChevronUp size={18} /> : <IconChevronDown size={18} />}
                    onClick={() => setIsUploadOpen(!isUploadOpen)}
                    className="min-w-[200px]"
                  >
                    Importar Arquivos {files.length > 0 && `(${files.length})`}
                  </Button>
                </PopoverTrigger>
                <PopoverContent>
                  <div className="p-4 w-[800px]">
                    <FileManagement onClose={() => setIsUploadOpen(false)} />
                  </div>
                </PopoverContent>
              </Popover>

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
      </header>

      <Export 
        isOpen={isExportOpen} 
        onClose={() => setIsExportOpen(false)} 
      />
    </>
  )
} 