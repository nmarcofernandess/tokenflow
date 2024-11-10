'use client'

import { useEffect, useRef, useCallback } from 'react'
import { useStore } from '@/components/store/useStore'

export const MessageList = () => {
  const { 
    selectedConversationId, 
    conversations, 
    searchInChat,
    highlightedMessageId,
    setHighlightedMessageId 
  } = useStore()
  
  const messageRefs = useRef<{[key: string]: HTMLDivElement | null}>({})

  const setMessageRef = useCallback((el: HTMLDivElement | null, id: string) => {
    if (messageRefs.current) {
      messageRefs.current[id] = el
    }
  }, [])

  const selectedConversation = conversations.find(
    conv => conv.id === selectedConversationId
  )

  useEffect(() => {
    if (searchInChat && highlightedMessageId && messageRefs.current[highlightedMessageId]) {
      messageRefs.current[highlightedMessageId]?.scrollIntoView({ 
        behavior: 'smooth',
        block: 'center'
      })
    }
  }, [highlightedMessageId, searchInChat])

  if (!selectedConversation) return null

  const formatMessageText = (text: any): string => {
    if (typeof text === 'string') return text
    if (Array.isArray(text)) {
      return text
        .map(item => typeof item === 'string' ? item : JSON.stringify(item))
        .join(' ')
    }
    if (typeof text === 'object' && text !== null) {
      try {
        return JSON.stringify(text)
      } catch {
        return '[Conteúdo não textual]'
      }
    }
    return String(text || '')
  }

  const highlightText = (text: any) => {
    if (!text || !searchInChat.trim()) return formatMessageText(text)

    const formattedText = formatMessageText(text)
    const parts = formattedText.split(new RegExp(`(${searchInChat})`, 'gi'))
    
    return parts.map((part, i) => 
      part.toLowerCase() === searchInChat.toLowerCase() ? (
        <span key={i} className="bg-warning-300 dark:bg-warning-400/40 px-1 rounded">
          {part}
        </span>
      ) : part
    )
  }

  const filteredMessages = selectedConversation.messages.filter(message => {
    if (!searchInChat.trim()) return true
    const messageText = formatMessageText(message.text)
    return messageText.toLowerCase().includes(searchInChat.toLowerCase())
  })

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {filteredMessages.map(message => (
        <div
          key={message.id}
          ref={(el) => setMessageRef(el, message.id)}
          className={`
            flex ${message.sender === 'human' ? 'justify-end' : 'justify-start'}
            ${message.id === highlightedMessageId ? 'animate-pulse' : ''}
          `}
        >
          <div
            className={`
              max-w-[80%] p-3 rounded-lg
              ${message.sender === 'human' 
                ? 'bg-primary text-white rounded-br-none' 
                : 'bg-default-100 rounded-bl-none'}
            `}
          >
            <p className="text-sm whitespace-pre-wrap">
              {highlightText(message.text)}
            </p>
            {message.attachments && message.attachments.length > 0 && (
              <div className="mt-2 space-x-2">
                {message.attachments.map(att => (
                  <span 
                    key={att.file_name}
                    className="text-xs opacity-70"
                  >
                    📎 {att.file_name}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
} 