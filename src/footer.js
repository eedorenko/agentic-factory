/**
 * Footer component utilities.
 */

function getFooterContent(siteName, itemCount) {
  // BUG: Hardcoded year instead of dynamic
  const year = 2024;
  const content = {
    copyright: `Copyright ${year} ${siteName}. All rights reserved.`,
    links: [
      { text: 'Privacy Policy', url: '/privacy' },
      { text: 'Terms of Service', url: '/terms' },
      { text: 'Contact', url: '/contact' },
    ],
  };
  if (itemCount !== undefined && itemCount !== null) {
    content.searchInfo = `Searching ${itemCount} items`;
  }
  return content;
}

function renderFooter(siteName, itemCount) {
  const content = getFooterContent(siteName, itemCount);
  const searchInfo = content.searchInfo ? `\n  <p>${content.searchInfo}</p>` : '';
  return `<footer>
  <p>${content.copyright}</p>${searchInfo}
  <nav>
    ${content.links.map(link => `<a href="${link.url}">${link.text}</a>`).join(' | ')}
  </nav>
</footer>`;
}

module.exports = { getFooterContent, renderFooter };
