import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  IdentitySchema,
  IdentityTypeSchema,
  ListIdentitiesResponseSchema,
  ListMessagesResponseSchema,
  MessageSchema,
  SendEmailSchema,
  SendRawSchema,
} from '@ses-admin/shared';

describe('IdentityTypeSchema', () => {
  it('accepts valid email type', () => {
    const result = IdentityTypeSchema.safeParse('email');
    assert.strictEqual(result.success, true);
    if (result.success) {
      assert.strictEqual(result.data, 'email');
    }
  });

  it('accepts valid domain type', () => {
    const result = IdentityTypeSchema.safeParse('domain');
    assert.strictEqual(result.success, true);
    if (result.success) {
      assert.strictEqual(result.data, 'domain');
    }
  });

  it('rejects invalid type', () => {
    const result = IdentityTypeSchema.safeParse('invalid');
    assert.strictEqual(result.success, false);
  });
});

describe('IdentitySchema', () => {
  it('accepts valid email identity', () => {
    const result = IdentitySchema.safeParse({
      identity: 'test@example.com',
      type: 'email',
    });
    assert.strictEqual(result.success, true);
    if (result.success) {
      assert.strictEqual(result.data.identity, 'test@example.com');
      assert.strictEqual(result.data.type, 'email');
    }
  });

  it('accepts valid domain identity', () => {
    const result = IdentitySchema.safeParse({
      identity: 'example.com',
      type: 'domain',
    });
    assert.strictEqual(result.success, true);
    if (result.success) {
      assert.strictEqual(result.data.identity, 'example.com');
      assert.strictEqual(result.data.type, 'domain');
    }
  });

  it('rejects identity shorter than 3 characters', () => {
    const result = IdentitySchema.safeParse({
      identity: 'ab',
      type: 'email',
    });
    assert.strictEqual(result.success, false);
  });

  it('rejects missing type', () => {
    const result = IdentitySchema.safeParse({
      identity: 'test@example.com',
    });
    assert.strictEqual(result.success, false);
  });
});

describe('ListIdentitiesResponseSchema', () => {
  it('accepts valid response with items', () => {
    const result = ListIdentitiesResponseSchema.safeParse({
      items: [
        { identity: 'test@example.com', type: 'email' },
        { identity: 'example.com', type: 'domain' },
      ],
    });
    assert.strictEqual(result.success, true);
    if (result.success) {
      assert.strictEqual(result.data.items.length, 2);
    }
  });

  it('accepts empty items array', () => {
    const result = ListIdentitiesResponseSchema.safeParse({ items: [] });
    assert.strictEqual(result.success, true);
  });
});

describe('SendEmailSchema', () => {
  it('accepts valid email with text body', () => {
    const result = SendEmailSchema.safeParse({
      from: 'sender@example.com',
      to: ['recipient@example.com'],
      subject: 'Test Subject',
      text: 'Test body',
    });
    assert.strictEqual(result.success, true);
  });

  it('accepts valid email with html body', () => {
    const result = SendEmailSchema.safeParse({
      from: 'sender@example.com',
      to: ['recipient@example.com'],
      subject: 'Test Subject',
      html: '<p>Test body</p>',
    });
    assert.strictEqual(result.success, true);
  });

  it('accepts valid email with both text and html', () => {
    const result = SendEmailSchema.safeParse({
      from: 'sender@example.com',
      to: ['recipient@example.com'],
      subject: 'Test Subject',
      text: 'Test body',
      html: '<p>Test body</p>',
    });
    assert.strictEqual(result.success, true);
  });

  it('accepts email with cc and bcc', () => {
    const result = SendEmailSchema.safeParse({
      from: 'sender@example.com',
      to: ['recipient@example.com'],
      cc: ['cc@example.com'],
      bcc: ['bcc@example.com'],
      subject: 'Test Subject',
      text: 'Test body',
    });
    assert.strictEqual(result.success, true);
  });

  it('accepts multiple recipients', () => {
    const result = SendEmailSchema.safeParse({
      from: 'sender@example.com',
      to: ['recipient1@example.com', 'recipient2@example.com'],
      subject: 'Test Subject',
      text: 'Test body',
    });
    assert.strictEqual(result.success, true);
  });

  it('rejects email without text or html', () => {
    const result = SendEmailSchema.safeParse({
      from: 'sender@example.com',
      to: ['recipient@example.com'],
      subject: 'Test Subject',
    });
    assert.strictEqual(result.success, false);
  });

  it('rejects email with empty to array', () => {
    const result = SendEmailSchema.safeParse({
      from: 'sender@example.com',
      to: [],
      subject: 'Test Subject',
      text: 'Test body',
    });
    assert.strictEqual(result.success, false);
  });

  it('rejects email with from shorter than 3 characters', () => {
    const result = SendEmailSchema.safeParse({
      from: 'ab',
      to: ['recipient@example.com'],
      subject: 'Test Subject',
      text: 'Test body',
    });
    assert.strictEqual(result.success, false);
  });

  it('rejects email with empty subject', () => {
    const result = SendEmailSchema.safeParse({
      from: 'sender@example.com',
      to: ['recipient@example.com'],
      subject: '',
      text: 'Test body',
    });
    assert.strictEqual(result.success, false);
  });
});

