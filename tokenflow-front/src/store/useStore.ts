import { create } from 'zustand'
import { UnifiedConversation } from '@/types/chat'
import { Filters, DateFilter, TagFilter } from '@/types/filters'

interface FileConversations {
  [fileName: string]: {
    conversations: UnifiedConversation[];
    ids: string[];
  }
}

interface FileState {
  files: File[];
  conversations: UnifiedConversation[];
  filters: Filters;
  isLoading: boolean;
  loadingMessage: string;
  selectedConversationId: string | null;
  fileConversations: FileConversations;
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
  favorites: Set<string>;
  searchInChat: string;
  toggleFavorite: (id: string) => void;
  toggleAllFavorites: (ids: string[]) => void;
  setSearchInChat: (search: string) => void;
}

export const useStore = create<FileState>((set) => ({
  files: [],
  conversations: [],
  fileConversations: {},
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
  favorites: new Set(),
  searchInChat: '',
  addFiles: (newFiles) => set((state) => ({ 
    files: [...state.files, ...newFiles] 
  })),
  removeFile: (index) => set((state) => {
    const fileToRemove = state.files[index]
    if (!fileToRemove) return state

    const newFiles = state.files.filter((_, i) => i !== index)
    const { [fileToRemove.name]: removed, ...restFileConversations } = state.fileConversations

    // Remove as conversas associadas ao arquivo
    const newConversations = state.conversations.filter(conv => 
      !state.fileConversations[fileToRemove.name]?.ids.includes(conv.id)
    )

    return {
      files: newFiles,
      conversations: newConversations,
      fileConversations: restFileConversations,
      selectedConversationId: state.selectedConversationId && 
        state.fileConversations[fileToRemove.name]?.ids.includes(state.selectedConversationId)
        ? null 
        : state.selectedConversationId
    }
  }),
  setConversations: (conversations, fileName) => set((state) => {
    const fileData = {
      conversations,
      ids: conversations.map(conv => conv.id)
    }

    return {
      conversations: [...state.conversations, ...conversations],
      fileConversations: {
        ...state.fileConversations,
        [fileName]: fileData
      }
    }
  }),
  removeConversationsFromFile: (fileName) => set((state) => {
    const { [fileName]: removed, ...restFileConversations } = state.fileConversations
    const fileIds = removed?.ids || []

    return {
      conversations: state.conversations.filter(conv => !fileIds.includes(conv.id)),
      fileConversations: restFileConversations,
      selectedConversationId: state.selectedConversationId && 
        fileIds.includes(state.selectedConversationId)
        ? null 
        : state.selectedConversationId
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
  setSelectedConversation: (id) => set({ selectedConversationId: id }),
  toggleFavorite: (id) => set((state) => {
    const newFavorites = new Set(state.favorites)
    if (newFavorites.has(id)) {
      newFavorites.delete(id)
    } else {
      newFavorites.add(id)
    }
    return { favorites: newFavorites }
  }),
  toggleAllFavorites: (ids) => set((state) => {
    const allAreFavorited = ids.every(id => state.favorites.has(id))
    const newFavorites = new Set(state.favorites)
    
    if (allAreFavorited) {
      // Remove todos
      ids.forEach(id => newFavorites.delete(id))
    } else {
      // Adiciona todos
      ids.forEach(id => newFavorites.add(id))
    }
    
    return { favorites: newFavorites }
  }),
  setSearchInChat: (search) => set({ searchInChat: search })
})) 