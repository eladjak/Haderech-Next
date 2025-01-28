import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/supabase'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)

export type Tables = Database['public']['Tables']
export type Enums = Database['public']['Enums']

// Helper types
export type CourseRow = Tables['courses']['Row']
export type ForumPostRow = Tables['forum_posts']['Row']
export type ProfileRow = Tables['profiles']['Row']

// Helper functions
export async function getUserProfile(userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  if (error) throw error
  return data
}

export async function updateUserProfile(userId: string, updates: Partial<ProfileRow>) {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function getCourse(courseId: string) {
  const { data, error } = await supabase
    .from('courses')
    .select(`
      *,
      lessons (*),
      author:profiles (name, avatar_url)
    `)
    .eq('id', courseId)
    .single()

  if (error) throw error
  return data
}

export async function getCourses(filters?: {
  published?: boolean
  authorId?: string
  level?: string
}) {
  let query = supabase.from('courses').select(`
    *,
    author:profiles (name, avatar_url),
    lessons (count)
  `)

  if (filters?.published !== undefined) {
    query = query.eq('published', filters.published)
  }

  if (filters?.authorId) {
    query = query.eq('author_id', filters.authorId)
  }

  if (filters?.level) {
    query = query.eq('level', filters.level)
  }

  const { data, error } = await query

  if (error) throw error
  return data
} 