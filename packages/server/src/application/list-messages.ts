import type { MessagesPort } from '@ses-admin/server/domain/ports/messages-port';

export const listMessages = async (
  messages: MessagesPort,
  query: { id?: string; email?: string },
) => messages.listMessages(query);
