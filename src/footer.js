/**
 * Footer component utilities.
 */

function getFooterContent(siteName, itemCount) {
  // BUG: Hardcoded year instead of dynamic
  const year = 2024;
  return {
    copyright: `Copyright ${year} ${siteName}. All rights reserved.`,
    links: [
      { text: 'Privacy Policy', url: '/privacy' },
      { text: 'Terms of Service', url: '/terms' },
      { text: 'Contact', url: '/contact' },
    ],
    ...(itemCount !== undefined && itemCount !== null && { itemCountText: `Searching ${itemCount} items` }),
  };
}

function renderFooter(siteName, itemCount) {
  const content = getFooterContent(siteName, itemCount);
  return `<footer>
  <p>${content.copyright}</p>${content.itemCountText ? `\n  <p>${content.itemCountText}</p>` : ''}
  <nav>
    ${content.links.map(link => `<a href="${link.url}">${link.text}</a>`).join(' | ')}
  </nav>
</footer>`;
}

module.exports = { getFooterContent, renderFooter };
