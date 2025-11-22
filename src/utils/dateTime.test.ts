import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { formatDate, formatTime } from './dateTime';

describe('formatDate', () => {
  it('returns the trimmed date when parsable', () => {
    assert.equal(formatDate(' 2024-12-01 '), '2024-12-01');
  });

  it('returns fallback for an empty string', () => {
    assert.equal(formatDate(''), 'Invalid date');
  });

  it('returns fallback for whitespace-only input', () => {
    assert.equal(formatDate('   '), 'Invalid date');
  });

  it('returns fallback for malformed input', () => {
    assert.equal(formatDate('not-a-date'), 'Invalid date');
  });
});

describe('formatTime', () => {
  it('returns the trimmed time when parsable', () => {
    assert.equal(formatTime(' 14:30 '), '14:30');
  });

  it('returns fallback for an empty string', () => {
    assert.equal(formatTime(''), 'Invalid time');
  });

  it('returns fallback for whitespace-only input', () => {
    assert.equal(formatTime('   '), 'Invalid time');
  });

  it('returns fallback for malformed input', () => {
    assert.equal(formatTime('25:99'), 'Invalid time');
  });
});
