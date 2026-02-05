import type { MessagesPort } from '../domain/ports/messages-port';

export const deleteMessages = async (messages: MessagesPort, query: { id?: string; email?: string }) =>
  messages.deleteMessages(query);
