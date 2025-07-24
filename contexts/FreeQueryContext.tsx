'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useUser } from '@clerk/nextjs'

interface FreeQueryContextType {
  remainingQueries: number
  hasExhaustedQueries: boolean
  canMakeQuery: boolean
  consumeQuery: () => void
  resetQueries: () => void
  isLoading: boolean
}

const FreeQueryContext = createContext<FreeQueryContextType | undefined>(undefined)

const MAX_FREE_QUERIES = 5
const STORAGE_KEY = 'query_sense_free_count'

export function FreeQueryProvider({ children }: { children: ReactNode }) {
  const { isSignedIn, isLoaded } = useUser()
  const [remainingQueries, setRemainingQueries] = useState(MAX_FREE_QUERIES)
  const [isLoading, setIsLoading] = useState(true)

  // Initialize and sync with localStorage
  useEffect(() => {
    if (!isLoaded) return

    const initializeQueries = () => {
      if (typeof window === 'undefined') return

      try {
        const stored = localStorage.getItem(STORAGE_KEY)
        const used = stored ? parseInt(stored, 10) : 0
        const remaining = Math.max(0, MAX_FREE_QUERIES - used)
        setRemainingQueries(remaining)
        
        // Update cookie for middleware
        document.cookie = `free_queries_used=${used}; path=/; max-age=${30 * 24 * 60 * 60}` // 30 days
      } catch (error) {
        console.error('Error initializing free queries:', error)
        setRemainingQueries(MAX_FREE_QUERIES)
      } finally {
        setIsLoading(false)
      }
    }

    initializeQueries()
  }, [isLoaded])

  const consumeQuery = () => {
    if (isSignedIn || remainingQueries <= 0) return

    const newRemaining = remainingQueries - 1
    const used = MAX_FREE_QUERIES - newRemaining

    setRemainingQueries(newRemaining)
    
    try {
      localStorage.setItem(STORAGE_KEY, used.toString())
      document.cookie = `free_queries_used=${used}; path=/; max-age=${30 * 24 * 60 * 60}`
    } catch (error) {
      console.error('Error updating free queries:', error)
    }
  }

  const resetQueries = () => {
    setRemainingQueries(MAX_FREE_QUERIES)
    try {
      localStorage.removeItem(STORAGE_KEY)
      document.cookie = 'free_queries_used=0; path=/; max-age=0' // Clear cookie
    } catch (error) {
      console.error('Error resetting free queries:', error)
    }
  }

  const hasExhaustedQueries = !isSignedIn && remainingQueries === 0
  const canMakeQuery = isSignedIn || remainingQueries > 0

  return (
    <FreeQueryContext.Provider
      value={{
        remainingQueries,
        hasExhaustedQueries,
        canMakeQuery,
        consumeQuery,
        resetQueries,
        isLoading
      }}
    >
      {children}
    </FreeQueryContext.Provider>
  )
}

export function useFreeQueries() {
  const context = useContext(FreeQueryContext)
  if (context === undefined) {
    throw new Error('useFreeQueries must be used within a FreeQueryProvider')
  }
  return context
}

// Simple hook for just checking if queries are available (no context needed)
export function useCanMakeQuery() {
  const { isSignedIn } = useUser()
  const [canMake, setCanMake] = useState(true)

  useEffect(() => {
    if (isSignedIn) {
      setCanMake(true)
      return
    }

    if (typeof window === 'undefined') return

    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      const used = stored ? parseInt(stored, 10) : 0
      setCanMake(used < MAX_FREE_QUERIES)
    } catch {
      setCanMake(true)
    }
  }, [isSignedIn])

  return canMake
}
