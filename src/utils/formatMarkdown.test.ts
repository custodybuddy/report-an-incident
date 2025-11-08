import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { DEFAULT_MARKDOWN_ICON, formatMarkdown } from './formatMarkdown';
import { formatReportContent } from '../components/ui/utils/markdownParser';
import { formatSectionContent } from '../services/utils/markdownParser';

describe('context-specific markdown formatters', () => {
  it('formats report content with UI styling defaults for on-screen rendering', () => {
    const html = formatReportContent('Paragraph with [link](https://example.com) and **bold** text.\n\nNext line.');

    const expectedLink =
      `<a href="https://example.com" target="_blank" rel="noopener noreferrer" class="text-amber-400 hover:underline inline-flex items-center">link` +
      `<span class="sr-only">(opens in new tab)</span>${DEFAULT_MARKDOWN_ICON}</a>`;

    const expected =
      `<p class="mb-4 last:mb-0">Paragraph with ${expectedLink} and <strong>bold</strong> text.</p>` +
      '<p class="mb-4 last:mb-0">Next line.</p>';

    assert.equal(html, expected);
  });

  it('applies export-specific fallback styling when section content is missing', () => {
    const html = formatSectionContent(undefined, {
      fallbackText: 'Content pending review',
    });

    assert.equal(html, '<p class="muted">Content pending review</p>');
  });
});

describe('formatMarkdown', () => {
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
