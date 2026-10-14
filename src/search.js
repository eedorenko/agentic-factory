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

function normalizeQuery(query) {
  return query ? query.trim().toLowerCase() : '';
}

/**
 * Owns an items list and caches normalized searches.
 * Options: ttlMs (default 300000), maxSize (default 100), now (default Date.now).
 * removeItem accepts an item reference or predicate; stats returns lifetime counters.
 * Item fields should not be mutated while stored; remove and re-add to update them.
 */
function createCachedSearch(items, options) {
  let storedItems = items.slice();
  const cache = new SearchCache(options);

  return {
    search(query) {
      const key = normalizeQuery(query);
      if (!key) return [];
      let results = cache.get(key);
      if (results === undefined) {
        results = searchItems(storedItems, key);
        cache.set(key, results);
      }
      return results.slice();
    },
    addItem(item) {
      storedItems.push(item);
      cache.invalidate(key => searchItems([item], key).length > 0);
    },
    removeItem(itemOrPredicate) {
      const predicate = typeof itemOrPredicate === 'function'
        ? itemOrPredicate
        : item => item === itemOrPredicate;
      const removed = new Set();
      const remaining = storedItems.filter(item => {
        if (!predicate(item)) return true;
        removed.add(item);
        return false;
      });
      if (!removed.size) return;
      storedItems = remaining;
      cache.invalidate((key, results) => results.some(item => removed.has(item)));
    },
    stats() {
      return cache.stats();
    },
  };
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

module.exports = { searchItems, createCachedSearch, paginate, formatSearchResults };
