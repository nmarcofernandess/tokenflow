import { Modal, Spinner } from "@nextui-org/react"
import { useStore } from "@/store/useStore"

export const LoadingOverlay = () => {
  const { isLoading, loadingMessage } = useStore()

  return (
    <Modal 
      isOpen={isLoading} 
      hideCloseButton
      isDismissable={false}
      className="bg-transparent shadow-none"
    >
      <div className="flex flex-col items-center gap-4">
        <Spinner size="lg" color="primary" />
        <p className="text-default-500 text-center">
          {loadingMessage || 'Processando arquivo...'}
          <br />
          Por favor, aguarde.
        </p>
      </div>
    </Modal>
  )
} 