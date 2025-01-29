/**
 * @file course.test.ts
 * @description Tests for specific course API endpoints
 */

import { GET, PUT, DELETE } from '../courses/[courseId]/route'

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

describe('Course API', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('GET /api/courses/[courseId]', () => {
    it('should return course details', async () => {
      const mockCourse = {
        id: '1',
        title: 'Test Course',
        description: 'Test Description',
      }

      mockSupabase.from().select.mockResolvedValueOnce({ data: mockCourse, error: null })

      const request = new Request('http://localhost:3000/api/courses/1')
      const response = await GET(request, { params: { courseId: '1' } })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toEqual(mockCourse)
    })

    it('should handle course not found', async () => {
      mockSupabase.from().select.mockResolvedValueOnce({ data: null, error: null })

      const request = new Request('http://localhost:3000/api/courses/999')
      const response = await GET(request, { params: { courseId: '999' } })
      const data = await response.json()

      expect(response.status).toBe(404)
      expect(data).toEqual({ error: 'Course not found' })
    })

    it('should handle database error', async () => {
      mockSupabase.from().select.mockResolvedValueOnce({ 
        data: null, 
        error: new Error('Database error') 
      })

      const request = new Request('http://localhost:3000/api/courses/1')
      const response = await GET(request, { params: { courseId: '1' } })
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data).toEqual({ error: 'Internal server error' })
    })
  })

  describe('PUT /api/courses/[courseId]', () => {
    it('should update course details for authorized instructor', async () => {
      const mockSession = {
        user: { id: 'test-user' },
      }

      mockSupabase.auth.getSession.mockResolvedValueOnce({ data: { session: mockSession } })

      const mockCourse = {
        id: '1',
        instructor_id: 'test-user',
      }

      mockSupabase.from().select.mockResolvedValueOnce({ data: mockCourse, error: null })
      mockSupabase.from().update.mockResolvedValueOnce({ data: mockCourse, error: null })

      const request = new Request('http://localhost:3000/api/courses/1', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title: 'Updated Course' }),
      })

      const response = await PUT(request, { params: { courseId: '1' } })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toEqual({ message: 'Course updated successfully' })
    })

    it('should reject unauthorized update attempts', async () => {
      const mockSession = {
        user: { id: 'other-user' },
      }

      mockSupabase.auth.getSession.mockResolvedValueOnce({ data: { session: mockSession } })

      const mockCourse = {
        id: '1',
        instructor_id: 'test-user',
      }

      mockSupabase.from().select.mockResolvedValueOnce({ data: mockCourse, error: null })

      const request = new Request('http://localhost:3000/api/courses/1', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title: 'Updated Course' }),
      })

      const response = await PUT(request, { params: { courseId: '1' } })
      const data = await response.json()

      expect(response.status).toBe(403)
      expect(data).toEqual({ error: 'Unauthorized' })
    })

    it('should handle unauthenticated requests', async () => {
      mockSupabase.auth.getSession.mockResolvedValueOnce({ data: { session: null } })

      const request = new Request('http://localhost:3000/api/courses/1', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title: 'Updated Course' }),
      })

      const response = await PUT(request, { params: { courseId: '1' } })
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data).toEqual({ error: 'Authentication required' })
    })
  })

  describe('DELETE /api/courses/[courseId]', () => {
    it('should delete course for authorized instructor', async () => {
      const mockSession = {
        user: { id: 'test-user' },
      }

      mockSupabase.auth.getSession.mockResolvedValueOnce({ data: { session: mockSession } })

      const mockCourse = {
        id: '1',
        instructor_id: 'test-user',
      }

      mockSupabase.from().select.mockResolvedValueOnce({ data: mockCourse, error: null })
      mockSupabase.from().delete.mockResolvedValueOnce({ error: null })

      const request = new Request('http://localhost:3000/api/courses/1', {
        method: 'DELETE',
      })

      const response = await DELETE(request, { params: { courseId: '1' } })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toEqual({ message: 'Course deleted successfully' })
    })

    it('should reject unauthorized delete attempts', async () => {
      const mockSession = {
        user: { id: 'other-user' },
      }

      mockSupabase.auth.getSession.mockResolvedValueOnce({ data: { session: mockSession } })

      const mockCourse = {
        id: '1',
        instructor_id: 'test-user',
      }

      mockSupabase.from().select.mockResolvedValueOnce({ data: mockCourse, error: null })

      const request = new Request('http://localhost:3000/api/courses/1', {
        method: 'DELETE',
      })

      const response = await DELETE(request, { params: { courseId: '1' } })
      const data = await response.json()

      expect(response.status).toBe(403)
      expect(data).toEqual({ error: 'Unauthorized' })
    })

    it('should handle unauthenticated requests', async () => {
      mockSupabase.auth.getSession.mockResolvedValueOnce({ data: { session: null } })

      const request = new Request('http://localhost:3000/api/courses/1', {
        method: 'DELETE',
      })

      const response = await DELETE(request, { params: { courseId: '1' } })
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data).toEqual({ error: 'Authentication required' })
    })
  })
}) 
