import JSZip from 'jszip'

interface FileToZip {
  name: string
  content: string
  type: string
}

export async function createAndDownloadZip(
  files: FileToZip[],
  zipName: string,
  onProgress?: (progress: number) => void
): Promise<void> {
  const zip = new JSZip()

  // Adiciona cada arquivo ao ZIP
  files.forEach(file => {
    zip.file(file.name, file.content)
  })

  // Gera o ZIP com progresso
  const blob = await zip.generateAsync(
    { 
      type: 'blob',
      compression: 'DEFLATE',
      compressionOptions: { level: 6 }
    },
    (metadata) => {
      if (onProgress) {
        onProgress(metadata.percent)
      }
    }
  )

  // Cria e clica no link de download
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = zipName
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
} 