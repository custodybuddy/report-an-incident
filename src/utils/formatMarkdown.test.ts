import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { DEFAULT_MARKDOWN_ICON, formatMarkdown } from './formatMarkdown';

describe('formatMarkdown', () => {
  it('formats markdown with UI styling defaults for on-screen rendering', () => {
    const html = formatMarkdown('Paragraph with [link](https://example.com) and **bold** text.\n\nNext line.', {
      paragraphClassName: 'mb-4 last:mb-0',
      linkClassName: 'text-amber-400 hover:underline inline-flex items-center',
      fallbackText: 'N/A',
      fallbackClassName: 'mb-4 text-slate-500',
    });

    const expectedLink =
      `<a href="https://example.com" target="_blank" rel="noopener noreferrer" class="text-amber-400 hover:underline inline-flex items-center">link` +
      `<span class="sr-only">(opens in new tab)</span>${DEFAULT_MARKDOWN_ICON}</a>`;

    const expected =
      `<p class="mb-4 last:mb-0">Paragraph with ${expectedLink} and <strong>bold</strong> text.</p>` +
      '<p class="mb-4 last:mb-0">Next line.</p>';

    assert.equal(html, expected);
  });

  it('applies export-specific fallback styling when content is missing', () => {
    const html = formatMarkdown(undefined, {
      paragraphClassName: 'mb-4 last:mb-0',
      linkClassName: 'text-amber-400 hover:underline inline-flex items-center',
      fallbackText: 'Content pending review',
      fallbackClassName: 'muted',
    });

    assert.equal(html, '<p class="muted">Content pending review</p>');
  });

  it('omits screen reader text and icons when disabled via options', () => {
    const html = formatMarkdown('Review the [source](https://example.com)', {
      paragraphClassName: '',
      linkClassName: 'export-link',
      includeExternalIcon: false,
      screenReaderLabel: null,
      linkTarget: '',
      linkRel: '',
      fallbackText: 'N/A',
      fallbackClassName: '',
    });

    assert.equal(
      html,
      '<p>Review the <a href="https://example.com" class="export-link">source</a></p>',
    );
  });
});
