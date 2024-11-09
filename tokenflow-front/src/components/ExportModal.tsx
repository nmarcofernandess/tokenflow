import { Modal, ModalContent, ModalHeader, ModalBody } from "@nextui-org/react"
import { ExportOptions } from "./ExportOptions"

interface ExportModalProps {
  isOpen: boolean
  onClose: () => void
}

export const ExportModal = ({ isOpen, onClose }: ExportModalProps) => {
  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose}
      size="2xl"
    >
      <ModalContent>
        <ModalHeader>Exportar Conversas</ModalHeader>
        <ModalBody className="pb-6">
          <ExportOptions onSuccess={onClose} />
        </ModalBody>
      </ModalContent>
    </Modal>
  )
} 