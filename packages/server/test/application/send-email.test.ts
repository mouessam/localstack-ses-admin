import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import type { SesPort } from '@ses-admin/server/domain/ports/ses-port';
import type { SendEmailInput, SendEmailResult } from '@ses-admin/server/domain/models/types';
import { sendEmail } from '@ses-admin/server/application/send-email';

// Mock SesPort for testing
class MockSesPort implements SesPort {
  sendEmailResult: SendEmailResult = { messageId: 'test-message-id' };
  sendEmailError: Error | null = null;
  sendEmailCalledWith: SendEmailInput | null = null;

  async listIdentities() {
    return [];
  }

  async verifyIdentity() {
    return;
  }

  async deleteIdentity() {
    return;
  }

  async sendEmail(input: SendEmailInput): Promise<SendEmailResult> {
    this.sendEmailCalledWith = input;
    if (this.sendEmailError) {
      throw this.sendEmailError;
    }
    return this.sendEmailResult;
  }

  async sendRawEmail() {
    return { messageId: 'raw-message-id' };
  }
}

test('sendEmail passes input to SES port and returns result', async () => {
  const mockSes = new MockSesPort();
  const input: SendEmailInput = {
    from: 'sender@example.com',
    to: ['recipient@example.com'],
    subject: 'Test Subject',
    text: 'Test body',
  };

  const result = await sendEmail(mockSes, input);

  assert.deepStrictEqual(mockSes.sendEmailCalledWith, input);
  assert.strictEqual(result.messageId, 'test-message-id');
});

test('sendEmail throws error when SES port fails', async () => {
  const mockSes = new MockSesPort();
  mockSes.sendEmailError = new Error('SES service unavailable');

  const input: SendEmailInput = {
    from: 'sender@example.com',
    to: ['recipient@example.com'],
    subject: 'Test Subject',
    text: 'Test body',
  };

  await assert.rejects(async () => await sendEmail(mockSes, input), {
    message: 'SES service unavailable',
  });
});

test('sendEmail handles email with cc and bcc', async () => {
  const mockSes = new MockSesPort();
  const input: SendEmailInput = {
    from: 'sender@example.com',
    to: ['to@example.com'],
    cc: ['cc@example.com'],
    bcc: ['bcc@example.com'],
    subject: 'Test Subject',
    text: 'Test body',
    html: '<p>Test HTML</p>',
  };

  const result = await sendEmail(mockSes, input);

  assert.deepStrictEqual(mockSes.sendEmailCalledWith, input);
  assert.strictEqual(result.messageId, 'test-message-id');
});
