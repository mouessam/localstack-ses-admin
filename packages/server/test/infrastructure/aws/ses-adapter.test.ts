import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import { mockClient } from 'aws-sdk-client-mock';
import {
  DeleteIdentityCommand,
  ListIdentitiesCommand,
  SendEmailCommand,
  SendRawEmailCommand,
  SESClient,
  VerifyDomainIdentityCommand,
  VerifyEmailIdentityCommand,
} from '@aws-sdk/client-ses';
import { AwsSesAdapter } from '../../src/infrastructure/aws/ses-adapter';
import type { AppConfig } from '../../src/config/config';
import { UpstreamError } from '../../src/domain/errors/app-error';

// Mock config
const mockConfig: AppConfig = {
  AWS_REGION: 'us-east-1',
  LOCALSTACK_ENDPOINT: 'http://localstack:4566',
  AWS_ACCESS_KEY_ID: 'test',
  AWS_SECRET_ACCESS_KEY: 'test',
  PORT: 8080,
  NODE_ENV: 'test',
};

test('AwsSesAdapter.listIdentities returns list of identities', async () => {
  const sesMock = mockClient(SESClient);
  sesMock.on(ListIdentitiesCommand).resolves({
    Identities: ['user@example.com', 'example.com', 'admin@test.com'],
  });

  const adapter = new AwsSesAdapter(mockConfig);
  const result = await adapter.listIdentities();

  assert.strictEqual(result.length, 3);
  assert.deepStrictEqual(result[0], { identity: 'user@example.com', type: 'email' });
  assert.deepStrictEqual(result[1], { identity: 'example.com', type: 'domain' });
  assert.deepStrictEqual(result[2], { identity: 'admin@test.com', type: 'email' });

  sesMock.restore();
});

test('AwsSesAdapter.listIdentities returns empty array when no identities', async () => {
  const sesMock = mockClient(SESClient);
  sesMock.on(ListIdentitiesCommand).resolves({
    Identities: [],
  });

  const adapter = new AwsSesAdapter(mockConfig);
  const result = await adapter.listIdentities();

  assert.deepStrictEqual(result, []);

  sesMock.restore();
});

test('AwsSesAdapter.listIdentities throws UpstreamError on failure', async () => {
  const sesMock = mockClient(SESClient);
  sesMock.on(ListIdentitiesCommand).rejects(new Error('Network error'));

  const adapter = new AwsSesAdapter(mockConfig);

  await assert.rejects(async () => await adapter.listIdentities(), UpstreamError);

  sesMock.restore();
});

test('AwsSesAdapter.verifyIdentity verifies email identity', async () => {
  const sesMock = mockClient(SESClient);
  sesMock.on(VerifyEmailIdentityCommand).resolves({});

  const adapter = new AwsSesAdapter(mockConfig);
  await adapter.verifyIdentity('user@example.com', 'email');

  const calls = sesMock.commandCalls(VerifyEmailIdentityCommand);
  assert.strictEqual(calls.length, 1);
  assert.deepStrictEqual(calls[0].args[0].input, {
    EmailAddress: 'user@example.com',
  });

  sesMock.restore();
});

test('AwsSesAdapter.verifyIdentity verifies domain identity', async () => {
  const sesMock = mockClient(SESClient);
  sesMock.on(VerifyDomainIdentityCommand).resolves({});

  const adapter = new AwsSesAdapter(mockConfig);
  await adapter.verifyIdentity('example.com', 'domain');

  const calls = sesMock.commandCalls(VerifyDomainIdentityCommand);
  assert.strictEqual(calls.length, 1);
  assert.deepStrictEqual(calls[0].args[0].input, {
    Domain: 'example.com',
  });

  sesMock.restore();
});

test('AwsSesAdapter.verifyIdentity throws UpstreamError on failure', async () => {
  const sesMock = mockClient(SESClient);
  sesMock.on(VerifyEmailIdentityCommand).rejects(new Error('Invalid email'));

  const adapter = new AwsSesAdapter(mockConfig);

  await assert.rejects(async () => await adapter.verifyIdentity('invalid', 'email'), UpstreamError);

  sesMock.restore();
});

test('AwsSesAdapter.deleteIdentity deletes identity', async () => {
  const sesMock = mockClient(SESClient);
  sesMock.on(DeleteIdentityCommand).resolves({});

  const adapter = new AwsSesAdapter(mockConfig);
  await adapter.deleteIdentity('user@example.com');

  const calls = sesMock.commandCalls(DeleteIdentityCommand);
  assert.strictEqual(calls.length, 1);
  assert.deepStrictEqual(calls[0].args[0].input, {
    Identity: 'user@example.com',
  });

  sesMock.restore();
});

test('AwsSesAdapter.deleteIdentity throws UpstreamError on failure', async () => {
  const sesMock = mockClient(SESClient);
  sesMock.on(DeleteIdentityCommand).rejects(new Error('Identity not found'));

  const adapter = new AwsSesAdapter(mockConfig);

  await assert.rejects(async () => await adapter.deleteIdentity('nonexistent@example.com'), UpstreamError);

  sesMock.restore();
});

