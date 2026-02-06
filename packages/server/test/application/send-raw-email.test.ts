import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import type { SesPort } from '../../src/domain/ports/ses-port';
import type { SendRawInput, SendRawResult } from '../../src/domain/models/types';
import { sendRawEmail } from '../../src/application/send-raw-email';

// Mock SesPort for testing
class MockSesPort implements SesPort {
  sendRawEmailResult: SendRawResult = { messageId: 'test-raw-message-id' };
  sendRawEmailCalledWith: { input: SendRawInput; raw: Buffer } | null = null;
  sendRawEmailError: Error | null = null;

  async listIdentities() {
    return [];
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

  async sendRawEmail(input: SendRawInput, raw: Buffer): Promise<SendRawResult> {
    this.sendRawEmailCalledWith = { input, raw };
    if (this.sendRawEmailError) {
      throw this.sendRawEmailError;
    }
    return this.sendRawEmailResult;
  }
}

test('sendRawEmail passes input and raw buffer to SES port and returns result', async () => {
  const mockSes = new MockSesPort();
  const input: SendRawInput = {
    from: 'sender@example.com',
    to: ['recipient@example.com'],
    subject: 'Test Subject',
    text: 'Test body',
  };
  const rawBuffer = Buffer.from('Raw MIME content');

  const result = await sendRawEmail(mockSes, input, rawBuffer);

  assert.deepStrictEqual(mockSes.sendRawEmailCalledWith?.input, input);
  assert.deepStrictEqual(mockSes.sendRawEmailCalledWith?.raw, rawBuffer);
  assert.strictEqual(result.messageId, 'test-raw-message-id');
});

test('sendRawEmail throws error when SES port fails', async () => {
  const mockSes = new MockSesPort();
  mockSes.sendRawEmailError = new Error('SES service unavailable');

  const input: SendRawInput = {
    from: 'sender@example.com',
    to: ['recipient@example.com'],
    subject: 'Test Subject',
    text: 'Test body',
  };
  const rawBuffer = Buffer.from('Raw MIME content');

  await assert.rejects(async () => await sendRawEmail(mockSes, input, rawBuffer), {
    message: 'SES service unavailable',
  });
});
