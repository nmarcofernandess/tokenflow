'use client'

import { useCallback, useState, useEffect } from 'react'
import { useDropzone } from 'react-dropzone'
import { Card, Chip, Button } from '@nextui-org/react'
import { IconBrain, IconRobot } from '@tabler/icons-react'
import { useStore } from '@/components/store/useStore'
import { detectAndConvertConversation } from '@/components/utils/conversationConverter'
import type { UnifiedConversation } from '@/components/types/chat'
import type { ConversionResult } from '@/components/utils/conversationConverter'

const CHUNK_SIZE = 1024 * 1024 * 10 // 10MB

// Novo componente para o card de log
const StatsCard = () => {
  const { fileConversations, getGlobalDateRange } = useStore();
  const globalDateRange = getGlobalDateRange();

  // Usa funções do store para cálculos globais
  const globalStats = {
    totalChats: Object.values(fileConversations).reduce(
      (sum, data) => sum + data.metadata.totalChats, 
      0
    ),
    sources: new Set(
      Object.values(fileConversations).map(data => data.metadata.source)
    ),
    dateRange: globalDateRange
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <Card className="p-4 mt-4">
      <h3 className="text-lg font-semibold mb-4">Estatísticas dos Arquivos</h3>
      
      {/* Stats por arquivo */}
      <div className="space-y-4">
        {Object.entries(fileConversations).map(([fileId, data]) => (
          <div key={fileId} className="border-b pb-2">
            <h4 className="font-medium">{data.fileName}</h4>
            <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
              <div>IA: {data.metadata.source.toUpperCase()}</div>
              <div>Total de Chats: {data.metadata.totalChats}</div>
              <div>Data mais antiga: {formatDate(new Date(data.metadata.dateRange.firstDate))}</div>
              <div>Data mais recente: {formatDate(new Date(data.metadata.dateRange.lastDate))}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Stats globais */}
      <div className="mt-4 pt-4 border-t">
        <h4 className="font-medium mb-2">Estatísticas Globais</h4>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>Total de Chats: {globalStats.totalChats}</div>
          <div>IAs: {Array.from(globalStats.sources).map(s => s.toUpperCase()).join(', ')}</div>
          <div>Data mais antiga: {formatDate(globalStats.dateRange.min)}</div>
          <div>Data mais recente: {formatDate(globalStats.dateRange.max)}</div>
        </div>
      </div>
    </Card>
  );
};

// Novo componente para debug
const DebugCard = () => {
  const { fileConversations } = useStore();

  // Extrai apenas as metadatas dos arquivos
  const metadatas = Object.entries(fileConversations).map(([fileId, data]) => ({
    fileId,
    fileName: data.fileName,
    metadata: data.metadata
  }));

  return (
    <Card className="p-4 mt-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Debug - Metadatas</h3>
      </div>

      <div className="space-y-4">
        {metadatas.map(({ fileId, fileName, metadata }, index) => (
          <div 
            key={fileId} 
            className="p-3 rounded bg-default-50"
          >
            <div className="font-medium text-sm mb-2">📄 {fileName}</div>
            <pre className="text-xs whitespace-pre-wrap">
              {JSON.stringify({
                fileId,
                source: metadata.source,
                totalChats: metadata.totalChats,
                dateRange: {
                  firstDate: new Date(metadata.dateRange.firstDate).toLocaleDateString('pt-BR'),
                  lastDate: new Date(metadata.dateRange.lastDate).toLocaleDateString('pt-BR')
                }
              }, null, 2)}
            </pre>
          </div>
        ))}
      </div>

      {metadatas.length === 0 && (
        <div className="text-center text-default-500 py-4">
          Nenhum arquivo processado ainda
        </div>
      )}
    </Card>
  );
};

export const FileManagement = () => {
  const { 
    files, 
    addFiles, 
    removeFile,
    setConversations,
    fileConversations,
    setLoading,
    setLoadingMessage,
    fileStats
  } = useStore()

  const processFileInChunks = async (file: File) => {
    const fileReader = new FileReader()
    let offset = 0
    let result = ''
    const totalChunks = Math.ceil(file.size / CHUNK_SIZE)
    let currentChunk = 0

    const readChunk = (file: File, offset: number): Promise<string> => {
      return new Promise((resolve, reject) => {
        const chunk = file.slice(offset, offset + CHUNK_SIZE)
        fileReader.onload = (e) => resolve(e.target?.result as string)
        fileReader.onerror = reject
        fileReader.readAsText(chunk)
      })
    }

    while (offset < file.size) {
      currentChunk++
      setLoadingMessage(
        `Processando arquivo ${file.name}: ${Math.round((currentChunk/totalChunks) * 100)}%`
      )
      const chunk = await readChunk(file, offset)
      result += chunk
      offset += CHUNK_SIZE
    }

    return result
  }

  const processFile = async (file: File) => {
    try {
      setLoading(true);
      setLoadingMessage(`Processando arquivo ${file.name}...`);

      console.log('Processando arquivo:', file.name);

      const content = await processFileInChunks(file);
      const jsonData = JSON.parse(content);

      const result = detectAndConvertConversation(jsonData, file);
      
      console.log('Resultado da conversão:', {
        fileName: file.name,
        result: result
      });

      setConversations(result);

      console.log('Estado atual do fileConversations:', fileConversations);

    } catch (error) {
      console.error('Erro ao processar arquivo:', error);
      alert(`Erro ao processar o arquivo ${file.name}: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    } finally {
      setLoading(false);
      setLoadingMessage('');
    }
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    setLoading(true);
    addFiles(acceptedFiles);

    try {
      for (const file of acceptedFiles) {
        setLoadingMessage(`Processando arquivo: ${file.name}`);
        await processFile(file);
      }

      setLoadingMessage('Finalizando processamento...');
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      console.error('Erro ao processar arquivos:', error);
      alert('Erro ao processar um ou mais arquivos. Verifique o formato.');
    } finally {
      setLoading(false);
      setLoadingMessage('');
    }
  }, [addFiles, setLoading, setLoadingMessage]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/json': ['.json']
    },
    maxSize: 1024 * 1024 * 200 // 200MB max
  })

  return (
    <div className="w-full flex flex-col gap-4">
      {/* Área de Upload */}
      <div {...getRootProps()}>
        <div className="w-full h-48 flex items-center justify-center cursor-pointer border-2 border-dashed rounded-xl border-default-200 hover:border-primary transition-colors">
          <input {...getInputProps()} />
          <div className="text-center">
            <span className="block text-lg">
              {isDragActive
                ? 'Solte os arquivos aqui...'
                : 'Arraste arquivos JSON ou clique para selecionar'}
            </span>
            <span className="text-sm text-default-500 mt-2">
              Tamanho máximo: 200MB
            </span>
          </div>
        </div>
      </div>

      {/* Lista de Arquivos */}
      {files.length > 0 && (
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Arquivos Importados</h3>
            <span className="text-sm text-default-500">
              {files.length} arquivo{files.length !== 1 ? 's' : ''}
            </span>
          </div>
          
          <div className="space-y-2">
            {files.map((file, index) => {
              const fileId = `${file.name}_${file.size}_${file.lastModified}`;
              const fileData = fileConversations[fileId];
              const { source, totalChats } = fileData?.metadata || {};
              
              console.log('Debug - Renderizando arquivo:', {
                fileName: file.name,
                fileId,
                source,
                totalChats,
                allFiles: Object.keys(fileConversations)
              });
              
              return (
                <div key={index} className="p-4 rounded-xl bg-default-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{file.name}</span>
                      <span className="text-xs text-default-500">
                        ({(file.size / (1024 * 1024)).toFixed(2)} MB)
                      </span>
                    </div>
                    <button 
                      onClick={() => removeFile(index)}
                      className="text-danger text-sm"
                    >
                      Remover
                    </button>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    {fileData?.metadata ? (
                      <>
                        {source === 'claude' ? (
                          <Chip
                            size="sm"
                            variant="flat"
                            color="warning"
                            startContent={<IconBrain size={16} />}
                          >
                            CLAUDE
                          </Chip>
                        ) : (
                          <Chip
                            size="sm"
                            variant="flat"
                            color="primary"
                            startContent={<IconRobot size={16} />}
                          >
                            GPT
                          </Chip>
                        )}
                        <Chip size="sm" variant="flat">
                          {totalChats} conversas
                        </Chip>
                      </>
                    ) : (
                      <span className="text-xs text-default-500">
                        Processando arquivo...
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Novo Card de Stats */}
      {files.length > 0 && <StatsCard />}

      {/* Área de Debug */}
      {process.env.NODE_ENV === 'development' && <DebugCard />}
    </div>
  )
} 