import { createContext, useContext, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'
import type { Tables } from '@/lib/supabase'

interface AuthContextType {
  user: User | null
  profile: Tables<'profiles'> | null
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, username: string, fullName: string) => Promise<void>
  signOut: () => Promise<void>
  loading: boolean
  error: string | null
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Tables<'profiles'> | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    // Check active sessions and sets the user
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Listen for changes on auth state (logged in, signed out, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  // Fetch user profile when user changes
  useEffect(() => {
    if (user) {
      fetchProfile()
    } else {
      setProfile(null)
    }
  }, [user])

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single()

      if (error) throw error
      setProfile(data)
    } catch (error) {
      console.error('Error fetching profile:', error)
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      setError(null)
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
      router.push('/dashboard')
    } catch (error) {
      setError((error as Error).message)
    }
  }

  const signUp = async (email: string, password: string, username: string, fullName: string) => {
    try {
      setError(null)
      const { data: { user }, error: signUpError } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          data: {
            username,
            full_name: fullName
          }
        }
      })
      if (signUpError) throw signUpError

      if (user) {
        // Create profile
        const { error: profileError } = await supabase.from('profiles').insert({
          id: user.id,
          username,
          full_name: fullName,
          email,
          role: 'user'
        })
        if (profileError) throw profileError
      }

      router.push('/dashboard')
    } catch (error) {
      setError((error as Error).message)
    }
  }

  const signOut = async () => {
    try {
      setError(null)
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      router.push('/')
    } catch (error) {
      setError((error as Error).message)
    }
  }

  const value = {
    user,
    profile,
    signIn,
    signUp,
    signOut,
    loading,
    error
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
} 