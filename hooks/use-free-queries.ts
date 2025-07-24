import { useState, useEffect, useCallback } from 'react';
import { useUser } from '@clerk/nextjs';
import { FreeQueryState, freeQueryManager } from '@/lib/freeQueries';

export interface UseFreeQueriesReturn {
  state: FreeQueryState;
  canMakeQuery: boolean;
  hasExhaustedQueries: boolean;
  consumeQuery: () => void;
  resetQueries: () => void;
  isLoading: boolean;
  requiresLogin: boolean;
}

/**
 * Hook to manage free queries for unauthenticated users
 */
export function useFreeQueries(): UseFreeQueriesReturn {
  const { isLoaded: userLoaded, isSignedIn } = useUser();
  const [state, setState] = useState<FreeQueryState>(() => freeQueryManager.getFreeQueryState());
  const [isLoading, setIsLoading] = useState(true);

  // Refresh state from localStorage
  const refreshState = useCallback(() => {
    const newState = freeQueryManager.getFreeQueryState();
    setState(newState);
  }, []);

  // Initialize state when component mounts
  useEffect(() => {
    if (userLoaded) {
      refreshState();
      setIsLoading(false);
    }
  }, [userLoaded, refreshState]);

  // Consume a free query
  const consumeQuery = useCallback(() => {
    try {
      const newState = freeQueryManager.consumeFreeQuery();
      setState(newState);
    } catch (error) {
      console.error('Failed to consume free query:', error);
      refreshState(); // Refresh to get current state
    }
  }, [refreshState]);

  // Reset queries (admin function)
  const resetQueries = useCallback(() => {
    const newState = freeQueryManager.resetFreeQueries();
    setState(newState);
  }, []);

  // Computed values
  const canMakeQuery = isSignedIn || state.remainingQueries > 0;
  const hasExhaustedQueries = !isSignedIn && state.remainingQueries === 0;
  const requiresLogin = !isSignedIn && state.remainingQueries === 0;

  return {
    state,
    canMakeQuery,
    hasExhaustedQueries,
    consumeQuery,
    resetQueries,
    isLoading,
    requiresLogin,
  };
}
