/**
 * @file use-auth.ts
 * @description Custom hook for managing authentication state and user session
 */

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '@/store/store'
import { setUser, setLoading, setError } from '@/store/slices/userSlice'
import { supabase } from '@/lib/api'

/**
 * Custom hook that provides authentication state and user session management
 * 
 * @returns Object containing user state and auth methods
 */
export function useAuth() {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const { user, isLoading, error } = useAppSelector((state) => state.user)

  useEffect(() => {
    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN') {
        dispatch(setLoading(true))
        try {
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session!.user.id)
            .single()

          if (profileError) throw profileError

          if (profile) {
            dispatch(setUser(profile))
          } else {
            router.push('/onboarding')
          }
        } catch (error) {
          console.error('Error fetching profile:', error)
          dispatch(setError('שגיאה בטעינת הפרופיל'))
        } finally {
          dispatch(setLoading(false))
        }
      } else if (event === 'SIGNED_OUT') {
        dispatch(setUser(null))
        router.push('/login')
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [dispatch, router])

  const signIn = async (email: string, password: string) => {
    dispatch(setLoading(true))
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) throw error
    } catch (error) {
      console.error('Error signing in:', error)
      dispatch(setError('שגיאה בהתחברות'))
    } finally {
      dispatch(setLoading(false))
    }
  }

  const signUp = async (email: string, password: string) => {
    dispatch(setLoading(true))
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })
      if (error) throw error
      router.push('/verify-email')
    } catch (error) {
      console.error('Error signing up:', error)
      dispatch(setError('שגיאה בהרשמה'))
    } finally {
      dispatch(setLoading(false))
    }
  }

  const signOut = async () => {
    dispatch(setLoading(true))
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
    } catch (error) {
      console.error('Error signing out:', error)
      dispatch(setError('שגיאה בהתנתקות'))
    } finally {
      dispatch(setLoading(false))
    }
  }

  return {
    user,
    isLoading,
    error,
    signIn,
    signUp,
    signOut,
  }
} 