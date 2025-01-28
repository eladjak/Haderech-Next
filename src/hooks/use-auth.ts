import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '@/store/store'
import { setUser, setLoading, setError } from '@/store/slices/userSlice'

export function useAuth() {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const { user, isLoading, error } = useAppSelector((state) => state.user)
  const supabase = createClientComponentClient()

  useEffect(() => {
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
  }, [dispatch, router, supabase])

  const signIn = async (email: string, password: string) => {
    try {
      dispatch(setLoading(true))
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) throw error
      router.push('/')
    } catch (error) {
      console.error('Error signing in:', error)
      dispatch(setError('שגיאה בהתחברות'))
      return false
    } finally {
      dispatch(setLoading(false))
    }
    return true
  }

  const signUp = async (email: string, password: string, name: string) => {
    try {
      dispatch(setLoading(true))
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
          },
        },
      })
      if (error) throw error
      router.push('/onboarding')
    } catch (error) {
      console.error('Error signing up:', error)
      dispatch(setError('שגיאה בהרשמה'))
      return false
    } finally {
      dispatch(setLoading(false))
    }
    return true
  }

  const signOut = async () => {
    try {
      dispatch(setLoading(true))
      const { error } = await supabase.auth.signOut()
      if (error) throw error
    } catch (error) {
      console.error('Error signing out:', error)
      dispatch(setError('שגיאה בהתנתקות'))
      return false
    } finally {
      dispatch(setLoading(false))
    }
    return true
  }

  const resetPassword = async (email: string) => {
    try {
      dispatch(setLoading(true))
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })
      if (error) throw error
    } catch (error) {
      console.error('Error resetting password:', error)
      dispatch(setError('שגיאה באיפוס הסיסמה'))
      return false
    } finally {
      dispatch(setLoading(false))
    }
    return true
  }

  const updatePassword = async (password: string) => {
    try {
      dispatch(setLoading(true))
      const { error } = await supabase.auth.updateUser({
        password,
      })
      if (error) throw error
    } catch (error) {
      console.error('Error updating password:', error)
      dispatch(setError('שגיאה בעדכון הסיסמה'))
      return false
    } finally {
      dispatch(setLoading(false))
    }
    return true
  }

  return {
    user,
    isLoading,
    error,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updatePassword,
  }
} 