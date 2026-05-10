/**
 * Search History Management
 * Stores and manages search history in localStorage
 */

const SEARCH_HISTORY_KEY = 'vocablearn_search_history';
const MAX_HISTORY_ITEMS = 15;

export interface SearchHistoryItem {
  query: string;
  timestamp: number;
}

/**
 * Get all search history items
 */
export function getSearchHistory(): SearchHistoryItem[] {
  try {
    const data = localStorage.getItem(SEARCH_HISTORY_KEY);
    if (!data) return [];
    return JSON.parse(data) as SearchHistoryItem[];
  } catch (error) {
    console.error('Failed to get search history:', error);
    return [];
  }
}

/**
 * Add a search query to history
 */
export function addToSearchHistory(query: string): void {
  if (!query.trim()) return;

  try {
    const history = getSearchHistory();
    
    // Remove duplicate if exists
    const filtered = history.filter(item => item.query.toLowerCase() !== query.toLowerCase());
    
    // Add new item to the beginning
    const newHistory: SearchHistoryItem[] = [
      { query: query.trim(), timestamp: Date.now() },
      ...filtered,
    ];
    
    // Keep only the latest MAX_HISTORY_ITEMS
    const trimmed = newHistory.slice(0, MAX_HISTORY_ITEMS);
    
    localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(trimmed));
  } catch (error) {
    console.error('Failed to add to search history:', error);
  }
}

/**
 * Remove a specific search query from history
 */
export function removeFromSearchHistory(query: string): void {
  try {
    const history = getSearchHistory();
    const filtered = history.filter(item => item.query !== query);
    localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error('Failed to remove from search history:', error);
  }
}

/**
 * Clear all search history
 */
export function clearSearchHistory(): void {
  try {
    localStorage.removeItem(SEARCH_HISTORY_KEY);
  } catch (error) {
    console.error('Failed to clear search history:', error);
  }
}

/**
 * Get recent search queries (sorted by timestamp, newest first)
 */
export function getRecentSearches(limit: number = 5): SearchHistoryItem[] {
  const history = getSearchHistory();
  return history.slice(0, limit);
}
