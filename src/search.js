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
  if (results.totalItems === 0 || (results.items && results.items.length === 0 && !results.totalItems)) {
    return { ...results, summary: 'No results found for your query. Try different keywords.' };
  }
  return {
    ...results,
    summary: `Showing page ${results.page} of ${results.totalPages}`,
  };
}

module.exports = { searchItems, paginate, formatSearchResults };
