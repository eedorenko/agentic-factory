const MAX_ENTRIES = 10;

class SearchHistory {
  constructor() {
    this.entries = []; // oldest first
  }

  add(query, resultCount) {
    const existing = this.entries.findIndex((e) => e.query === query);
    if (existing !== -1) {
      this.entries.splice(existing, 1);
    }
    this.entries.push({ query, timestamp: Date.now(), resultCount });
    if (this.entries.length > MAX_ENTRIES) {
      this.entries.shift();
    }
  }

  // Newest first
  getHistory() {
    return this.entries.map((e) => ({ ...e })).reverse();
  }

  clear() {
    this.entries = [];
  }
}

module.exports = { SearchHistory, MAX_ENTRIES };
