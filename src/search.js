/**
 * Search module with pagination support.
 */

const { SearchCache } = require('./search-cache');

function searchItems(items, query) {
  if (!query) return [];
  const lowerQuery = query.toLowerCase();
  return items.filter(item =>
    item.title.toLowerCase().includes(lowerQuery) ||
    item.description.toLowerCase().includes(lowerQuery)
  );
}

function itemMatches(item, lowerQuery) {
  return item.title.toLowerCase().includes(lowerQuery) ||
    item.description.toLowerCase().includes(lowerQuery);
}

/**
 * Search over a mutable item list with cached results.
 * Adding/removing items invalidates only the affected cache entries.
 */
function createCachedSearch(items, cacheOptions) {
  const store = items.slice();
  const cache = new SearchCache(cacheOptions);
  return {
    search(query) {
      if (!query) return [];
      const cached = cache.get(query);
      if (cached) return cached;
      const results = searchItems(store, query);
      cache.set(query, results);
      return results;
    },
    addItem(item) {
      store.push(item);
      cache.invalidate(key => itemMatches(item, key));
    },
    removeItem(item) {
      const index = store.indexOf(item);
      if (index === -1) return false;
      store.splice(index, 1);
      cache.invalidate((key, results) => results.includes(item));
      return true;
    },
    stats: () => cache.stats(),
  };
}

function paginate(items, page, pageSize = 10) {
  const totalPages = Math.ceil(items.length / pageSize);
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

module.exports = { searchItems, createCachedSearch, paginate, formatSearchResults };
