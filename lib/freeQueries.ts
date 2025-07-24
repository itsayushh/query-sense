/**
 * Free Query Management System
 * Manages the free query quota using localStorage
 */

export interface FreeQueryState {
  remainingQueries: number;
  totalQueries: number;
  lastReset: string;
  hasUsedFreeQueries: boolean;
}

const FREE_QUERY_KEY = 'query_sense_free_queries';
const MAX_FREE_QUERIES = 5;
const RESET_INTERVAL_DAYS = 30; // Reset every 30 days

export class FreeQueryManager {
  private static instance: FreeQueryManager | null = null;

  static getInstance(): FreeQueryManager {
    if (!this.instance) {
      this.instance = new FreeQueryManager();
    }
    return this.instance;
  }

  /**
   * Get the current free query state
   */
  getFreeQueryState(): FreeQueryState {
    if (typeof window === 'undefined') {
      // Server-side rendering - return default state
      return {
        remainingQueries: MAX_FREE_QUERIES,
        totalQueries: MAX_FREE_QUERIES,
        lastReset: new Date().toISOString(),
        hasUsedFreeQueries: false,
      };
    }

    const stored = localStorage.getItem(FREE_QUERY_KEY);
    
    if (!stored) {
      // First time user
      const initialState: FreeQueryState = {
        remainingQueries: MAX_FREE_QUERIES,
        totalQueries: MAX_FREE_QUERIES,
        lastReset: new Date().toISOString(),
        hasUsedFreeQueries: false,
      };
      this.saveFreeQueryState(initialState);
      return initialState;
    }

    try {
      const state: FreeQueryState = JSON.parse(stored);
      
      // Check if we need to reset the quota
      if (this.shouldResetQuota(state.lastReset)) {
        const resetState: FreeQueryState = {
          remainingQueries: MAX_FREE_QUERIES,
          totalQueries: MAX_FREE_QUERIES,
          lastReset: new Date().toISOString(),
          hasUsedFreeQueries: state.hasUsedFreeQueries,
        };
        this.saveFreeQueryState(resetState);
        return resetState;
      }

      return state;
    } catch (error) {
      console.error('Error parsing free query state:', error);
      // Reset to default state on error
      const defaultState: FreeQueryState = {
        remainingQueries: MAX_FREE_QUERIES,
        totalQueries: MAX_FREE_QUERIES,
        lastReset: new Date().toISOString(),
        hasUsedFreeQueries: false,
      };
      this.saveFreeQueryState(defaultState);
      return defaultState;
    }
  }

  /**
   * Check if user can make a free query
   */
  canMakeFreeQuery(): boolean {
    const state = this.getFreeQueryState();
    return state.remainingQueries > 0;
  }

  /**
   * Consume a free query
   */
  consumeFreeQuery(): FreeQueryState {
    const state = this.getFreeQueryState();
    
    if (state.remainingQueries <= 0) {
      throw new Error('No free queries remaining');
    }

    const newState: FreeQueryState = {
      ...state,
      remainingQueries: state.remainingQueries - 1,
      hasUsedFreeQueries: true,
    };

    this.saveFreeQueryState(newState);
    return newState;
  }

  /**
   * Reset the free query quota (admin function or for testing)
   */
  resetFreeQueries(): FreeQueryState {
    const newState: FreeQueryState = {
      remainingQueries: MAX_FREE_QUERIES,
      totalQueries: MAX_FREE_QUERIES,
      lastReset: new Date().toISOString(),
      hasUsedFreeQueries: false,
    };
    this.saveFreeQueryState(newState);
    return newState;
  }

  /**
   * Clear all free query data
   */
  clearFreeQueryData(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(FREE_QUERY_KEY);
    }
  }

  /**
   * Get remaining queries count
   */
  getRemainingQueries(): number {
    return this.getFreeQueryState().remainingQueries;
  }

  /**
   * Check if user has exhausted free queries
   */
  hasExhaustedFreeQueries(): boolean {
    return this.getRemainingQueries() === 0;
  }

  private saveFreeQueryState(state: FreeQueryState): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(FREE_QUERY_KEY, JSON.stringify(state));
    }
  }

  private shouldResetQuota(lastReset: string): boolean {
    const lastResetDate = new Date(lastReset);
    const now = new Date();
    const daysDiff = Math.floor((now.getTime() - lastResetDate.getTime()) / (1000 * 60 * 60 * 24));
    return daysDiff >= RESET_INTERVAL_DAYS;
  }
}

// Export convenience functions
export const freeQueryManager = FreeQueryManager.getInstance();

export const getFreeQueryState = () => freeQueryManager.getFreeQueryState();
export const canMakeFreeQuery = () => freeQueryManager.canMakeFreeQuery();
export const consumeFreeQuery = () => freeQueryManager.consumeFreeQuery();
export const getRemainingQueries = () => freeQueryManager.getRemainingQueries();
export const hasExhaustedFreeQueries = () => freeQueryManager.hasExhaustedFreeQueries();
export const resetFreeQueries = () => freeQueryManager.resetFreeQueries();
