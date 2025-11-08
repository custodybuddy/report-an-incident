
/**
 * Parses a string with simple markdown (links, bold) and newlines into styled HTML.
 * This utility ensures consistent formatting for AI-generated content across the application.
 *
 * @param text The raw string to format, which may contain markdown and newline characters.
 * @returns An HTML string with paragraphs, links, and bold text. Paragraphs are styled
 *          with bottom margins to ensure readability of consecutive blocks of text.
 */
export const formatReportContent = (text: string | undefined | null): string => {
    if (!text) {
        // Provide a default styled paragraph for empty content.
        return '<p class="mb-4 text-slate-500">N/A</p>';
    }

    // SVG icon for external links. It's marked as decorative for screen readers.
    const externalLinkIcon = `<svg class="w-3 h-3 inline-block ml-1 opacity-80" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" /></svg>`;


    // 1. Handle markdown for links and bold text.
    let html = text
        .replace(/\[(.*?)\]\((.*?)\)/g, `<a href="$2" target="_blank" rel="noopener noreferrer" class="text-amber-400 hover:underline inline-flex items-center">$1<span class="sr-only">(opens in new tab)</span>${externalLinkIcon}</a>`)
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

    // 2. Split text into paragraphs based on newlines, filter out empty lines,
    //    and wrap each paragraph in a <p> tag with spacing classes.
    //    `mb-4` adds a bottom margin, and `last:mb-0` removes it from the last
    //    paragraph to prevent extra space at the end of the section.
    return html
        .split('\n')
        .filter(paragraph => paragraph.trim() !== '')
        .map(paragraph => `<p class="mb-4 last:mb-0">${paragraph}</p>`)
        .join('');
};
