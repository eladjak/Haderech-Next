/**
 * @file use-profile.ts
 * @description Custom hook for managing user profile data and operations
 */

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/api'
import type { Database } from '@/types/supabase'

type BaseProfile = Database['public']['Tables']['profiles']['Row']
interface Profile extends BaseProfile {
  avatar_url?: string | null
}

/**
 * Custom hook for managing user profile data and operations
 * 
 * @returns Object containing:
 * - profile: The current user's profile data
 * - loading: Boolean indicating if profile data is being loaded
 * - error: Any error that occurred during profile operations
 * - updateProfile: Function to update the user's profile
 * - uploadAvatar: Function to upload a new avatar image
 * - deleteAvatar: Function to delete the current avatar
 */
export function useProfile() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const router = useRouter()

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/login')
        return
      }

      const { data, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single()

      if (profileError) throw profileError

      setProfile(data)
    } catch (err) {
      console.error('Error fetching profile:', err)
      setError(err instanceof Error ? err : new Error('שגיאה בטעינת הפרופיל'))
    } finally {
      setLoading(false)
    }
  }

  const updateProfile = async (updates: Partial<Profile>) => {
    try {
      setLoading(true)
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        throw new Error('לא מחובר')
      }

      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', session.user.id)

      if (updateError) throw updateError

      await fetchProfile()
    } catch (err) {
      console.error('Error updating profile:', err)
      setError(err instanceof Error ? err : new Error('שגיאה בעדכון הפרופיל'))
      throw err
    } finally {
      setLoading(false)
    }
  }

  const uploadAvatar = async (file: File) => {
    try {
      setLoading(true)
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        throw new Error('לא מחובר')
      }

      const fileExt = file.name.split('.').pop()
      const filePath = `${session.user.id}/avatar.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true })

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath)

      await updateProfile({ avatar_url: publicUrl })
    } catch (err) {
      console.error('Error uploading avatar:', err)
      setError(err instanceof Error ? err : new Error('שגיאה בהעלאת התמונה'))
      throw err
    } finally {
      setLoading(false)
    }
  }

  const deleteAvatar = async () => {
    try {
      setLoading(true)
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        throw new Error('לא מחובר')
      }

      const { error: deleteError } = await supabase.storage
        .from('avatars')
        .remove([`${session.user.id}/avatar`])

      if (deleteError) throw deleteError

      await updateProfile({ avatar_url: null })
    } catch (err) {
      console.error('Error deleting avatar:', err)
      setError(err instanceof Error ? err : new Error('שגיאה במחיקת התמונה'))
      throw err
    } finally {
      setLoading(false)
    }
  }

  return { profile, loading, error, updateProfile, uploadAvatar, deleteAvatar }
} 