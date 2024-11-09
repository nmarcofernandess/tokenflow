import { Modal, ModalContent, ModalHeader, ModalBody } from "@nextui-org/react"
import { FileUpload } from "./FileUpload"

interface UploadModalProps {
  isOpen: boolean
  onClose: () => void
}

export const UploadModal = ({ isOpen, onClose }: UploadModalProps) => {
  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose}
      size="2xl"
    >
      <ModalContent>
        <ModalHeader>Upload de Arquivos</ModalHeader>
        <ModalBody className="pb-6">
          <FileUpload onSuccess={onClose} />
        </ModalBody>
      </ModalContent>
    </Modal>
  )
} 