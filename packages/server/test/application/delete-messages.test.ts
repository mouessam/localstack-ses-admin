import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import type { MessagesPort } from '@ses-admin/server/domain/ports/messages-port';
import { deleteMessages } from '@ses-admin/server/application/delete-messages';

// Mock MessagesPort for testing
class MockMessagesPort implements MessagesPort {
  deleteMessagesCalledWith: { id?: string; email?: string } | null = null;
  deleteMessagesError: Error | null = null;

  async listMessages() {
    return [];
  }

  async deleteMessages(query: { id?: string; email?: string }) {
    this.deleteMessagesCalledWith = query;
    if (this.deleteMessagesError) {
      throw this.deleteMessagesError;
    }
  }
}

test('deleteMessages passes query to messages port', async () => {
  const mockMessages = new MockMessagesPort();

  await deleteMessages(mockMessages, { id: 'msg-123', email: 'test@example.com' });

  assert.deepStrictEqual(mockMessages.deleteMessagesCalledWith, {
    id: 'msg-123',
    email: 'test@example.com',
  });
});

test('deleteMessages passes empty query when no filters provided', async () => {
  const mockMessages = new MockMessagesPort();

  await deleteMessages(mockMessages, {});

  assert.deepStrictEqual(mockMessages.deleteMessagesCalledWith, {});
});

test('deleteMessages throws error when messages port fails', async () => {
  const mockMessages = new MockMessagesPort();
  mockMessages.deleteMessagesError = new Error('Messages service unavailable');

  await assert.rejects(async () => await deleteMessages(mockMessages, { id: 'msg-123' }), {
    message: 'Messages service unavailable',
  });
});
