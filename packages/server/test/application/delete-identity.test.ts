import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import type { SesPort } from '@ses-admin/server/domain/ports/ses-port';
import { deleteIdentity } from '@ses-admin/server/application/delete-identity';

// Mock SesPort for testing
class MockSesPort implements SesPort {
  deleteIdentityCalledWith: string | null = null;
  deleteIdentityError: Error | null = null;

  async listIdentities() {
    return [];
  }

  async verifyIdentity() {
    return;
  }

  async deleteIdentity(identity: string) {
    this.deleteIdentityCalledWith = identity;
    if (this.deleteIdentityError) {
      throw this.deleteIdentityError;
    }
  }

  async sendEmail() {
    return { messageId: 'test-id' };
  }

  async sendRawEmail() {
    return { messageId: 'test-id' };
  }
}

test('deleteIdentity passes identity to SES port', async () => {
  const mockSes = new MockSesPort();

  await deleteIdentity(mockSes, 'user@example.com');

  assert.strictEqual(mockSes.deleteIdentityCalledWith, 'user@example.com');
});

test('deleteIdentity throws error when SES port fails', async () => {
  const mockSes = new MockSesPort();
  mockSes.deleteIdentityError = new Error('Identity not found');

  await assert.rejects(async () => await deleteIdentity(mockSes, 'nonexistent@example.com'), {
    message: 'Identity not found',
  });
});
