import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import { buildRawMime } from '../../src/infrastructure/mime/mime-builder';

const sample = {
  from: 'no-reply@example.com',
  to: ['user@example.com'],
  subject: 'Hello',
  text: 'Plain text',
  html: '<p>Hello</p>',
};

test('buildRawMime returns a MIME buffer', async () => {
  const buffer = await buildRawMime(sample, []);
  const content = buffer.toString('utf8');
  assert.ok(content.includes('Subject: Hello'));
  assert.ok(content.includes('Plain text'));
});
