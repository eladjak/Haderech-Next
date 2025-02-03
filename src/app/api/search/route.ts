/**
 * @file route.ts
 * @description API route handler for global search operations
 */

import { createServerClient } from '@/lib/supabase-server'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { Database } from '@/types/supabase'

type Tables = Database['public']['Tables']
type Course = Tables['courses']['Row']
type User = Tables['users']['Row']

interface CourseSearchResult {
  id: string
  title: string
  description: string
  image_url: string | null
  author: {
    id: string
    name: string
    avatar_url: string | null
  }
}

interface InstructorSearchResult {
  id: string
  name: string
  bio: string | null
  avatar_url: string | null
}

interface SearchResults {
  courses: CourseSearchResult[]
  instructors: InstructorSearchResult[]
}

/**
 * GET /api/search
 * 
 * Searches for courses and instructors based on a query string.
 * 
 * @requires Authentication
 * 
 * @param {Request} request - The request object containing the search query
 * @returns {Promise<NextResponse>} JSON response containing the search results or error message
 * 
 * @example Request
 * ```
 * GET /api/search?q=javascript
 * ```
 * 
 * @example Response
 * ```json
 * {
 *   "courses": [
 *     {
 *       "id": "course1",
 *       "title": "JavaScript Basics",
 *       "description": "Learn JavaScript from scratch"
 *     }
 *   ],
 *   "instructors": [
 *     {
 *       "id": "user1",
 *       "name": "John Doe",
 *       "bio": "JavaScript expert"
 *     }
 *   ]
 * }
 * ```
 */
export async function GET(request: Request) {
  try {
    const cookieStore = cookies()
    const supabase = createServerClient(cookieStore)

    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')

    if (!query) {
      return NextResponse.json(
        { error: 'Search query is required' },
        { status: 400 }
      )
    }

    const { data: courses, error: coursesError } = await supabase
      .from('courses')
      .select(`
        id,
        title,
        description,
        image_url,
        author:users(
          id,
          name,
          avatar_url
        )
      `)
      .or(`title.ilike.%${query}%, description.ilike.%${query}%`)
      .eq('status', 'published')
      .order('created_at', { ascending: false })
      .limit(10)

    if (coursesError) {
      console.error('Error searching courses:', coursesError)
      return NextResponse.json(
        { error: 'Failed to search courses' },
        { status: 500 }
      )
    }

    const { data: instructors, error: instructorsError } = await supabase
      .from('users')
      .select('id, name, bio, avatar_url')
      .or(`name.ilike.%${query}%, bio.ilike.%${query}%`)
      .eq('role', 'admin')
      .order('name')
      .limit(10)

    if (instructorsError) {
      console.error('Error searching instructors:', instructorsError)
      return NextResponse.json(
        { error: 'Failed to search instructors' },
        { status: 500 }
      )
    }

    const results: SearchResults = {
      courses: courses as CourseSearchResult[] || [],
      instructors: instructors as InstructorSearchResult[] || []
    }

    return NextResponse.json(results)
  } catch (error) {
    console.error('Error in GET /api/search:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 