'use client'

import { Card, Chip } from '@nextui-org/react'
import { ChatHeader } from '@/components/Chat/ChatHeader'
import { MessageList } from '@/components/Chat/MessageList'
import { Sidebar } from '@/components/Chat/Sidebar'
import { estimateTokens, formatTokenCount } from '@/utils/tokenCounter';

export const Chat = () => {
  return (
    <div className="grid grid-cols-[350px_1fr] gap-6">
      <Sidebar />
      <Card className="h-[calc(100vh-200px)]">
        <ChatHeader />
        <MessageList />
      </Card>
    </div>
  )
} 