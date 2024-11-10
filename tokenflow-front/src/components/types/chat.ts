export interface Account {
  uuid: string;
}

export interface BaseMessage {
  uuid: string;
  text: string;
  sender: "human" | "assistant";
  created_at: string;
  updated_at: string;
}

export interface ClaudeAttachment {
  file_name: string;
  file_size?: number;
  file_type?: string;
  extracted_content?: string;
}

export interface ClaudeMessage extends BaseMessage {
  content: Array<{
    type: string;
    text: string;
  }>;
  attachments: ClaudeAttachment[];
  files: Array<{
    file_name: string;
  }>;
}

export interface ClaudeConversation {
  uuid: string;
  name: string;
  created_at: string;
  updated_at: string;
  account: {
    uuid: string;
  };
  chat_messages: ClaudeMessage[];
}

export interface GPTMessageContent {
  content_type: string;
  parts: string[];
}

export interface GPTMessageAuthor {
  role: "user" | "assistant" | "system" | "tool";
  name: string | null;
  metadata: Record<string, any>;
}

export interface GPTMessage {
  id: string;
  author: GPTMessageAuthor;
  create_time: number;
  update_time?: number;
  content: {
    parts: string[];
  };
  metadata?: {
    is_visually_hidden_from_conversation?: boolean;
  };
}

export interface GPTNode {
  id: string;
  message?: GPTMessage;
  parent: string | null;
  children: string[];
}

export interface GPTConversation {
  title: string;
  create_time: number;
  update_time: number;
  mapping: {
    [key: string]: GPTNode;
  };
}

export interface UnifiedMessage {
  id: string;
  text: string;
  sender: "human" | "assistant";
  created_at: string;
  updated_at: string;
  attachments?: ClaudeAttachment[];
  files?: Array<{
    file_name: string;
  }>;
}

export interface UnifiedConversation {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
  source: 'gpt' | 'claude';
  messages: UnifiedMessage[];
} 