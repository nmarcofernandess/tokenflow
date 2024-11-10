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
    [fileId: string]: {
      fileName: string;
      conversations: UnifiedConversation[];
      metadata: FileMetadata;
      ids: string[];
    };
  };
  addFiles: (newFiles: File[]) => void;
  removeFile: (index: number) => void;
  setConversations: (result: ConversionResult) => void;
  removeConversationsFromFile: (fileId: string) => void;
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
    [fileId: string]: FileStats;
  };
  updateFileStats: (fileId: string, stats: FileStats) => void;
  getGlobalDateRange: () => { min: Date; max: Date };
  getFilteredConversations: () => UnifiedConversation[];
  getGlobalStats: () => {
    totalChats: number;
    sources: Set<'gpt' | 'claude'>;
    dateRange: { min: Date; max: Date };
  };
  fileNameMapping: { [originalName: string]: string };
  getFileData: (fileId: string) => {
    conversations: UnifiedConversation[];
    metadata: FileMetadata;
    ids: string[];
  } | undefined;
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
  fileNameMapping: {},
  addFiles: (newFiles) => set((state) => {
    return { 
      files: [...state.files, ...newFiles]
    };
  }),
  removeFile: (index) => set((state) => {
    const fileToRemove = state.files[index];
    if (!fileToRemove) return state;

    const fileId = Object.keys(state.fileConversations).find(
      id => state.fileConversations[id].fileName === fileToRemove.name
    );

    if (!fileId) return state;

    const newFiles = state.files.filter((_, i) => i !== index);
    const { [fileId]: removedConvs, ...restFileConversations } = state.fileConversations;
    const { [fileId]: removedStats, ...restFileStats } = state.fileStats;

    const idsToRemove = new Set(removedConvs?.ids || []);
    const newConversations = state.conversations.filter(conv => !idsToRemove.has(conv.id));

    return {
      files: newFiles,
      conversations: newConversations,
      fileConversations: restFileConversations,
      fileStats: restFileStats,
      selectedConversationId: state.selectedConversationId && 
        idsToRemove.has(state.selectedConversationId)
        ? null 
        : state.selectedConversationId
    };
  }),
  setConversations: (result) => set(state => {
    const { fileId, conversations, metadata } = result;

    const updatedFileConversations = {
      ...state.fileConversations,
      [fileId]: {
        fileName: state.files.find(f => 
          `${f.name}_${f.size}_${f.lastModified}` === fileId
        )?.name || 'Unknown',
        conversations: [...conversations],
        metadata,
        ids: conversations.map(c => c.id)
      }
    };

    const allConversations = Object.values(updatedFileConversations)
      .flatMap(fileData => fileData.conversations);

    return {
      conversations: allConversations,
      fileConversations: updatedFileConversations,
      fileStats: {
        ...state.fileStats,
        [fileId]: {
          source: metadata.source,
          conversationCount: metadata.totalChats
        }
      }
    };
  }),
  removeConversationsFromFile: (fileId) => set((state) => {
    const { [fileId]: removed, ...restFileConversations } = state.fileConversations
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
  updateFileStats: (fileId, stats) => set(state => ({
    fileStats: {
      ...state.fileStats,
      [fileId]: stats
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
  },
  getFileData: (fileId: string) => {
    const state = get();
    console.log('Debug - getFileData:', {
      requestedFile: fileId,
      availableFiles: Object.keys(state.fileConversations),
      fileData: state.fileConversations[fileId]
    });
    return state.fileConversations[fileId];
  }
})) 