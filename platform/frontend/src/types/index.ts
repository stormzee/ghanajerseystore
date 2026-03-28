// ── Auth ─────────────────────────────────────────────────────────────────────
export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

// ── Users ────────────────────────────────────────────────────────────────────
export interface User {
  id: number;
  username: string;
  email: string;
  public_key: string | null;
  avatar_url: string | null;
  bio: string | null;
  created_at: string;
}

// ── Tasks ─────────────────────────────────────────────────────────────────────
export interface Task {
  id: number;
  title: string;
  description: string;
  tags: string | null;
  owner_id: number;
  owner_username: string;
  is_open: boolean;
  created_at: string;
  collaborator_count: number;
}

export interface SimilarTask extends Task {
  similarity: number;
}

export interface Collaborator {
  user_id: number;
  username: string;
  joined_at: string;
}

// ── Messages ─────────────────────────────────────────────────────────────────
export interface Message {
  id: number;
  sender_id: number;
  recipient_id: number;
  ciphertext: string;
  ephemeral_public_key: string | null;
  encrypted_key: string | null;
  iv: string | null;
  media_url: string | null;
  media_type: string | null;
  expires_at: string;
  created_at: string;
  // Filled client-side after decryption
  plaintext?: string;
}

export interface ConversationSummary {
  peer: User;
  last_message_at: string | null;
  unread_count: number;
}

// ── Media ─────────────────────────────────────────────────────────────────────
export interface MediaFile {
  id: number;
  url: string;
  content_type: string;
  original_name: string;
  size_bytes: number;
  created_at: string;
}

// ── WebSocket ─────────────────────────────────────────────────────────────────
export interface WsMessageEvent {
  type: 'message';
  data: Message;
}

export interface WsPongEvent {
  type: 'pong';
}

export type WsEvent = WsMessageEvent | WsPongEvent;
