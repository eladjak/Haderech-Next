/**
 * @file lessons.test.ts
 * @description Tests for course lessons API endpoints
 */

import { createMocks } from 'node-mocks-http'
import { GET, POST, PATCH } from '../courses/[courseId]/lessons/route'
import { createServerClient } from '@supabase/ssr'

// Mock Supabase client
jest.mock('@supabase/ssr', () => ({
  createServerClient: jest.fn(),
}))

interface MockSupabaseClient {
  from: jest.Mock
  select: jest.Mock
  eq: jest.Mock
  order: jest.Mock
  single: jest.Mock
  insert: jest.Mock
  update: jest.Mock
  limit: jest.Mock
  auth: {
    getSession: jest.Mock
  }
}

describe('Lessons API', () => {
  let mockSupabase: MockSupabaseClient

  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks()

    // Setup mock Supabase client
    mockSupabase = {
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      single: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      auth: {
        getSession: jest.fn(),
      },
    }

    ;(createServerClient as jest.Mock).mockReturnValue(mockSupabase)
  })

  describe('GET /api/courses/[courseId]/lessons', () => {
    it('should return course lessons', async () => {
      // Arrange
      const mockLessons = [
        {
          id: '1',
          title: 'שיעור 1',
          description: 'תיאור שיעור 1',
          order: 1,
          progress: [
            { user_id: 'user1', completed: true },
          ],
        },
        {
          id: '2',
          title: 'שיעור 2',
          description: 'תיאור שיעור 2',
          order: 2,
          progress: [],
        },
      ]

      mockSupabase.select.mockResolvedValueOnce({ data: mockLessons, error: null })

      const { req } = createMocks({
        method: 'GET',
      })

      // Act
      const response = await GET(req, { params: { courseId: '1' } })
      const data = await response.json()

      // Assert
      expect(response.status).toBe(200)
      expect(data).toEqual(mockLessons)
      expect(mockSupabase.from).toHaveBeenCalledWith('lessons')
      expect(mockSupabase.select).toHaveBeenCalledWith(`
        *,
        progress:lesson_progress (*)
      `)
      expect(mockSupabase.eq).toHaveBeenCalledWith('course_id', '1')
      expect(mockSupabase.order).toHaveBeenCalledWith('order', { ascending: true })
    })

    it('should handle database error', async () => {
      // Arrange
      mockSupabase.select.mockResolvedValueOnce({
        data: null,
        error: new Error('Database error'),
      })

      const { req } = createMocks({
        method: 'GET',
      })

      // Act
      const response = await GET(req, { params: { courseId: '1' } })
      const data = await response.json()

      // Assert
      expect(response.status).toBe(500)
      expect(data).toEqual({ error: 'Failed to fetch lessons' })
    })
  })

  describe('POST /api/courses/[courseId]/lessons', () => {
    it('should create a new lesson for authorized instructor', async () => {
      // Arrange
      const mockSession = {
        user: { id: 'inst1' },
      }
      mockSupabase.auth.getSession.mockResolvedValueOnce({
        data: { session: mockSession },
      })

      const mockCourse = {
        id: '1',
        instructor_id: 'inst1',
      }

      mockSupabase.select.mockResolvedValueOnce({ data: mockCourse, error: null })
      mockSupabase.select.mockResolvedValueOnce({ data: { order: 2 }, error: null })
      mockSupabase.insert.mockResolvedValueOnce({
        data: { id: '3', title: 'שיעור חדש' },
        error: null,
      })

      const lessonData = {
        title: 'שיעור חדש',
        description: 'תיאור השיעור החדש',
      }

      const { req } = createMocks({
        method: 'POST',
        body: lessonData,
      })

      // Act
      const response = await POST(req, { params: { courseId: '1' } })
      const data = await response.json()

      // Assert
      expect(response.status).toBe(200)
      expect(data).toEqual({ id: '3', title: 'שיעור חדש' })
      expect(mockSupabase.insert).toHaveBeenCalledWith([
        {
          ...lessonData,
          course_id: '1',
          order: 3,
          created_at: expect.any(String),
          updated_at: expect.any(String),
        },
      ])
    })

    it('should reject unauthorized creation attempts', async () => {
      // Arrange
      const mockSession = {
        user: { id: 'user1' },
      }
      mockSupabase.auth.getSession.mockResolvedValueOnce({
        data: { session: mockSession },
      })

      const mockCourse = {
        id: '1',
        instructor_id: 'inst1',
      }

      mockSupabase.select.mockResolvedValueOnce({ data: mockCourse, error: null })

      const { req } = createMocks({
        method: 'POST',
        body: { title: 'שיעור חדש' },
      })

      // Act
      const response = await POST(req, { params: { courseId: '1' } })
      const data = await response.json()

      // Assert
      expect(response.status).toBe(403)
      expect(data).toEqual({ error: 'Not authorized to add lessons to this course' })
    })

    it('should handle unauthenticated requests', async () => {
      // Arrange
      mockSupabase.auth.getSession.mockResolvedValueOnce({
        data: { session: null },
      })

      const { req } = createMocks({
        method: 'POST',
        body: { title: 'שיעור חדש' },
      })

      // Act
      const response = await POST(req, { params: { courseId: '1' } })
      const data = await response.json()

      // Assert
      expect(response.status).toBe(401)
      expect(data).toEqual({ error: 'Unauthorized' })
    })
  })

  describe('PATCH /api/courses/[courseId]/lessons', () => {
    it('should reorder lessons for authorized instructor', async () => {
      // Arrange
      const mockSession = {
        user: { id: 'inst1' },
      }
      mockSupabase.auth.getSession.mockResolvedValueOnce({
        data: { session: mockSession },
      })

      const mockCourse = {
        id: '1',
        instructor_id: 'inst1',
      }

      mockSupabase.select.mockResolvedValueOnce({ data: mockCourse, error: null })
      mockSupabase.update.mockResolvedValueOnce({ error: null })

      const lessons = [
        { id: '1', order: 2 },
        { id: '2', order: 1 },
      ]

      const { req } = createMocks({
        method: 'PATCH',
        body: { lessons },
      })

      // Act
      const response = await PATCH(req, { params: { courseId: '1' } })
      const data = await response.json()

      // Assert
      expect(response.status).toBe(200)
      expect(data).toEqual({ message: 'Lessons reordered successfully' })
      expect(mockSupabase.update).toHaveBeenCalledTimes(2)
    })

    it('should reject unauthorized reorder attempts', async () => {
      // Arrange
      const mockSession = {
        user: { id: 'user1' },
      }
      mockSupabase.auth.getSession.mockResolvedValueOnce({
        data: { session: mockSession },
      })

      const mockCourse = {
        id: '1',
        instructor_id: 'inst1',
      }

      mockSupabase.select.mockResolvedValueOnce({ data: mockCourse, error: null })

      const { req } = createMocks({
        method: 'PATCH',
        body: { lessons: [] },
      })

      // Act
      const response = await PATCH(req, { params: { courseId: '1' } })
      const data = await response.json()

      // Assert
      expect(response.status).toBe(403)
      expect(data).toEqual({ error: 'Not authorized to reorder lessons in this course' })
    })

    it('should handle unauthenticated requests', async () => {
      // Arrange
      mockSupabase.auth.getSession.mockResolvedValueOnce({
        data: { session: null },
      })

      const { req } = createMocks({
        method: 'PATCH',
        body: { lessons: [] },
      })

      // Act
      const response = await PATCH(req, { params: { courseId: '1' } })
      const data = await response.json()

      // Assert
      expect(response.status).toBe(401)
      expect(data).toEqual({ error: 'Unauthorized' })
    })
  })
}) 