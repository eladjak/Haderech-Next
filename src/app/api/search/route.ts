/**
 * @file route.ts
 * @description API route handler for global search operations
 */

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

interface CourseSearchResult {
  id: string
  title: string
  description: string
  image_url: string | null
  instructor: {
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
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')
    const type = searchParams.get('type') || 'all'
    const limit = parseInt(searchParams.get('limit') || '10')
    const offset = parseInt(searchParams.get('offset') || '0')

    if (!query) {
      return NextResponse.json(
        { error: 'Search query is required' },
        { status: 400 }
      )
    }

    const cookieStore = cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          }
        }
      }
    )

    const results: SearchResults = {
      courses: [],
      instructors: []
    }

    if (type === 'all' || type === 'courses') {
      const { data: courses, error: coursesError } = await supabase
        .from('courses')
        .select(`
          id,
          title,
          description,
          image_url,
          instructor:users!instructor_id (
            id,
            name,
            avatar_url
          )
        `)
        .textSearch('title', query)
        .range(offset, offset + limit - 1)

      if (coursesError) {
        console.error('Error searching courses:', coursesError)
        return NextResponse.json(
          { error: 'Failed to search courses' },
          { status: 500 }
        )
      }

      results.courses = courses.map(course => ({
        id: course.id,
        title: course.title,
        description: course.description,
        image_url: course.image_url,
        instructor: course.instructor[0]
      }))
    }

    if (type === 'all' || type === 'instructors') {
      const { data: instructors, error: instructorsError } = await supabase
        .from('users')
        .select('id, name, bio, avatar_url')
        .eq('role', 'instructor')
        .textSearch('name', query)
        .range(offset, offset + limit - 1)

      if (instructorsError) {
        console.error('Error searching instructors:', instructorsError)
        return NextResponse.json(
          { error: 'Failed to search instructors' },
          { status: 500 }
        )
      }

      results.instructors = instructors as InstructorSearchResult[]
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