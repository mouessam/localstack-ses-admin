import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { VERSION } from '@ses-admin/ui/version';

describe('VERSION', () => {
  it('has ui version', () => {
    assert.ok(VERSION.ui);
    assert.equal(typeof VERSION.ui, 'string');
  });

  it('has server version', () => {
    assert.ok(VERSION.server);
    assert.equal(typeof VERSION.server, 'string');
  });
});
