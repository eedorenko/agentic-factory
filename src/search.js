/**
 * Search module with pagination support.
 */

const SCORES = { exactTitle: 100, partialTitle: 50, description: 10 };

function scoreItem(item, query) {
  const q = query.toLowerCase();
  const title = (item.title || '').toLowerCase();
  const description = (item.description || '').toLowerCase();
  let score = 0;
  if (title === q) score += SCORES.exactTitle;
  else if (title.includes(q)) score += SCORES.partialTitle;
  if (description.includes(q)) score += SCORES.description;
  return score;
}

function searchItems(items, query) {
  if (!query) return [];
  return items
    .map((item, index) => ({ item, index, score: scoreItem(item, query) }))
    .filter(r => r.score > 0)
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .map(r => ({ ...r.item, score: r.score }));
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

module.exports = { scoreItem, searchItems, paginate, formatSearchResults };
