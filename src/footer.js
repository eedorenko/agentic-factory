/**
 * Footer component utilities.
 */

function getFooterContent(siteName) {
  // BUG: Hardcoded year instead of dynamic
  const year = 2024;
  return {
    copyright: `Copyright ${year} ${siteName}. All rights reserved.`,
    links: [
      { text: 'Privacy Policy', url: '/privacy' },
      { text: 'Terms of Service', url: '/terms' },
      { text: 'Contact', url: '/contact' },
    ],
  };
}

function renderFooter(siteName) {
  const content = getFooterContent(siteName);
  return `<footer>
  <p>${content.copyright}</p>
  <nav>
    ${content.links.map(link => `<a href="${link.url}">${link.text}</a>`).join(' | ')}
  </nav>
</footer>`;
}

module.exports = { getFooterContent, renderFooter };