describe('SendRawSchema', () => {
  it('accepts valid email with raw content', () => {
    const result = SendRawSchema.safeParse({
      from: 'sender@example.com',
      to: ['recipient@example.com'],
      subject: 'Test Subject',
      raw: 'Raw MIME content',
    });
    assert.strictEqual(result.success, true);
  });

  it('accepts valid email with text body', () => {
    const result = SendRawSchema.safeParse({
      from: 'sender@example.com',
      to: ['recipient@example.com'],
      subject: 'Test Subject',
      text: 'Test body',
    });
    assert.strictEqual(result.success, true);
  });

  it('accepts valid email with html body', () => {
    const result = SendRawSchema.safeParse({
      from: 'sender@example.com',
      to: ['recipient@example.com'],
      subject: 'Test Subject',
      html: '<p>Test body</p>',
    });
    assert.strictEqual(result.success, true);
  });

  it('accepts email with cc and bcc', () => {
    const result = SendRawSchema.safeParse({
      from: 'sender@example.com',
      to: ['recipient@example.com'],
      cc: ['cc@example.com'],
      bcc: ['bcc@example.com'],
      subject: 'Test Subject',
      raw: 'Raw MIME content',
    });
    assert.strictEqual(result.success, true);
  });

  it('rejects email without raw, text, or html', () => {
    const result = SendRawSchema.safeParse({
      from: 'sender@example.com',
      to: ['recipient@example.com'],
      subject: 'Test Subject',
    });
    assert.strictEqual(result.success, false);
  });
});

describe('MessageSchema', () => {
  it('accepts valid message with all fields', () => {
    const result = MessageSchema.safeParse({
      id: 'msg-123',
      to: ['recipient@example.com'],
      from: 'sender@example.com',
      subject: 'Test Subject',
      body: 'Test body',
      timestamp: '2024-01-01T00:00:00Z',
    });
    assert.strictEqual(result.success, true);
  });

  it('accepts message with optional fields missing', () => {
    const result = MessageSchema.safeParse({});
    assert.strictEqual(result.success, true);
  });

  it('passes through additional properties', () => {
    const result = MessageSchema.safeParse({
      id: 'msg-123',
      extraProperty: 'extra value',
      anotherProperty: 123,
    });
    assert.strictEqual(result.success, true);
    if (result.success) {
      assert.strictEqual('extraProperty' in result.data, true);
      assert.strictEqual('anotherProperty' in result.data, true);
    }
  });
});

describe('ListMessagesResponseSchema', () => {
  it('accepts valid response with messages', () => {
    const result = ListMessagesResponseSchema.safeParse({
      messages: [
        { id: 'msg-1', from: 'sender@example.com', subject: 'Test' },
        { id: 'msg-2', from: 'other@example.com', subject: 'Test 2' },
      ],
    });
    assert.strictEqual(result.success, true);
    if (result.success) {
      assert.strictEqual(result.data.messages.length, 2);
    }
  });

  it('accepts empty messages array', () => {
    const result = ListMessagesResponseSchema.safeParse({ messages: [] });
    assert.strictEqual(result.success, true);
  });
});
