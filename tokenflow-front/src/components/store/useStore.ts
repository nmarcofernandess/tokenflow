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
  removeTagFilter: (index: number, operator: 'AND' | 'OR') => void;
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
  filteredConversationsCache: {
    key: string;
    result: UnifiedConversation[];
  };
  search: string;
  highlightedMessageId: string | null;
  setSearch: (search: string) => void;
  setHighlightedMessageId: (id: string | null) => void;
  sortConfig: {
    field: 'date' | 'messages';
    direction: 'asc' | 'desc';
  };
  setSortConfig: (config: FileState['sortConfig']) => void;
  viewMode: 'all' | 'favorites';
  setViewMode: (mode: 'all' | 'favorites') => void;
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
  filteredConversationsCache: {
    key: '',
    result: []
  },
  search: '',
  highlightedMessageId: null,
  sortConfig: {
    field: 'date',
    direction: 'desc'
  },
  viewMode: 'all',
  setViewMode: (mode) => {
    console.log('Alterando viewMode para:', mode)
    set((state) => {
      return {
        viewMode: mode,
        filteredConversationsCache: {
          key: '',
          result: []
        }
      }
    })
  },
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
  removeTagFilter: (index: number, operator: 'AND' | 'OR') => set((state) => {
    // Filtra primeiro as tags do operador específico
    const operatorTags = state.filters.tagFilters.filter(f => f.operator === operator)
    const tagToRemove = operatorTags[index]
    
    if (!tagToRemove) return state

    return {
      filters: {
        ...state.filters,
        tagFilters: state.filters.tagFilters.filter(tag => 
          !(tag.tag === tagToRemove.tag && tag.operator === operator)
        )
      }
    }
  }),
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
    const cacheKey = JSON.stringify({
      conversations: state.conversations.map(c => c.id),
      filters: state.filters,
      search: state.search,
      sortConfig: state.sortConfig,
      viewMode: state.viewMode,
      favorites: Array.from(state.favorites)
    });

    if (state.filteredConversationsCache.key === cacheKey) {
      return state.filteredConversationsCache.result;
    }

    let filtered = filterConversations(state.conversations, state.filters);

    if (state.search.trim()) {
      const searchTerm = state.search.toLowerCase().trim();
      
      // Log para debug
      const invalidMessages = state.conversations
        .flatMap(conv => conv.messages)
        .filter(msg => !msg?.text);
      
      if (invalidMessages.length > 0) {
        console.warn('Mensagens sem texto encontradas:', invalidMessages);
      }

      filtered = filtered.filter(conv => {
        // Verifica se title existe antes de usar toLowerCase
        const inTitle = conv.title?.toLowerCase?.()?.includes(searchTerm) || false;
        
        // Verifica se messages existe e se cada mensagem tem texto
        const inMessages = conv.messages?.some(msg => 
          msg?.text?.toLowerCase?.()?.includes(searchTerm)
        ) || false;

        return inTitle || inMessages;
      });
    }
    
    console.log('ViewMode atual:', state.viewMode)
    if (state.viewMode === 'favorites') {
      console.log('Filtrando favoritos...')
      filtered = filtered.filter(conv => state.favorites.has(conv.id));
    }
    
    filtered.sort((a, b) => {
      if (state.sortConfig.field === 'date') {
        const dateA = new Date(a.created_at).getTime();
        const dateB = new Date(b.created_at).getTime();
        return state.sortConfig.direction === 'asc' ? dateA - dateB : dateB - dateA;
      } else {
        const messagesA = a.messages.length;
        const messagesB = b.messages.length;
        return state.sortConfig.direction === 'asc' ? messagesA - messagesB : messagesB - messagesA;
      }
    });
    
    set(state => ({
      filteredConversationsCache: {
        key: cacheKey,
        result: filtered
      }
    }));

    return filtered;
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
  },
  setSearch: (search) => set({ search }),
  setHighlightedMessageId: (id) => set({ highlightedMessageId: id }),
  setSortConfig: (config) => set({ sortConfig: config }),
})) 