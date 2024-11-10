import { create } from 'zustand'
import { UnifiedConversation } from '@/components/types/chat'
import { Filters, DateFilter, TagFilter } from '@/components/types/filters'
import { ConversionResult } from '@/components/utils/conversationConverter'
import { filterConversations } from '@/components/utils/filterConversations'

interface FileMetadata {
  source: 'gpt' | 'claude';
  totalChats: number;
  dateRange: {
    firstDate: string;
    lastDate: string;
  };
}

interface FileStats {
  source: 'gpt' | 'claude';
  conversationCount: number;
}

interface FileState {
  files: File[];
  conversations: UnifiedConversation[];
  filters: Filters;
  isLoading: boolean;
  loadingMessage: string;
  selectedConversationId: string | null;
  fileConversations: {
    [fileName: string]: {
      conversations: UnifiedConversation[];
      metadata: FileMetadata;
      ids: string[];
    };
  };
  addFiles: (newFiles: File[]) => void;
  removeFile: (index: number) => void;
  setConversations: (
    result: ConversionResult,
    fileName?: string
  ) => void;
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
  fileStats: {
    [fileName: string]: FileStats;
  };
  updateFileStats: (fileName: string, stats: FileStats) => void;
  getGlobalDateRange: () => { min: Date; max: Date };
  getFilteredConversations: () => UnifiedConversation[];
  getGlobalStats: () => {
    totalChats: number;
    sources: Set<'gpt' | 'claude'>;
    dateRange: { min: Date; max: Date };
  };
}

export const useStore = create<FileState>((set, get) => ({
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
  fileStats: {},
  addFiles: (newFiles) => set((state) => ({ 
    files: [...state.files, ...newFiles] 
  })),
  removeFile: (index) => set((state) => {
    const fileToRemove = state.files[index]
    if (!fileToRemove) return state

    const newFiles = state.files.filter((_, i) => i !== index)
    const { [fileToRemove.name]: removedConvs, ...restFileConversations } = state.fileConversations
    const { [fileToRemove.name]: removedStats, ...restFileStats } = state.fileStats

    const idsToRemove = new Set(removedConvs?.ids || [])
    const newConversations = state.conversations.filter(conv => !idsToRemove.has(conv.id))

    console.log('Debug - Removendo arquivo:', {
      removedFile: fileToRemove.name,
      remainingFiles: newFiles.length,
      remainingConversations: newConversations.length,
      remainingFileConvs: Object.keys(restFileConversations).length,
      remainingStats: Object.keys(restFileStats).length
    })

    return {
      files: newFiles,
      conversations: newConversations,
      fileConversations: restFileConversations,
      fileStats: restFileStats,
      selectedConversationId: state.selectedConversationId && 
        idsToRemove.has(state.selectedConversationId)
        ? null 
        : state.selectedConversationId
    }
  }),
  setConversations: (result: ConversionResult, fileName?: string) => set(state => {
    if (!fileName) return state;

    const { conversations, metadata } = result;

    let uniqueFileName = fileName;
    let counter = 1;
    while (state.fileConversations[uniqueFileName]) {
      uniqueFileName = `${fileName.replace('.json', '')}_${counter}.json`;
      counter++;
    }

    console.log('Debug - setConversations:', {
      fileName: uniqueFileName,
      existingFiles: Object.keys(state.fileConversations),
      newConversations: conversations.length,
      metadata
    });

    return {
      conversations: [
        ...state.conversations,
        ...conversations
      ],
      fileConversations: {
        ...state.fileConversations,
        [uniqueFileName]: {
          conversations,
          metadata,
          ids: conversations.map(c => c.id)
        }
      },
      fileStats: {
        ...state.fileStats,
        [uniqueFileName]: {
          source: metadata.source,
          conversationCount: metadata.totalChats
        }
      }
    };
  }),
  removeConversationsFromFile: (fileName) => set((state) => {
    const { [fileName]: removed, ...restFileConversations } = state.fileConversations
    const fileIds = removed?.conversations.map(c => c.id) || []

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
      ids.forEach(id => newFavorites.delete(id))
    } else {
      ids.forEach(id => newFavorites.add(id))
    }
    
    return { favorites: newFavorites }
  }),
  setSearchInChat: (search) => set({ searchInChat: search }),
  updateFileStats: (fileName, stats) => set(state => ({
    fileStats: {
      ...state.fileStats,
      [fileName]: stats
    }
  })),
  getGlobalDateRange: () => {
    const state = get();
    const fileConversations = state.fileConversations;
    
    // Se não houver arquivos, retorna período padrão
    if (Object.keys(fileConversations).length === 0) {
      const defaultEnd = new Date();
      const defaultStart = new Date();
      defaultStart.setMonth(defaultStart.getMonth() - 6);
      return {
        min: defaultStart,
        max: defaultEnd
      };
    }

    // Coleta todas as datas dos arquivos
    const allDates = Object.values(fileConversations).flatMap(file => {
      const firstDate = new Date(file.metadata.dateRange.firstDate);
      const lastDate = new Date(file.metadata.dateRange.lastDate);
      return [firstDate, lastDate];
    });

    console.log('Debug - Global Date Range:', {
      totalFiles: Object.keys(fileConversations).length,
      datesCollected: allDates.map(d => d.toISOString()),
      min: new Date(Math.min(...allDates.map(d => d.getTime()))).toISOString(),
      max: new Date(Math.max(...allDates.map(d => d.getTime()))).toISOString()
    });

    return {
      min: new Date(Math.min(...allDates.map(d => d.getTime()))),
      max: new Date(Math.max(...allDates.map(d => d.getTime())))
    };
  },
  getFilteredConversations: () => {
    const state = get();
    return filterConversations(state.conversations, state.filters);
  },
  getGlobalStats: () => {
    const state = get();
    return {
      totalChats: Object.values(state.fileConversations)
        .reduce((sum, data) => sum + data.metadata.totalChats, 0),
      sources: new Set(
        Object.values(state.fileConversations)
          .map(data => data.metadata.source)
      ),
      dateRange: get().getGlobalDateRange()
    };
  }
})) 