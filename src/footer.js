/**
 * Footer component utilities.
 */

function getFooterContent(siteName, itemCount) {
  const year = new Date().getFullYear();
  const content = {
    copyright: `Copyright ${year} ${siteName}. All rights reserved.`,
    links: [
      { text: 'Privacy Policy', url: '/privacy' },
      { text: 'Terms of Service', url: '/terms' },
      { text: 'Contact', url: '/contact' },
    ],
  };
  if (itemCount !== undefined && itemCount !== null) {
    const count = Number(itemCount);
    if (Number.isFinite(count)) {
      content.searchInfo = `Searching ${count} items`;
    }
  }
  return content;
}

function renderFooter(siteName, itemCount) {
  const content = getFooterContent(siteName, itemCount);
  return `<footer>
  <p>${content.copyright}</p>${content.searchInfo ? `\n  <p>${content.searchInfo}</p>` : ''}
  <nav>
    ${content.links.map(link => `<a href="${link.url}">${link.text}</a>`).join(' | ')}
  </nav>
</footer>`;
}

module.exports = { getFooterContent, renderFooter };
