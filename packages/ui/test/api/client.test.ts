import { beforeEach, describe, it, mock } from 'node:test';
import assert from 'node:assert/strict';
import {
  deleteIdentity,
  deleteMessages,
  listIdentities,
  listMessages,
  sendEmail,
  sendRawEmail,
  verifyIdentity,
} from '@ses-admin/ui/api/client';

// Mock fetch globally
const originalFetch = global.fetch;
const mockFetch = mock.fn(() =>
  Promise.resolve({
    ok: true,
    json: async () => ({}),
    statusText: 'OK',
  } as Response),
);

describe('API Client', () => {
  beforeEach(() => {
    mockFetch.mock.resetCalls();
    global.fetch = mockFetch;
  });

  // Restore fetch after all tests
  const originalAfterAll = new WeakMap();
  if (!originalAfterAll.get(describe)) {
    originalAfterAll.set(describe, true);
    process.on('beforeExit', () => {
      global.fetch = originalFetch;
    });
  }

  describe('listIdentities', () => {
    it('fetches identities successfully', async () => {
      const mockResponse = { items: [] };
      mockFetch.mock.mockImplementation(() =>
        Promise.resolve({
          ok: true,
          json: async () => mockResponse,
        } as Response),
      );

      const result = await listIdentities();

      assert.equal(mockFetch.mock.calls.length, 1);
      const call = mockFetch.mock.calls[0];
      assert.equal(call.arguments[0], '/api/identities');
      assert.deepEqual(call.arguments[1], { headers: {} });
      assert.deepEqual(result, mockResponse);
    });

    it('throws error on failed request', async () => {
      mockFetch.mock.mockImplementation(() =>
        Promise.resolve({
          ok: false,
          statusText: 'Not Found',
          json: async () => ({ message: 'Not found' }),
        } as Response),
      );

      await assert.rejects(async () => await listIdentities(), {
        message: 'Not found',
      });
    });
  });

  describe('verifyIdentity', () => {
    it('verifies identity with POST request', async () => {
      const mockResponse = { ok: true };
      mockFetch.mock.mockImplementation(() =>
        Promise.resolve({
          ok: true,
          json: async () => mockResponse,
        } as Response),
      );

      const identity = { identity: 'test@example.com', type: 'email' as const };
      const result = await verifyIdentity(identity);

      const call = mockFetch.mock.calls[0];
      assert.equal(call.arguments[0], '/api/identities');
      assert.equal(call.arguments[1].method, 'POST');
      assert.equal(call.arguments[1].body, JSON.stringify(identity));
      assert.deepEqual(result, mockResponse);
    });
  });

  describe('deleteIdentity', () => {
    it('deletes identity with DELETE request', async () => {
      const mockResponse = { ok: true };
      mockFetch.mock.mockImplementation(() =>
        Promise.resolve({
          ok: true,
          json: async () => mockResponse,
        } as Response),
      );

      const result = await deleteIdentity('test@example.com');

      const call = mockFetch.mock.calls[0];
      assert.equal(call.arguments[0], '/api/identities/test%40example.com');
      assert.equal(call.arguments[1].method, 'DELETE');
      assert.deepEqual(result, mockResponse);
    });

    it('encodes special characters in identity', async () => {
      mockFetch.mock.mockImplementation(() =>
        Promise.resolve({
          ok: true,
          json: async () => ({ ok: true }),
        } as Response),
      );

      await deleteIdentity('user@example.com');

      const call = mockFetch.mock.calls[0];
      assert.equal(call.arguments[0], '/api/identities/user%40example.com');
    });
  });

  describe('sendEmail', () => {
    it('sends email with POST request', async () => {
      const mockResponse = { messageId: 'msg-123' };
      mockFetch.mock.mockImplementation(() =>
        Promise.resolve({
          ok: true,
          json: async () => mockResponse,
        } as Response),
      );

      const email = {
        from: 'sender@example.com',
        to: ['recipient@example.com'],
        subject: 'Test',
        text: 'Body',
      };
      const result = await sendEmail(email);

      const call = mockFetch.mock.calls[0];
      assert.equal(call.arguments[0], '/api/send');
      assert.equal(call.arguments[1].method, 'POST');
      assert.equal(call.arguments[1].body, JSON.stringify(email));
      assert.deepEqual(result, mockResponse);
    });
  });

  describe('sendRawEmail', () => {
    it('sends raw email with FormData', async () => {
      const mockResponse = { messageId: 'msg-456' };
      mockFetch.mock.mockImplementation(() =>
        Promise.resolve({
          ok: true,
          json: async () => mockResponse,
        } as Response),
      );

      const formData = new FormData();
      formData.append('from', 'sender@example.com');
      const result = await sendRawEmail(formData);

      const call = mockFetch.mock.calls[0];
      assert.equal(call.arguments[0], '/api/send-raw');
      assert.equal(call.arguments[1].method, 'POST');
      assert.equal(call.arguments[1].body, formData);
      assert.deepEqual(result, mockResponse);
    });
  });

  describe('listMessages', () => {
    it('lists messages without filters', async () => {
      const mockResponse = { messages: [] };
      mockFetch.mock.mockImplementation(() =>
        Promise.resolve({
          ok: true,
          json: async () => mockResponse,
        } as Response),
      );

      const result = await listMessages();

      const call = mockFetch.mock.calls[0];
      assert.equal(call.arguments[0], '/api/messages');
      assert.deepEqual(result, mockResponse);
    });

    it('lists messages with id filter', async () => {
      mockFetch.mock.mockImplementation(() =>
        Promise.resolve({
          ok: true,
          json: async () => ({ messages: [] }),
        } as Response),
      );

      await listMessages({ id: 'msg-123' });

      const call = mockFetch.mock.calls[0];
      assert.ok(call.arguments[0].includes('id=msg-123'));
    });

    it('lists messages with email filter', async () => {
      mockFetch.mock.mockImplementation(() =>
        Promise.resolve({
          ok: true,
          json: async () => ({ messages: [] }),
        } as Response),
      );

      await listMessages({ email: 'test@example.com' });

      const call = mockFetch.mock.calls[0];
      assert.ok(call.arguments[0].includes('email=test%40example.com'));
    });

    it('lists messages with both filters', async () => {
      mockFetch.mock.mockImplementation(() =>
        Promise.resolve({
          ok: true,
          json: async () => ({ messages: [] }),
        } as Response),
      );

      await listMessages({ id: 'msg-123', email: 'test@example.com' });

      const call = mockFetch.mock.calls[0];
      assert.ok(call.arguments[0].includes('id=msg-123'));
      assert.ok(call.arguments[0].includes('email=test%40example.com'));
    });
  });

  describe('deleteMessages', () => {
    it('deletes messages without filters', async () => {
      const mockResponse = { ok: true };
      mockFetch.mock.mockImplementation(() =>
        Promise.resolve({
          ok: true,
          json: async () => mockResponse,
        } as Response),
      );

      const result = await deleteMessages();

      const call = mockFetch.mock.calls[0];
      assert.equal(call.arguments[0], '/api/messages');
      assert.equal(call.arguments[1].method, 'DELETE');
      assert.deepEqual(result, mockResponse);
    });

    it('deletes messages with filters', async () => {
      mockFetch.mock.mockImplementation(() =>
        Promise.resolve({
          ok: true,
          json: async () => ({ ok: true }),
        } as Response),
      );

      await deleteMessages({ id: 'msg-123' });

      const call = mockFetch.mock.calls[0];
      assert.ok(call.arguments[0].includes('id=msg-123'));
    });
  });
});
