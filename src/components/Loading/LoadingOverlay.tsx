'use client'

import { Modal, Spinner } from "@nextui-org/react"
import { useStore } from "@/components/store/useStore"

export const LoadingOverlay = () => {
  const { isLoading, loadingMessage } = useStore()

  return (
    <Modal 
      isOpen={isLoading} 
      hideCloseButton
      isDismissable={false}
      classNames={{
        base: "bg-transparent shadow-none",
        backdrop: "bg-background/90"
      }}
    >
      <div className="flex flex-col items-center gap-4 p-6">
        <Spinner 
          size="lg" 
          color="primary"
          classNames={{
            circle1: "border-3",
            circle2: "border-3"
          }}
        />
        <div className="text-center">
          <p className="text-default-600 font-medium">
            {loadingMessage || 'Processando arquivo...'}
          </p>
          <p className="text-default-400 text-sm mt-1">
            Por favor, aguarde.
          </p>
        </div>
      </div>
    </Modal>
  )
} 