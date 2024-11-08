import { create } from 'zustand'
import { UnifiedConversation } from '@/types/chat'
import { Filters, DateFilter, TagFilter } from '@/types/filters'

interface FileState {
  files: File[];
  conversations: UnifiedConversation[];
  filters: Filters;
  isLoading: boolean;
  loadingMessage: string;
  selectedConversationId: string | null;
  fileConversations: Map<string, string[]>; // Mapeia arquivo -> IDs de conversas
  addFiles: (newFiles: File[]) => void;
  removeFile: (index: number) => void;
  setConversations: (conversations: UnifiedConversation[], fileName: string) => void;
  removeConversationsFromFile: (fileName: string) => void;
  setLoading: (loading: boolean) => void;
  setLoadingMessage: (message: string) => void;
  setDateFilter: (filter: DateFilter) => void;
  addTagFilter: (filter: TagFilter) => void;
  removeTagFilter: (index: number) => void;
  setSelectedConversation: (id: string) => void;
}

export const useStore = create<FileState>((set) => ({
  files: [],
  conversations: [],
  fileConversations: new Map(),
  isLoading: false,
  loadingMessage: '',
  selectedConversationId: null,
  filters: {
    dateFilter: {
      startDate: null,
      endDate: null
    },
    tagFilters: []
  },
  addFiles: (newFiles) => set((state) => ({ 
    files: [...state.files, ...newFiles] 
  })),
  removeFile: (index) => set((state) => ({
    files: state.files.filter((_, i) => i !== index)
  })),
  setConversations: (conversations, fileName) => set((state) => {
    // Armazena os IDs das novas conversas associados ao arquivo
    const conversationIds = conversations.map(conv => conv.id)
    const newFileConversations = new Map(state.fileConversations)
    newFileConversations.set(fileName, conversationIds)

    return {
      conversations: [...state.conversations, ...conversations],
      fileConversations: newFileConversations
    }
  }),
  removeConversationsFromFile: (fileName) => set((state) => {
    // Obtém os IDs das conversas associadas ao arquivo
    const conversationIds = state.fileConversations.get(fileName) || []
    
    // Remove as conversas do arquivo
    const newConversations = state.conversations.filter(
      conv => !conversationIds.includes(conv.id)
    )

    // Remove o mapeamento do arquivo
    const newFileConversations = new Map(state.fileConversations)
    newFileConversations.delete(fileName)

    // Limpa a seleção se a conversa selecionada foi removida
    const newSelectedId = conversationIds.includes(state.selectedConversationId || '')
      ? null
      : state.selectedConversationId

    return {
      conversations: newConversations,
      fileConversations: newFileConversations,
      selectedConversationId: newSelectedId
    }
  }),
  setLoading: (loading) => set({ isLoading: loading }),
  setLoadingMessage: (message) => set({ loadingMessage: message }),
  setDateFilter: (dateFilter) => set((state) => ({
    filters: { ...state.filters, dateFilter }
  })),
  addTagFilter: (tagFilter) => set((state) => ({
    filters: { 
      ...state.filters, 
      tagFilters: [...state.filters.tagFilters, tagFilter]
    }
  })),
  removeTagFilter: (index) => set((state) => ({
    filters: {
      ...state.filters,
      tagFilters: state.filters.tagFilters.filter((_, i) => i !== index)
    }
  })),
  setSelectedConversation: (id) => set({ selectedConversationId: id })
})) 