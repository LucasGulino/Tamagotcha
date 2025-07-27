import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { LeaderboardData, UseLeaderboardReturn } from '@/types'
import { getCurrentWeek } from '@/lib/utils'
import { toast } from 'sonner'

export function useLeaderboard(
  region: string = 'global',
  week?: string
): UseLeaderboardReturn {
  const [leaderboard, setLeaderboard] = useState<LeaderboardData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentWeek, setCurrentWeek] = useState(week || getCurrentWeek())

  const fetchLeaderboard = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams({
        week: currentWeek,
        region,
        limit: '10'
      })

      const response = await fetch(`/api/leaderboard?${params}`)
      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch leaderboard')
      }

      setLeaderboard(result.data || [])

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch leaderboard'
      setError(errorMessage)
      console.error('Leaderboard fetch error:', err)
    } finally {
      setLoading(false)
    }
  }, [currentWeek, region])

  const refresh = useCallback(() => {
    fetchLeaderboard()
  }, [fetchLeaderboard])

  // Initial load
  useEffect(() => {
    fetchLeaderboard()
  }, [fetchLeaderboard])

  // Real-time updates for leaderboard
  useEffect(() => {
    const channel = supabase
      .channel(`leaderboard-${currentWeek}-${region}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'leaderboard_entries',
          filter: `week=eq.${currentWeek}.and.region=eq.${region}`
        },
        () => {
          // Refresh leaderboard when entries change
          fetchLeaderboard()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [currentWeek, region, fetchLeaderboard])

  // Update current week if prop changes
  useEffect(() => {
    if (week && week !== currentWeek) {
      setCurrentWeek(week)
    }
  }, [week, currentWeek])

  return {
    leaderboard,
    loading,
    error,
    currentWeek,
    refresh,
  }
}

