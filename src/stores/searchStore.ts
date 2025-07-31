import { observable, computed, action, runInAction, makeObservable } from 'mobx';
import { Runestone } from '../types';
import { runestonesCache } from '../services/runestonesCache';

class SearchStore {
  @observable searchQuery: string = '';
  @observable searchResults: Runestone[] = [];
  @observable isLoading: boolean = false;
  @observable hasSearched: boolean = false;
  @observable selectedRunestone: Runestone | null = null;

  constructor() {
    makeObservable(this);
  }

  @action
  setSearchQuery(query: string) {
    this.searchQuery = query;
  }

  @action
  setSearchResults(results: Runestone[]) {
    this.searchResults = results;
  }

  @action
  setLoading(loading: boolean) {
    this.isLoading = loading;
  }

  @action
  setHasSearched(searched: boolean) {
    this.hasSearched = searched;
  }

  @action
  setSelectedRunestone(runestone: Runestone | null) {
    this.selectedRunestone = runestone;
  }

  @action
  async performSearch(query: string) {
    if (!query.trim()) {
      runInAction(() => {
        this.setSearchResults([]);
        this.setHasSearched(false);
      });
      return;
    }

    runInAction(() => {
      this.setSearchQuery(query);
      this.setLoading(true);
      this.setHasSearched(true);
    });

    try {
      // Use the efficient search function from runestonesCache
      const results = await runestonesCache.searchRunestones(query, 100);

      runInAction(() => {
        this.setSearchResults(results);
      });
    } catch (error) {
      console.error('Error performing search:', error);
      runInAction(() => {
        this.setSearchResults([]);
      });
    } finally {
      runInAction(() => {
        this.setLoading(false);
      });
    }
  }

  @action
  clearSearch() {
    this.setSearchQuery('');
    this.setSearchResults([]);
    this.setHasSearched(false);
    this.setSelectedRunestone(null);
  }

  @computed
  get hasResults() {
    return this.searchResults.length > 0;
  }

  @computed
  get resultCount() {
    return this.searchResults.length;
  }

  @computed
  get isEmptySearch() {
    return this.hasSearched && !this.isLoading && this.searchResults.length === 0;
  }
}

// Create and export a singleton instance
export const searchStore = new SearchStore();
