import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import FormData from 'form-data';
import type { MessagesPort } from '@ses-admin/server/domain/ports/messages-port';
import type { SesPort } from '@ses-admin/server/domain/ports/ses-port';
import { UpstreamError } from '@ses-admin/server/domain/errors/app-error';
import { createServer } from '@ses-admin/server/delivery/http/create-server';

const makeServer = (nodeEnv = 'test') => {
  const calls = {
    verify: [] as Array<{ identity: string; type: string }>,
    deleteIdentity: [] as string[],
    sendEmail: [] as unknown[],
    sendRaw: [] as { input: unknown; raw: Buffer }[],
    listMessages: 0,
    deleteMessages: 0,
  };

  const ses: SesPort = {
    listIdentities: async () => [
      { identity: 'demo@example.com', type: 'email' },
      { identity: 'example.com', type: 'domain' },
    ],
    verifyIdentity: async (identity, type) => {
      calls.verify.push({ identity, type });
    },
    deleteIdentity: async (identity) => {
      calls.deleteIdentity.push(identity);
    },
    sendEmail: async (input) => {
      calls.sendEmail.push(input);
      return { messageId: 'msg-123' };
    },
    sendRawEmail: async (input, raw) => {
      calls.sendRaw.push({ input, raw });
      return { messageId: 'raw-123' };
    },
  };

  const messages: MessagesPort = {
    listMessages: async () => {
      calls.listMessages += 1;
      return [{ id: 'abc', subject: 'hello' }];
    },
    deleteMessages: async () => {
      calls.deleteMessages += 1;
    },
  };

  const tmpUi = fs.mkdtempSync(path.join(os.tmpdir(), 'ses-admin-ui-'));
  fs.writeFileSync(path.join(tmpUi, 'index.html'), '<html></html>');
  process.env.UI_DIST_PATH = tmpUi;

  const app = createServer({
    config: {
      LOCALSTACK_ENDPOINT: 'http://localstack:4566',
      AWS_REGION: 'us-east-1',
      AWS_ACCESS_KEY_ID: 'test',
      AWS_SECRET_ACCESS_KEY: 'test',
      PORT: 8080,
      NODE_ENV: nodeEnv,
    },
    ses,
    messages,
  });

  return { app, calls };
};

test('GET /api/health', async () => {
  const { app } = makeServer();
  await app.ready();

  const response = await app.inject({ method: 'GET', url: '/api/health' });
  assert.equal(response.statusCode, 200);
  assert.deepEqual(response.json(), { ok: true });

  await app.close();
});

test('identities flow', async () => {
  const { app, calls } = makeServer();
  await app.ready();

  const list = await app.inject({ method: 'GET', url: '/api/identities' });
  assert.equal(list.statusCode, 200);
  assert.equal(list.json().items.length, 2);

  const verify = await app.inject({
    method: 'POST',
    url: '/api/identities',
    payload: { identity: 'new@example.com', type: 'email' },
  });
  assert.equal(verify.statusCode, 200);
  assert.equal(calls.verify[0].identity, 'new@example.com');

  const del = await app.inject({ method: 'DELETE', url: '/api/identities/new@example.com' });
  assert.equal(del.statusCode, 200);
  assert.equal(calls.deleteIdentity[0], 'new@example.com');

  await app.close();
});

test('send email validation', async () => {
  const { app } = makeServer();
  await app.ready();

  const bad = await app.inject({ method: 'POST', url: '/api/send', payload: { from: 'a' } });
  assert.equal(bad.statusCode, 400);

  await app.close();
});

test('send email success', async () => {
  const { app, calls } = makeServer();
  await app.ready();

  const res = await app.inject({
    method: 'POST',
    url: '/api/send',
    payload: {
      from: 'no-reply@example.com',
      to: ['user@example.com'],
      subject: 'Hello',
      text: 'Hi',
    },
  });

  assert.equal(res.statusCode, 200);
  assert.equal(res.json().messageId, 'msg-123');
  assert.equal((calls.sendEmail[0] as { subject: string }).subject, 'Hello');

  await app.close();
});

test('send raw email via multipart', async () => {
  const { app, calls } = makeServer();
  await app.ready();

  const form = new FormData();
  form.append('from', 'no-reply@example.com');
  form.append('to', 'user@example.com');
  form.append('subject', 'Raw hello');
  form.append('text', 'Hello there');
  form.append('attachments', Buffer.from('hello file'), {
    filename: 'hello.txt',
    contentType: 'text/plain',
  });

  const response = await app.inject({
    method: 'POST',
    url: '/api/send-raw',
    payload: form.getBuffer(),
    headers: form.getHeaders(),
  });

  assert.equal(response.statusCode, 200);
  assert.equal(response.json().messageId, 'raw-123');
  assert.ok(calls.sendRaw[0].raw.toString('utf8').includes('Subject: Raw hello'));

  await app.close();
});

test('messages flow', async () => {
  const { app, calls } = makeServer();
  await app.ready();

  const list = await app.inject({ method: 'GET', url: '/api/messages' });
  assert.equal(list.statusCode, 200);
  assert.equal(list.json().messages.length, 1);
  assert.equal(calls.listMessages, 1);

  const del = await app.inject({ method: 'DELETE', url: '/api/messages' });
  assert.equal(del.statusCode, 200);
  assert.equal(calls.deleteMessages, 1);

  await app.close();
});

test('errors map to http status', async () => {
  const tmpUi = fs.mkdtempSync(path.join(os.tmpdir(), 'ses-admin-ui-'));
  fs.writeFileSync(path.join(tmpUi, 'index.html'), '<html></html>');
  process.env.UI_DIST_PATH = tmpUi;

  const ses: SesPort = {
    listIdentities: async () => {
      throw new UpstreamError('boom');
    },
    verifyIdentity: async () => {},
    deleteIdentity: async () => {},
    sendEmail: async () => ({ messageId: 'msg' }),
    sendRawEmail: async () => ({ messageId: 'raw' }),
  };

  const messages: MessagesPort = {
    listMessages: async () => [],
    deleteMessages: async () => {},
  };

  const app = createServer({
    config: {
      LOCALSTACK_ENDPOINT: 'http://localstack:4566',
      AWS_REGION: 'us-east-1',
      AWS_ACCESS_KEY_ID: 'test',
      AWS_SECRET_ACCESS_KEY: 'test',
      PORT: 8080,
      NODE_ENV: 'test',
    },
    ses,
    messages,
  });

  await app.ready();
  const response = await app.inject({ method: 'GET', url: '/api/identities' });
  assert.equal(response.statusCode, 502);
  await app.close();
});

test('reload endpoint disabled outside development', async () => {
  const { app } = makeServer('test');
  await app.ready();

  const response = await app.inject({ method: 'POST', url: '/__reload' });
  assert.equal(response.statusCode, 404);

  await app.close();
});

test('reload endpoint enabled in development', async () => {
  const { app } = makeServer('development');
  await app.ready();

  const response = await app.inject({ method: 'POST', url: '/__reload' });
  assert.equal(response.statusCode, 200);
  assert.deepEqual(response.json(), { ok: true });

  await app.close();
});
