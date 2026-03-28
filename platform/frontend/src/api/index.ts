import { apiClient } from './client';
import type {
  TokenResponse, User, Task, SimilarTask, Collaborator,
  Message, ConversationSummary, MediaFile,
} from '../types';

// ── Auth ──────────────────────────────────────────────────────────────────────
export const register = (data: {
  username: string; email: string; password: string; public_key?: string;
}) => apiClient.post<TokenResponse>('/auth/register', data).then((r) => r.data);

export const login = (data: { email: string; password: string }) =>
  apiClient.post<TokenResponse>('/auth/login', data).then((r) => r.data);

// ── Users ─────────────────────────────────────────────────────────────────────
export const getMe = () => apiClient.get<User>('/users/me').then((r) => r.data);
export const getUser = (id: number) =>
  apiClient.get<User>(`/users/${id}`).then((r) => r.data);
export const updateMe = (data: Partial<Pick<User, 'bio' | 'avatar_url' | 'public_key'>>) =>
  apiClient.patch<User>('/users/me', data).then((r) => r.data);

// ── Tasks ─────────────────────────────────────────────────────────────────────
export const listTasks = (skip = 0, limit = 20) =>
  apiClient.get<Task[]>('/tasks', { params: { skip, limit } }).then((r) => r.data);

export const createTask = (data: {
  title: string; description: string; tags?: string; is_open?: boolean;
}) => apiClient.post<Task>('/tasks', data).then((r) => r.data);

export const getTask = (id: number) =>
  apiClient.get<Task>(`/tasks/${id}`).then((r) => r.data);

export const updateTask = (id: number, data: Partial<Task>) =>
  apiClient.patch<Task>(`/tasks/${id}`, data).then((r) => r.data);

export const deleteTask = (id: number) =>
  apiClient.delete(`/tasks/${id}`);

export const searchSimilarTasks = (q: string, limit = 10) =>
  apiClient
    .get<SimilarTask[]>('/tasks/search/similar', { params: { q, limit } })
    .then((r) => r.data);

export const joinTask = (id: number) =>
  apiClient.post(`/tasks/${id}/join`).then((r) => r.data);

export const leaveTask = (id: number) =>
  apiClient.delete(`/tasks/${id}/leave`);

export const getCollaborators = (taskId: number) =>
  apiClient.get<Collaborator[]>(`/tasks/${taskId}/collaborators`).then((r) => r.data);

// ── Messages ──────────────────────────────────────────────────────────────────
export const sendMessage = (data: {
  recipient_id: number;
  ciphertext: string;
  ephemeral_public_key?: string;
  encrypted_key?: string;
  iv?: string;
  media_url?: string;
  media_type?: string;
}) => apiClient.post<Message>('/messages', data).then((r) => r.data);

export const getConversations = () =>
  apiClient.get<ConversationSummary[]>('/messages/conversations').then((r) => r.data);

export const getConversation = (peerId: number, skip = 0, limit = 50) =>
  apiClient
    .get<Message[]>(`/messages/${peerId}`, { params: { skip, limit } })
    .then((r) => r.data);

// ── Media ─────────────────────────────────────────────────────────────────────
export const uploadMedia = (file: File) => {
  const form = new FormData();
  form.append('file', file);
  return apiClient
    .post<MediaFile>('/media', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    .then((r) => r.data);
};

export const listMyMedia = () =>
  apiClient.get<MediaFile[]>('/media').then((r) => r.data);
