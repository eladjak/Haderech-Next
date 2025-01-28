import { useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '@/store/store'
import { setUser, setLoading, setError } from '@/store/slices/userSlice'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import type { Database } from '@/types/supabase'
import type { Profile } from '@/lib/supabase'
import { useAuth } from './use-auth'
import { useToast } from './use-toast'
import { User } from '@/models/types'

export function useProfile() {
  const dispatch = useAppDispatch()
  const { user, isLoading, error } = useAppSelector((state) => state.user)
  const { user: authUser } = useAuth()
  const { error: showError } = useToast()
  const supabase = createClientComponentClient<Database>()

  useEffect(() => {
    async function fetchProfile() {
      try {
        dispatch(setLoading(true))
        
        const { data: { session }, error: authError } = await supabase.auth.getSession()
        if (authError) throw authError
        
        if (!session?.user) {
          dispatch(setUser(null))
          return
        }

        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()

        if (profileError) throw profileError

        if (!profile) {
          // Create new profile if it doesn't exist
          const newProfile = {
            id: session.user.id,
            email: session.user.email,
            name: session.user.user_metadata?.name || 'משתמש חדש',
            avatar_url: session.user.user_metadata?.avatar_url,
            points: 0,
            level: 'מתחיל',
            badges: [],
            completed_courses: [],
            forum_posts: 0,
            login_streak: 1,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }

          const { data: createdProfile, error: createError } = await supabase
            .from('profiles')
            .insert([newProfile])
            .select()
            .single()

          if (createError) throw createError
          dispatch(setUser(createdProfile as User))
        } else {
          dispatch(setUser(profile as User))
        }
      } catch (error) {
        console.error('Error fetching profile:', error)
        dispatch(setError('שגיאה בטעינת הפרופיל'))
      } finally {
        dispatch(setLoading(false))
      }
    }

    fetchProfile()
  }, [dispatch, supabase])

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) return

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id)

      if (error) throw error

      // עדכון המצב המקומי
      dispatch(setUser(prev => prev ? { ...prev, ...updates } : null))

      return { success: true }
    } catch (error) {
      console.error('Error updating profile:', error)
      throw error
    }
  }

  const uploadAvatar = async (file: File) => {
    if (!user) return

    try {
      const fileExt = file.name.split('.').pop()
      const filePath = `avatars/${user.id}/${Date.now()}.${fileExt}`

      // העלאת הקובץ ל-Storage
      const { error: uploadError } = await supabase
        .storage
        .from('uploads')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (uploadError) throw uploadError

      // קבלת URL ציבורי לקובץ
      const { data: { publicUrl } } = supabase
        .storage
        .from('uploads')
        .getPublicUrl(filePath)

      // עדכון ה-avatar_url בפרופיל
      await updateProfile({ avatar_url: publicUrl })

      return { publicUrl }
    } catch (error) {
      console.error('Error uploading avatar:', error)
      throw error
    }
  }

  const deleteAvatar = async () => {
    if (!user || !user.avatar_url) return

    try {
      const path = user.avatar_url.split('/').slice(-2).join('/')

      // מחיקת הקובץ מ-Storage
      const { error: deleteError } = await supabase
        .storage
        .from('uploads')
        .remove([`avatars/${path}`])

      if (deleteError) throw deleteError

      // עדכון הפרופיל
      await updateProfile({ avatar_url: undefined })

      return { success: true }
    } catch (error) {
      console.error('Error deleting avatar:', error)
      throw error
    }
  }

  return { user, isLoading, error, updateProfile, uploadAvatar, deleteAvatar }
} 