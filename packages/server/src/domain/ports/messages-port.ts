import type { Message } from '../models/types';

export interface MessagesPort {
  listMessages(query: { id?: string; email?: string }): Promise<Message[]>;
  deleteMessages(query: { id?: string; email?: string }): Promise<void>;
}
