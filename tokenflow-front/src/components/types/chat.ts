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
  account: Account;
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
  create_time: number | null;
  update_time: number | null;
  content: GPTMessageContent;
  status: string;
  end_turn: boolean | null;
  weight: number;
  metadata: {
    is_user_system_message?: boolean;
    is_visually_hidden_from_conversation?: boolean;
    message_type?: string | null;
    model_slug?: string;
    parent_id?: string;
    timestamp_?: string;
    finished_text?: string;
    initial_text?: string;
  };
  recipient: string;
  channel: string | null;
}

export interface GPTConversation {
  title: string;
  create_time: number;
  update_time: number;
  mapping: {
    [key: string]: {
      id: string;
      message?: GPTMessage;
      parent: string | null;
      children: string[];
    };
  };
  current_node?: string;
}

export interface UnifiedMessage {
  id: string;
  text: string;
  sender: "human" | "assistant";
  timestamp: string;
  attachments?: ClaudeAttachment[];
}

export interface UnifiedConversation {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
  messages: UnifiedMessage[];
  source: "claude" | "gpt";
} 