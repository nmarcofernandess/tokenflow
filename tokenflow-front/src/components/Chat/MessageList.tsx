'use client'

import { useStore } from '@/components/store/useStore'

export const MessageList = () => {
  const { selectedConversationId, conversations } = useStore()
  
  const selectedConversation = conversations.find(
    conv => conv.id === selectedConversationId
  )

  if (!selectedConversation) return null

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {selectedConversation.messages.map(message => (
        <div
          key={message.id}
          className={`flex ${message.sender === 'human' ? 'justify-end' : 'justify-start'}`}
        >
          <div
            className={`
              max-w-[80%] p-3 rounded-lg
              ${message.sender === 'human' 
                ? 'bg-primary text-white rounded-br-none' 
                : 'bg-default-100 rounded-bl-none'}
            `}
          >
            <p className="text-sm whitespace-pre-wrap">{message.text}</p>
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