test('AwsSesAdapter.sendEmail sends email successfully', async () => {
  const sesMock = mockClient(SESClient);
  sesMock.on(SendEmailCommand).resolves({
    MessageId: 'test-message-123',
  });

  const adapter = new AwsSesAdapter(mockConfig);
  const result = await adapter.sendEmail({
    from: 'sender@example.com',
    to: ['recipient@example.com'],
    subject: 'Test Subject',
    text: 'Test body',
  });

  assert.strictEqual(result.messageId, 'test-message-123');

  const calls = sesMock.commandCalls(SendEmailCommand);
  assert.strictEqual(calls.length, 1);
  const callInput = calls[0].args[0].input;
  assert.strictEqual(callInput.Source, 'sender@example.com');
  assert.deepStrictEqual(callInput.Destination?.ToAddresses, ['recipient@example.com']);
  assert.strictEqual(callInput.Message?.Subject?.Data, 'Test Subject');
  assert.strictEqual(callInput.Message?.Body?.Text?.Data, 'Test body');

  sesMock.restore();
});

test('AwsSesAdapter.sendEmail includes cc and bcc when provided', async () => {
  const sesMock = mockClient(SESClient);
  sesMock.on(SendEmailCommand).resolves({
    MessageId: 'test-message-456',
  });

  const adapter = new AwsSesAdapter(mockConfig);
  const result = await adapter.sendEmail({
    from: 'sender@example.com',
    to: ['to@example.com'],
    cc: ['cc@example.com'],
    bcc: ['bcc@example.com'],
    subject: 'Test',
    text: 'Body',
    html: '<p>HTML</p>',
  });

  assert.strictEqual(result.messageId, 'test-message-456');

  const calls = sesMock.commandCalls(SendEmailCommand);
  const callInput = calls[0].args[0].input;
  assert.deepStrictEqual(callInput.Destination?.ToAddresses, ['to@example.com']);
  assert.deepStrictEqual(callInput.Destination?.CcAddresses, ['cc@example.com']);
  assert.deepStrictEqual(callInput.Destination?.BccAddresses, ['bcc@example.com']);
  assert.strictEqual(callInput.Message?.Body?.Html?.Data, '<p>HTML</p>');

  sesMock.restore();
});

test('AwsSesAdapter.sendEmail throws UpstreamError on failure', async () => {
  const sesMock = mockClient(SESClient);
  sesMock.on(SendEmailCommand).rejects(new Error('SES error'));

  const adapter = new AwsSesAdapter(mockConfig);

  await assert.rejects(
    async () =>
      await adapter.sendEmail({
        from: 'sender@example.com',
        to: ['recipient@example.com'],
        subject: 'Test',
        text: 'Body',
      }),
    UpstreamError,
  );

  sesMock.restore();
});

test('AwsSesAdapter.sendRawEmail sends raw email successfully', async () => {
  const sesMock = mockClient(SESClient);
  sesMock.on(SendRawEmailCommand).resolves({
    MessageId: 'raw-message-789',
  });

  const adapter = new AwsSesAdapter(mockConfig);
  const rawBuffer = Buffer.from('Raw MIME content');
  const result = await adapter.sendRawEmail(
    {
      from: 'sender@example.com',
      to: ['recipient@example.com'],
      subject: 'Test',
      text: 'Body',
    },
    rawBuffer,
  );

  assert.strictEqual(result.messageId, 'raw-message-789');

  const calls = sesMock.commandCalls(SendRawEmailCommand);
  assert.strictEqual(calls.length, 1);
  const callInput = calls[0].args[0].input;
  assert.strictEqual(callInput.Source, 'sender@example.com');
  assert.deepStrictEqual(callInput.Destinations, ['recipient@example.com']);
  assert.deepStrictEqual(callInput.RawMessage?.Data, rawBuffer);

  sesMock.restore();
});

test('AwsSesAdapter.sendRawEmail includes cc and bcc in destinations', async () => {
  const sesMock = mockClient(SESClient);
  sesMock.on(SendRawEmailCommand).resolves({
    MessageId: 'raw-message-999',
  });

  const adapter = new AwsSesAdapter(mockConfig);
  const rawBuffer = Buffer.from('Raw MIME content');
  const result = await adapter.sendRawEmail(
    {
      from: 'sender@example.com',
      to: ['to@example.com'],
      cc: ['cc@example.com'],
      bcc: ['bcc@example.com'],
      subject: 'Test',
      text: 'Body',
    },
    rawBuffer,
  );

  assert.strictEqual(result.messageId, 'raw-message-999');

  const calls = sesMock.commandCalls(SendRawEmailCommand);
  const callInput = calls[0].args[0].input;
  assert.deepStrictEqual(callInput.Destinations, ['to@example.com', 'cc@example.com', 'bcc@example.com']);

  sesMock.restore();
});

test('AwsSesAdapter.sendRawEmail throws UpstreamError on failure', async () => {
  const sesMock = mockClient(SESClient);
  sesMock.on(SendRawEmailCommand).rejects(new Error('SES raw error'));

  const adapter = new AwsSesAdapter(mockConfig);

  await assert.rejects(
    async () =>
      await adapter.sendRawEmail(
        {
          from: 'sender@example.com',
          to: ['recipient@example.com'],
          subject: 'Test',
          text: 'Body',
        },
        Buffer.from('raw'),
      ),
    UpstreamError,
  );

  sesMock.restore();
});
