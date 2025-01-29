/**
 * @file lessons.test.ts
 * @description Tests for course lessons API endpoints
 */

import { GET, POST, PATCH } from '../courses/[courseId]/lessons/route'

// Mock Supabase client
const mockSupabase = {
  from: jest.fn(() => ({
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    neq: jest.fn().mockReturnThis(),
    gt: jest.fn().mockReturnThis(),
    gte: jest.fn().mockReturnThis(),
    lt: jest.fn().mockReturnThis(),
    lte: jest.fn().mockReturnThis(),
    like: jest.fn().mockReturnThis(),
    ilike: jest.fn().mockReturnThis(),
    is: jest.fn().mockReturnThis(),
    in: jest.fn().mockReturnThis(),
    contains: jest.fn().mockReturnThis(),
    containedBy: jest.fn().mockReturnThis(),
    range: jest.fn().mockReturnThis(),
    textSearch: jest.fn().mockReturnThis(),
    filter: jest.fn().mockReturnThis(),
    or: jest.fn().mockReturnThis(),
    and: jest.fn().mockReturnThis(),
    not: jest.fn().mockReturnThis(),
    match: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    offset: jest.fn().mockReturnThis(),
    single: jest.fn().mockReturnThis(),
    maybeSingle: jest.fn().mockReturnThis(),
    csv: jest.fn().mockReturnThis(),
  })),
  auth: {
    getSession: jest.fn(),
  },
  storage: {
    from: jest.fn(() => ({
      upload: jest.fn(),
      download: jest.fn(),
      remove: jest.fn(),
      createSignedUrl: jest.fn(),
      getPublicUrl: jest.fn(),
    })),
  },
  rpc: jest.fn(),
}

// Mock createServerClient
jest.mock('@supabase/ssr', () => ({
  createServerClient: jest.fn(() => mockSupabase),
}))

// Mock cookies
jest.mock('next/headers', () => ({
  cookies: jest.fn(() => ({
    get: jest.fn(() => ({ value: 'mock-cookie' })),
    getAll: jest.fn(() => []),
    set: jest.fn(),
    delete: jest.fn(),
  })),
}))

describe('Lessons API', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('GET /api/courses/[courseId]/lessons', () => {
    it('should return course lessons', async () => {
      const mockLessons = [
        {
          id: '1',
          title: 'Test Lesson',
          description: 'Test Description',
        },
      ]

      mockSupabase.from().select.mockResolvedValueOnce({ data: mockLessons, error: null })

      const request = new Request('http://localhost:3000/api/courses/1/lessons')
      const response = await GET(request, { params: { courseId: '1' } })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toEqual(mockLessons)
    })

    it('should handle database error', async () => {
      mockSupabase.from().select.mockResolvedValueOnce({ 
        data: null, 
        error: new Error('Database error') 
      })

      const request = new Request('http://localhost:3000/api/courses/1/lessons')
      const response = await GET(request, { params: { courseId: '1' } })
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data).toEqual({ error: 'Internal server error' })
    })
  })

  describe('POST /api/courses/[courseId]/lessons', () => {
    it('should create a new lesson for authorized instructor', async () => {
      const mockSession = {
        user: { id: 'test-user' },
      }

      mockSupabase.auth.getSession.mockResolvedValueOnce({ data: { session: mockSession } })

      const mockCourse = {
        id: '1',
        instructor_id: 'test-user',
      }

      mockSupabase.from().select.mockResolvedValueOnce({ data: mockCourse, error: null })

      const mockLesson = {
        id: '1',
        title: 'New Lesson',
        description: 'Lesson Description',
      }

      mockSupabase.from().insert.mockResolvedValueOnce({ data: mockLesson, error: null })

      const request = new Request('http://localhost:3000/api/courses/1/lessons', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(mockLesson),
      })

      const response = await POST(request, { params: { courseId: '1' } })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toEqual(mockLesson)
    })

    it('should reject unauthorized creation attempts', async () => {
      const mockSession = {
        user: { id: 'other-user' },
      }

      mockSupabase.auth.getSession.mockResolvedValueOnce({ data: { session: mockSession } })

      const mockCourse = {
        id: '1',
        instructor_id: 'test-user',
      }

      mockSupabase.from().select.mockResolvedValueOnce({ data: mockCourse, error: null })

      const request = new Request('http://localhost:3000/api/courses/1/lessons', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title: 'New Lesson' }),
      })

      const response = await POST(request, { params: { courseId: '1' } })
      const data = await response.json()

      expect(response.status).toBe(403)
      expect(data).toEqual({ error: 'Unauthorized' })
    })

    it('should handle unauthenticated requests', async () => {
      mockSupabase.auth.getSession.mockResolvedValueOnce({ data: { session: null } })

      const request = new Request('http://localhost:3000/api/courses/1/lessons', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title: 'New Lesson' }),
      })

      const response = await POST(request, { params: { courseId: '1' } })
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data).toEqual({ error: 'Authentication required' })
    })
  })

  describe('PATCH /api/courses/[courseId]/lessons', () => {
    it('should reorder lessons for authorized instructor', async () => {
      const mockSession = {
        user: { id: 'test-user' },
      }

      mockSupabase.auth.getSession.mockResolvedValueOnce({ data: { session: mockSession } })

      const mockCourse = {
        id: '1',
        instructor_id: 'test-user',
      }

      mockSupabase.from().select.mockResolvedValueOnce({ data: mockCourse, error: null })
      mockSupabase.from().update.mockResolvedValueOnce({ error: null })

      const request = new Request('http://localhost:3000/api/courses/1/lessons', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          lessonOrder: ['lesson1', 'lesson2', 'lesson3'],
        }),
      })

      const response = await PATCH(request, { params: { courseId: '1' } })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toEqual({ message: 'Lessons reordered successfully' })
    })

    it('should reject unauthorized reorder attempts', async () => {
      const mockSession = {
        user: { id: 'other-user' },
      }

      mockSupabase.auth.getSession.mockResolvedValueOnce({ data: { session: mockSession } })

      const mockCourse = {
        id: '1',
        instructor_id: 'test-user',
      }

      mockSupabase.from().select.mockResolvedValueOnce({ data: mockCourse, error: null })

      const request = new Request('http://localhost:3000/api/courses/1/lessons', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          lessonOrder: ['lesson1', 'lesson2', 'lesson3'],
        }),
      })

      const response = await PATCH(request, { params: { courseId: '1' } })
      const data = await response.json()

      expect(response.status).toBe(403)
      expect(data).toEqual({ error: 'Unauthorized' })
    })

    it('should handle unauthenticated requests', async () => {
      mockSupabase.auth.getSession.mockResolvedValueOnce({ data: { session: null } })

      const request = new Request('http://localhost:3000/api/courses/1/lessons', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          lessonOrder: ['lesson1', 'lesson2', 'lesson3'],
        }),
      })

      const response = await PATCH(request, { params: { courseId: '1' } })
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data).toEqual({ error: 'Authentication required' })
    })
  })
}) 