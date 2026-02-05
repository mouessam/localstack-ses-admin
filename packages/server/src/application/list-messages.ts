import type { MessagesPort } from '../domain/ports/messages-port';

export const listMessages = async (messages: MessagesPort, query: { id?: string; email?: string }) =>
  messages.listMessages(query);
