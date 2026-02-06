import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import type { SesPort } from '../../src/domain/ports/ses-port';
import type { IdentityType } from '../../src/domain/models/types';
import { verifyIdentity } from '../../src/application/verify-identity';

// Mock SesPort for testing
class MockSesPort implements SesPort {
  verifyIdentityCalledWith: { identity: string; type: IdentityType } | null = null;
  verifyIdentityError: Error | null = null;

  async listIdentities() {
    return [];
  }

  async verifyIdentity(identity: string, type: IdentityType) {
    this.verifyIdentityCalledWith = { identity, type };
    if (this.verifyIdentityError) {
      throw this.verifyIdentityError;
    }
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

test('verifyIdentity passes email and type to SES port', async () => {
  const mockSes = new MockSesPort();

  await verifyIdentity(mockSes, 'user@example.com', 'email');

  assert.deepStrictEqual(mockSes.verifyIdentityCalledWith, {
    identity: 'user@example.com',
    type: 'email',
  });
});

test('verifyIdentity passes domain identity to SES port', async () => {
  const mockSes = new MockSesPort();

  await verifyIdentity(mockSes, 'example.com', 'domain');

  assert.deepStrictEqual(mockSes.verifyIdentityCalledWith, {
    identity: 'example.com',
    type: 'domain',
  });
});

test('verifyIdentity throws error when SES port fails', async () => {
  const mockSes = new MockSesPort();
  mockSes.verifyIdentityError = new Error('SES service unavailable');

  await assert.rejects(async () => await verifyIdentity(mockSes, 'user@example.com', 'email'), {
    message: 'SES service unavailable',
  });
});
