import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  deleteIdentity,
  deleteMessages,
  listIdentities,
  listMessages,
  sendEmail,
  sendRawEmail,
  verifyIdentity,
} from './client';

// Mock fetch globally
global.fetch = vi.fn();

describe('API Client', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('listIdentities', () => {
    it('fetches identities successfully', async () => {
      const mockResponse = { items: [] };
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      const result = await listIdentities();

      expect(fetch).toHaveBeenCalledWith('/api/identities', {
        headers: {},
      });
      expect(result).toEqual(mockResponse);
    });

    it('throws error on failed request', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: false,
        statusText: 'Not Found',
        json: async () => ({ message: 'Not found' }),
      } as Response);

      await expect(listIdentities()).rejects.toThrow('Not found');
    });
  });

  describe('verifyIdentity', () => {
    it('verifies identity with POST request', async () => {
      const mockResponse = { ok: true };
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      const identity = { identity: 'test@example.com', type: 'email' as const };
      const result = await verifyIdentity(identity);

      expect(fetch).toHaveBeenCalledWith('/api/identities', {
        method: 'POST',
        body: JSON.stringify(identity),
        headers: { 'Content-Type': 'application/json' },
      });
      expect(result).toEqual(mockResponse);
    });
  });

  describe('deleteIdentity', () => {
    it('deletes identity with DELETE request', async () => {
      const mockResponse = { ok: true };
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      const result = await deleteIdentity('test@example.com');

      expect(fetch).toHaveBeenCalledWith('/api/identities/test%40example.com', {
        method: 'DELETE',
        headers: {},
      });
      expect(result).toEqual(mockResponse);
    });

    it('encodes special characters in identity', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ ok: true }),
      } as Response);

      await deleteIdentity('user@example.com');

      expect(fetch).toHaveBeenCalledWith(
        '/api/identities/user%40example.com',
        expect.objectContaining({ method: 'DELETE' }),
      );
    });
  });

  describe('sendEmail', () => {
    it('sends email with POST request', async () => {
      const mockResponse = { messageId: 'msg-123' };
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      const email = {
        from: 'sender@example.com',
        to: ['recipient@example.com'],
        subject: 'Test',
        text: 'Body',
      };
      const result = await sendEmail(email);

      expect(fetch).toHaveBeenCalledWith('/api/send', {
        method: 'POST',
        body: JSON.stringify(email),
        headers: { 'Content-Type': 'application/json' },
      });
      expect(result).toEqual(mockResponse);
    });
  });

  describe('sendRawEmail', () => {
    it('sends raw email with FormData', async () => {
      const mockResponse = { messageId: 'msg-456' };
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      const formData = new FormData();
      formData.append('from', 'sender@example.com');
      const result = await sendRawEmail(formData);

      expect(fetch).toHaveBeenCalledWith('/api/send-raw', {
        method: 'POST',
        body: formData,
        headers: {}, // No Content-Type for FormData
      });
      expect(result).toEqual(mockResponse);
    });
  });

  describe('listMessages', () => {
    it('lists messages without filters', async () => {
      const mockResponse = { messages: [] };
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      const result = await listMessages();

      expect(fetch).toHaveBeenCalledWith('/api/messages', {
        headers: {},
      });
      expect(result).toEqual(mockResponse);
    });

    it('lists messages with id filter', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ messages: [] }),
      } as Response);

      await listMessages({ id: 'msg-123' });

      expect(fetch).toHaveBeenCalledWith('/api/messages?id=msg-123', expect.any(Object));
    });

    it('lists messages with email filter', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ messages: [] }),
      } as Response);

      await listMessages({ email: 'test@example.com' });

      expect(fetch).toHaveBeenCalledWith(
        '/api/messages?email=test%40example.com',
        expect.any(Object),
      );
    });

    it('lists messages with both filters', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ messages: [] }),
      } as Response);

      await listMessages({ id: 'msg-123', email: 'test@example.com' });

      const url = vi.mocked(fetch).mock.calls[0][0];
      expect(url).toContain('id=msg-123');
      expect(url).toContain('email=test%40example.com');
    });
  });

  describe('deleteMessages', () => {
    it('deletes messages without filters', async () => {
      const mockResponse = { ok: true };
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      const result = await deleteMessages();

      expect(fetch).toHaveBeenCalledWith('/api/messages', {
        method: 'DELETE',
        headers: {},
      });
      expect(result).toEqual(mockResponse);
    });

    it('deletes messages with filters', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ ok: true }),
      } as Response);

      await deleteMessages({ id: 'msg-123' });

      expect(fetch).toHaveBeenCalledWith('/api/messages?id=msg-123', expect.any(Object));
    });
  });
});
