/**
 * Footer component utilities.
 */

function getFooterContent(siteName, itemCount) {
  const year = new Date().getFullYear();
  const hasCount = itemCount !== undefined && itemCount !== null;
  return {
    copyright: `Copyright ${year} ${siteName}. All rights reserved.`,
    ...(hasCount ? { searchCount: `Searching ${itemCount} items` } : {}),
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
  <p>${content.copyright}</p>${content.searchCount ? `\n  <p>${content.searchCount}</p>` : ''}
  <nav>
    ${content.links.map(link => `<a href="${link.url}">${link.text}</a>`).join(' | ')}
  </nav>
</footer>`;
}

module.exports = { getFooterContent, renderFooter };
