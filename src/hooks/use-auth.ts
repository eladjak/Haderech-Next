/**
 * @file use-auth.ts
 * @description Custom hook for managing authentication state and user session
 */

import { useRouter } from 'next/navigation'
import { useEffect, useCallback } from 'react'
import { useAppDispatch, useAppSelector } from '@/store/store'
import { setUser, setLoading, setError } from '@/store/slices/userSlice'
import { supabase } from '@/lib/api'
import { useToast } from '@/hooks/use-toast'

/**
 * Custom hook that provides authentication state and user session management
 * 
 * @returns Object containing user state and auth methods
 */
export function useAuth() {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const { user, loading, error } = useAppSelector((state) => ({
    user: state.user.user,
    loading: state.user.loading,
    error: state.user.error
  }))
  const { toast } = useToast()

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

  const signIn = useCallback(async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) throw error

      toast({
        title: 'התחברת בהצלחה',
        description: 'ברוך הבא חזרה!'
      })
    } catch (error) {
      console.error('Error signing in:', error)
      toast({
        title: 'שגיאה בהתחברות',
        description: 'אנא נסה שוב מאוחר יותר'
      })
    }
  }, [toast])

  const signUp = useCallback(async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      })

      if (error) throw error

      toast({
        title: 'נרשמת בהצלחה',
        description: 'נשלח אליך מייל אימות'
      })
    } catch (error) {
      console.error('Error signing up:', error)
      toast({
        title: 'שגיאה בהרשמה',
        description: 'אנא נסה שוב מאוחר יותר'
      })
    }
  }, [toast])

  const signOut = useCallback(async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error

      toast({
        title: 'התנתקת בהצלחה',
        description: 'להתראות!'
      })
    } catch (error) {
      console.error('Error signing out:', error)
      toast({
        title: 'שגיאה בהתנתקות',
        description: 'אנא נסה שוב מאוחר יותר'
      })
    }
  }, [toast])

  return {
    user,
    loading,
    error,
    signIn,
    signUp,
    signOut
  }
} 