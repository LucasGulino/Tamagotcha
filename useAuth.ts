import { useState, useEffect, useCallback } from 'react'
import { supabase, getCurrentUser } from '@/lib/supabase'
import { authenticateWithWorldID, initializeMiniKit, isMiniKitAvailable } from '@/lib/minikit'
import { UserProfile, WorldIDVerification } from '@/types'
import { toast } from 'sonner'

interface UseAuthReturn {
  user: UserProfile | null
  loading: boolean
  error: string | null
  miniKitAvailable: boolean
  signIn: () => Promise<void>
  signOut: () => Promise<void>
  updateProfile: (data: Partial<UserProfile>) => Promise<void>
}

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [miniKitAvailable, setMiniKitAvailable] = useState(false)

  // Initialize auth state and MiniKit
  useEffect(() => {
    const initAuth = async () => {
      try {
        // Initialize MiniKit
        initializeMiniKit()
        setMiniKitAvailable(isMiniKitAvailable())

        const currentUser = await getCurrentUser()
        setUser(currentUser)
      } catch (err) {
        console.error('Error initializing auth:', err)
        setError('Failed to initialize authentication')
      } finally {
        setLoading(false)
      }
    }

    initAuth()

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          const currentUser = await getCurrentUser()
          setUser(currentUser)
        } else if (event === 'SIGNED_OUT') {
          setUser(null)
        }
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const signIn = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      if (!miniKitAvailable) {
        throw new Error('MiniKit is not available. Please open this app in World App.')
      }

      // Get World ID verification from MiniKit
      const verification = await authenticateWithWorldID()

      // Call our API to verify World ID and create/get user
      const response = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(verification),
      })

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || 'Authentication failed')
      }

      // Set the session in Supabase
      const { error: sessionError } = await supabase.auth.setSession({
        access_token: result.data.session.access_token,
        refresh_token: result.data.session.refresh_token,
      })

      if (sessionError) {
        throw sessionError
      }

      setUser(result.data.user)
      toast.success('Connexion réussie!')

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Authentication failed'
      setError(errorMessage)
      toast.error(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [miniKitAvailable])

  const signOut = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const { error } = await supabase.auth.signOut()
      if (error) throw error

      setUser(null)
      toast.success('Déconnexion réussie')

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Sign out failed'
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [])

  const updateProfile = useCallback(async (data: Partial<UserProfile>) => {
    if (!user) throw new Error('No user logged in')

    try {
      setLoading(true)
      setError(null)

      const { data: updatedUser, error } = await supabase
        .from('users')
        .update({
          username: data.username,
          avatar: data.avatar,
          region: data.region,
        })
        .eq('id', user.id)
        .select()
        .single()

      if (error) throw error

      setUser(updatedUser)
      toast.success('Profil mis à jour!')

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Profile update failed'
      setError(errorMessage)
      toast.error(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [user])

  return {
    user,
    loading,
    error,
    miniKitAvailable,
    signIn,
    signOut,
    updateProfile,
  }
}

