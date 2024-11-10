import { filterConversations } from '@/components/utils/filterConversations'

self.onmessage = (e) => {
  const { conversations, filters } = e.data
  const filtered = filterConversations(conversations, filters)
  self.postMessage(filtered)
} 