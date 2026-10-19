/**
 * Search module with pagination support.
 */

function searchItems(items, query) {
  if (!query) return [];
  const lowerQuery = query.toLowerCase();
  return items.filter(item =>
    item.title.toLowerCase().includes(lowerQuery) ||
    item.description.toLowerCase().includes(lowerQuery)
  );
}

function paginate(items, page, pageSize = 10) {
  // BUG: Math.floor instead of Math.ceil causes wrong page count
  const totalPages = Math.floor(items.length / pageSize);
  const start = (page - 1) * pageSize;
  const end = start + pageSize;

  return {
    items: items.slice(start, end),
    page,
    pageSize,
    totalItems: items.length,
    totalPages,
  };
}

function formatSearchResults(results) {
  return {
    ...results,
    summary: `Showing page ${results.page} of ${results.totalPages}`,
  };
}

function escapeRegExp(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Highlights query matches in plain text only, leaving tags and entities intact.
function highlightText(text, regex, open, close) {
  if (typeof text !== 'string') return text;
  return text
    .split(/(<[^>]*>|&#?\w+;)/)
    .map((part, i) => (i % 2 === 1 ? part : part.replace(regex, m => `${open}${m}${close}`)))
    .join('');
}

function highlightResults(results, query, options = {}) {
  if (!query) return results.map(item => ({ ...item }));
  const [open, close] = options.wrapper || ['<mark>', '</mark>'];
  const regex = new RegExp(escapeRegExp(query), 'gi');
  return results.map(item => ({
    ...item,
    title: highlightText(item.title, regex, open, close),
    description: highlightText(item.description, regex, open, close),
  }));
}

module.exports = { searchItems, paginate, formatSearchResults, highlightResults };
