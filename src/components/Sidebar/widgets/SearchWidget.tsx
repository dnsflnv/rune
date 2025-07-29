import { useState } from 'react';
import { observer } from 'mobx-react-lite';
import { searchStore } from '../../../stores/searchStore';

export const SearchWidget = observer(() => {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    searchStore.performSearch(searchQuery);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);

    // Perform search as user types
    if (query.trim()) {
      searchStore.performSearch(query);
    } else {
      searchStore.clearSearch();
    }
  };

  return (
    <div className="p-4">
      <form onSubmit={handleSearch}>
        <div className="relative">
          <input
            type="text"
            placeholder="Search runestones..."
            value={searchQuery}
            onChange={handleInputChange}
            className="w-full px-3 py-2 pr-12 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
          <button
            type="submit"
            disabled={searchStore.isLoading}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 text-primary hover:text-primary/80 transition-colors disabled:opacity-50"
          >
            {searchStore.isLoading ? (
              <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            )}
          </button>
        </div>
      </form>

      {/* Search Results */}
      {searchStore.hasSearched && (
        <div className="mt-4">
          {searchStore.isLoading ? (
            <div className="text-sm text-gray-500 text-center py-2">Searching...</div>
          ) : searchStore.hasResults ? (
            <div className="space-y-2">
              <div className="text-sm text-gray-600">
                Found {searchStore.resultCount} result{searchStore.resultCount !== 1 ? 's' : ''}
              </div>
              <div className="max-h-64 overflow-y-auto space-y-1">
                {searchStore.searchResults.slice(0, 10).map((runestone) => (
                  <div
                    key={runestone.id}
                    className="p-2 text-sm bg-gray-50 rounded cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => {
                      searchStore.setSelectedRunestone(runestone);
                    }}
                  >
                    <div className="font-medium">{runestone.signature_text}</div>
                    <div className="text-xs text-gray-500">
                      {runestone.found_location}, {runestone.parish}
                    </div>
                  </div>
                ))}
                {searchStore.resultCount > 10 && (
                  <div className="text-xs text-gray-500 text-center py-1">
                    Showing first 10 of {searchStore.resultCount} results
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-sm text-gray-500 text-center py-2">No runestones found</div>
          )}
        </div>
      )}
    </div>
  );
});
