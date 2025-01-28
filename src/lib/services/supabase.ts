/**
 * Supabase Service
 * 
 * This module provides a centralized interface for interacting with our Supabase backend.
 * It includes type definitions, the main client instance, and helper functions for common operations.
 * 
 * @module services/supabase
 */

import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/supabase'
import { env } from '@/env.mjs'

// Initialize Supabase client with environment variables
export const supabase = createClient<Database>(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

// Type exports for database schema
export type Tables = Database['public']['Tables']
export type Enums = Database['public']['Enums']

// Helper types for common tables
export type CourseRow = Tables['courses']['Row']
export type ForumPostRow = Tables['forum_posts']['Row']
export type ProfileRow = Tables['profiles']['Row']
export type LessonRow = Tables['lessons']['Row']
export type CommentRow = Tables['comments']['Row']

/**
 * Fetches a user's profile by their ID
 * @param userId - The unique identifier of the user
 * @returns The user's profile data
 * @throws Will throw an error if the database query fails
 */
export async function getUserProfile(userId: string): Promise<ProfileRow> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  if (error) throw error
  return data
}

/**
 * Updates a user's profile with the provided changes
 * @param userId - The unique identifier of the user
 * @param updates - Partial profile data to update
 * @returns The updated profile data
 * @throws Will throw an error if the database query fails
 */
export async function updateUserProfile(
  userId: string, 
  updates: Partial<ProfileRow>
): Promise<ProfileRow> {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Fetches a course by its ID, including related data
 * @param courseId - The unique identifier of the course
 * @returns The course data with lessons and author information
 * @throws Will throw an error if the database query fails
 */
export async function getCourse(courseId: string) {
  const { data, error } = await supabase
    .from('courses')
    .select(`
      *,
      lessons (*),
      author:profiles (
        id,
        name, 
        avatar_url,
        bio,
        expertise
      )
    `)
    .eq('id', courseId)
    .single()

  if (error) throw error
  return data
}

/**
 * Interface for course filtering options
 */
export interface CourseFilters {
  published?: boolean
  authorId?: string
  level?: string
  category?: string
  searchQuery?: string
  sortBy?: 'newest' | 'popular' | 'rating'
}

/**
 * Fetches courses based on provided filters
 * @param filters - Optional filters to apply to the query
 * @returns An array of courses with related data
 * @throws Will throw an error if the database query fails
 */
export async function getCourses(filters?: CourseFilters) {
  let query = supabase.from('courses').select(`
    *,
    author:profiles (
      id,
      name, 
      avatar_url,
      expertise
    ),
    lessons (count),
    average_rating,
    total_students
  `)

  // Apply filters
  if (filters?.published !== undefined) {
    query = query.eq('published', filters.published)
  }

  if (filters?.authorId) {
    query = query.eq('author_id', filters.authorId)
  }

  if (filters?.level) {
    query = query.eq('level', filters.level)
  }

  if (filters?.category) {
    query = query.eq('category', filters.category)
  }

  if (filters?.searchQuery) {
    query = query.textSearch('title', filters.searchQuery)
  }

  // Apply sorting
  if (filters?.sortBy) {
    switch (filters.sortBy) {
      case 'newest':
        query = query.order('created_at', { ascending: false })
        break
      case 'popular':
        query = query.order('total_students', { ascending: false })
        break
      case 'rating':
        query = query.order('average_rating', { ascending: false })
        break
    }
  }

  const { data, error } = await query

  if (error) throw error
  return data
}

/**
 * Enrolls a user in a course
 * @param userId - The unique identifier of the user
 * @param courseId - The unique identifier of the course
 * @returns The enrollment data
 * @throws Will throw an error if the database query fails
 */
export async function enrollInCourse(userId: string, courseId: string) {
  const { data, error } = await supabase
    .from('enrollments')
    .insert({
      user_id: userId,
      course_id: courseId,
      enrolled_at: new Date().toISOString()
    })
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Updates a user's progress in a course lesson
 * @param userId - The unique identifier of the user
 * @param lessonId - The unique identifier of the lesson
 * @param progress - Progress data to update
 * @returns The updated progress data
 * @throws Will throw an error if the database query fails
 */
export async function updateLessonProgress(
  userId: string,
  lessonId: string,
  progress: {
    completed: boolean
    last_position?: number
    notes?: string
  }
) {
  const { data, error } = await supabase
    .from('lesson_progress')
    .upsert({
      user_id: userId,
      lesson_id: lessonId,
      ...progress,
      updated_at: new Date().toISOString()
    })
    .select()
    .single()

  if (error) throw error
  return data
} 