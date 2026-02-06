import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import type { MessagesPort } from '../../src/domain/ports/messages-port';
import type { Message } from '../../src/domain/models/types';
import { listMessages } from '../../src/application/list-messages';

// Mock MessagesPort for testing
class MockMessagesPort implements MessagesPort {
  listMessagesResult: Message[] = [];
  listMessagesError: Error | null = null;

  async listMessages(_query: { id?: string; email?: string }): Promise<Message[]> {
    if (this.listMessagesError) {
      throw this.listMessagesError;
    }
    return this.listMessagesResult;
  }

  async deleteMessages() {
    return;
  }
}

test('listMessages returns empty array when no messages exist', async () => {
  const mockMessages = new MockMessagesPort();
  mockMessages.listMessagesResult = [];

  const result = await listMessages(mockMessages, {});

  assert.deepStrictEqual(result, []);
  assert.strictEqual(result.length, 0);
});

test('listMessages returns list of messages', async () => {
  const mockMessages = new MockMessagesPort();
  const mockMessagesList: Message[] = [
    { id: 'msg-1', subject: 'Test Email 1' },
    { id: 'msg-2', subject: 'Test Email 2' },
  ];
  mockMessages.listMessagesResult = mockMessagesList;

  const result = await listMessages(mockMessages, {});

  assert.deepStrictEqual(result, mockMessagesList);
  assert.strictEqual(result.length, 2);
  assert.strictEqual(result[0].id, 'msg-1');
  assert.strictEqual(result[0].subject, 'Test Email 1');
});

test('listMessages passes query parameters to messages port', async () => {
  const mockMessages = new MockMessagesPort();
  let receivedQuery: { id?: string; email?: string } | undefined;

  // Override to capture query
  mockMessages.listMessages = async (query) => {
    receivedQuery = query;
    return [];
  };

  await listMessages(mockMessages, { id: 'msg-123', email: 'test@example.com' });

  assert.deepStrictEqual(receivedQuery, { id: 'msg-123', email: 'test@example.com' });
});

test('listMessages throws error when messages port fails', async () => {
  const mockMessages = new MockMessagesPort();
  mockMessages.listMessagesError = new Error('Messages service unavailable');

  await assert.rejects(async () => await listMessages(mockMessages, {}), {
    message: 'Messages service unavailable',
  });
});
