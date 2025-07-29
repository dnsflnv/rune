import { makeAutoObservable } from 'mobx';
import { Runestone } from '../types';
import { runestonesCache } from '../services/runestonesCache';

class SearchStore {
  searchQuery: string = '';
  searchResults: Runestone[] = [];
  isLoading: boolean = false;
  hasSearched: boolean = false;

  constructor() {
    makeAutoObservable(this);
  }

  setSearchQuery(query: string) {
    this.searchQuery = query;
  }

  setSearchResults(results: Runestone[]) {
    this.searchResults = results;
  }

  setLoading(loading: boolean) {
    this.isLoading = loading;
  }

  setHasSearched(searched: boolean) {
    this.hasSearched = searched;
  }

  async performSearch(query: string) {
    if (!query.trim()) {
      this.setSearchResults([]);
      this.setHasSearched(false);
      return;
    }

    this.setSearchQuery(query);
    this.setLoading(true);
    this.setHasSearched(true);

    try {
      // Use the efficient search function from runestonesCache
      const results = await runestonesCache.searchRunestones(query, 100);

      this.setSearchResults(results);
    } catch (error) {
      console.error('Error performing search:', error);
      this.setSearchResults([]);
    } finally {
      this.setLoading(false);
    }
  }

  clearSearch() {
    this.setSearchQuery('');
    this.setSearchResults([]);
    this.setHasSearched(false);
  }

  get hasResults() {
    return this.searchResults.length > 0;
  }

  get resultCount() {
    return this.searchResults.length;
  }

  get isEmptySearch() {
    return this.hasSearched && !this.isLoading && this.searchResults.length === 0;
  }
}

// Create and export a singleton instance
export const searchStore = new SearchStore();
