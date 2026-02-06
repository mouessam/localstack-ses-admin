import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import type { SesPort } from '../../src/domain/ports/ses-port';
import type { Identity } from '../../src/domain/models/types';
import { listIdentities } from '../../src/application/list-identities';

// Mock SesPort for testing
class MockSesPort implements SesPort {
  listIdentitiesResult: Identity[] = [];
  listIdentitiesError: Error | null = null;

  async listIdentities(): Promise<Identity[]> {
    if (this.listIdentitiesError) {
      throw this.listIdentitiesError;
    }
    return this.listIdentitiesResult;
  }

  async verifyIdentity() {
    return;
  }

  async deleteIdentity() {
    return;
  }

  async sendEmail() {
    return { messageId: 'test-id' };
  }

  async sendRawEmail() {
    return { messageId: 'test-id' };
  }
}

test('listIdentities returns empty array when no identities exist', async () => {
  const mockSes = new MockSesPort();
  mockSes.listIdentitiesResult = [];

  const result = await listIdentities(mockSes);

  assert.deepStrictEqual(result, []);
  assert.strictEqual(result.length, 0);
});

test('listIdentities returns list of identities', async () => {
  const mockSes = new MockSesPort();
  const mockIdentities: Identity[] = [
    { identity: 'user@example.com', type: 'email' },
    { identity: 'example.com', type: 'domain' },
    { identity: 'admin@example.com', type: 'email' },
  ];
  mockSes.listIdentitiesResult = mockIdentities;

  const result = await listIdentities(mockSes);

  assert.deepStrictEqual(result, mockIdentities);
  assert.strictEqual(result.length, 3);
  assert.strictEqual(result[0].identity, 'user@example.com');
  assert.strictEqual(result[0].type, 'email');
  assert.strictEqual(result[1].type, 'domain');
});

test('listIdentities throws error when SES port fails', async () => {
  const mockSes = new MockSesPort();
  mockSes.listIdentitiesError = new Error('SES service unavailable');

  await assert.rejects(async () => await listIdentities(mockSes), {
    message: 'SES service unavailable',
  });
});
