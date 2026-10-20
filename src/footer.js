/**
 * Footer component utilities.
 */

function getFooterContent(siteName, itemCount) {
  const year = new Date().getFullYear();
  const hasCount = typeof itemCount === 'number' && Number.isFinite(itemCount);
  return {
    ...(hasCount && { searchInfo: `Searching ${itemCount} items` }),
    copyright: `Copyright ${year} ${siteName}. All rights reserved.`,
    links: [
      { text: 'Privacy Policy', url: '/privacy' },
      { text: 'Terms of Service', url: '/terms' },
      { text: 'Contact', url: '/contact' },
    ],
  };
}

function renderFooter(siteName, itemCount) {
  const content = getFooterContent(siteName, itemCount);
  return `<footer>
  <p>${content.copyright}</p>
  ${content.searchInfo ? `<p>${content.searchInfo}</p>` : ''}
  <nav>
    ${content.links.map(link => `<a href="${link.url}">${link.text}</a>`).join(' | ')}
  </nav>
</footer>`;
}

module.exports = { getFooterContent, renderFooter };
