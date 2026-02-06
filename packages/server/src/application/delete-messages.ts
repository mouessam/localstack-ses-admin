import type { MessagesPort } from '@ses-admin/server/domain/ports/messages-port';

export const deleteMessages = async (
  messages: MessagesPort,
  query: { id?: string; email?: string },
) => messages.deleteMessages(query);
