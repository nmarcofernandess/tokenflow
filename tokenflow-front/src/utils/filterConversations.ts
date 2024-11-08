import { UnifiedConversation } from '@/types/chat'
import { Filters } from '@/types/filters'

export const filterConversations = (
  conversations: UnifiedConversation[],
  filters: Filters
): UnifiedConversation[] => {
  return conversations.filter(conversation => {
    // Filtro de data
    if (filters.dateFilter.startDate || filters.dateFilter.endDate) {
      const conversationDate = new Date(conversation.created_at)
      
      if (filters.dateFilter.startDate) {
        const startDate = new Date(filters.dateFilter.startDate)
        if (conversationDate < startDate) return false
      }
      
      if (filters.dateFilter.endDate) {
        const endDate = new Date(filters.dateFilter.endDate)
        if (conversationDate > endDate) return false
      }
    }

    // Filtro de tags
    if (filters.tagFilters.length > 0) {
      const conversationText = conversation.messages
        .map(msg => msg.text)
        .join(' ')
        .toLowerCase()

      return filters.tagFilters.every((tagFilter, index) => {
        const hasTag = conversationText.includes(tagFilter.tag.toLowerCase())
        
        if (index === 0) return hasTag
        
        const previousOperator = filters.tagFilters[index - 1].operator
        const previousResult = conversationText.includes(
          filters.tagFilters[index - 1].tag.toLowerCase()
        )
        
        return previousOperator === 'AND' 
          ? previousResult && hasTag
          : previousResult || hasTag
      })
    }

    return true
  })
} 