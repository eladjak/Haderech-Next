/**
 * @file course.test.ts
 * @description Tests for specific course API endpoints
 */

import { createMocks } from 'node-mocks-http'
import { GET, PUT, DELETE } from '../courses/[courseId]/route'
import { createServerClient } from '@supabase/ssr'

// Mock Supabase client
jest.mock('@supabase/ssr', () => ({
  createServerClient: jest.fn(),
}))

interface MockSupabaseClient {
  from: jest.Mock
  select: jest.Mock
  eq: jest.Mock
  single: jest.Mock
  update: jest.Mock
  delete: jest.Mock
  auth: {
    getSession: jest.Mock
  }
}

describe('Course API', () => {
  let mockSupabase: MockSupabaseClient

  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks()

    // Setup mock Supabase client
    mockSupabase = {
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      auth: {
        getSession: jest.fn(),
      },
    }

    ;(createServerClient as jest.Mock).mockReturnValue(mockSupabase)
  })

  describe('GET /api/courses/[courseId]', () => {
    it('should return course details', async () => {
      // Arrange
      const mockCourse = {
        id: '1',
        title: 'קורס לדוגמה',
        description: 'תיאור הקורס',
        instructor: {
          id: 'inst1',
          name: 'מדריך 1',
          avatar_url: 'https://example.com/avatar.jpg',
          bio: 'ביוגרפיה של המדריך',
        },
        lessons: [
          {
            id: 'lesson1',
            title: 'שיעור 1',
            progress: [
              { user_id: 'user1', completed: true },
            ],
          },
        ],
        ratings: [
          {
            id: 'rating1',
            rating: 5,
            user: {
              id: 'user1',
              name: 'משתמש 1',
              avatar_url: 'https://example.com/user1.jpg',
            },
          },
        ],
        comments: [
          {
            id: 'comment1',
            content: 'תגובה לדוגמה',
            user: {
              id: 'user1',
              name: 'משתמש 1',
              avatar_url: 'https://example.com/user1.jpg',
            },
            replies: [],
          },
        ],
      }

      mockSupabase.select.mockResolvedValueOnce({ data: mockCourse, error: null })

      const { req } = createMocks({
        method: 'GET',
      })

      // Act
      const response = await GET(req, { params: { courseId: '1' } })
      const data = await response.json()

      // Assert
      expect(response.status).toBe(200)
      expect(data).toEqual(mockCourse)
      expect(mockSupabase.from).toHaveBeenCalledWith('courses')
      expect(mockSupabase.select).toHaveBeenCalledWith(`
        *,
        instructor:profiles!instructor_id (
          id,
          name,
          avatar_url,
          bio
        ),
        lessons (
          *,
          progress:lesson_progress (*)
        ),
        ratings:course_ratings (
          *,
          user:profiles!user_id (
            id,
            name,
            avatar_url
          )
        ),
        comments:course_comments (
          *,
          user:profiles!user_id (
            id,
            name,
            avatar_url
          ),
          replies!parent_id (
            *,
            user:profiles!user_id (
              id,
              name,
              avatar_url
            )
          )
        )
      `)
      expect(mockSupabase.eq).toHaveBeenCalledWith('id', '1')
    })

    it('should handle course not found', async () => {
      // Arrange
      mockSupabase.select.mockResolvedValueOnce({ data: null, error: null })

      const { req } = createMocks({
        method: 'GET',
      })

      // Act
      const response = await GET(req, { params: { courseId: '999' } })
      const data = await response.json()

      // Assert
      expect(response.status).toBe(404)
      expect(data).toEqual({ error: 'Course not found' })
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
      expect(data).toEqual({ error: 'Failed to fetch course' })
    })
  })

  describe('PUT /api/courses/[courseId]', () => {
    it('should update course details for authorized instructor', async () => {
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

      const updates = {
        title: 'קורס מעודכן',
        description: 'תיאור מעודכן',
      }

      const { req } = createMocks({
        method: 'PUT',
        body: updates,
      })

      // Act
      const response = await PUT(req, { params: { courseId: '1' } })
      const data = await response.json()

      // Assert
      expect(response.status).toBe(200)
      expect(data).toEqual({ message: 'Course updated successfully' })
      expect(mockSupabase.update).toHaveBeenCalledWith({
        ...updates,
        updated_at: expect.any(String),
      })
    })

    it('should reject unauthorized update attempts', async () => {
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
        method: 'PUT',
        body: { title: 'ניסיון עדכון' },
      })

      // Act
      const response = await PUT(req, { params: { courseId: '1' } })
      const data = await response.json()

      // Assert
      expect(response.status).toBe(403)
      expect(data).toEqual({ error: 'Not authorized to update this course' })
    })

    it('should handle unauthenticated requests', async () => {
      // Arrange
      mockSupabase.auth.getSession.mockResolvedValueOnce({
        data: { session: null },
      })

      const { req } = createMocks({
        method: 'PUT',
        body: { title: 'ניסיון עדכון' },
      })

      // Act
      const response = await PUT(req, { params: { courseId: '1' } })
      const data = await response.json()

      // Assert
      expect(response.status).toBe(401)
      expect(data).toEqual({ error: 'Unauthorized' })
    })
  })

  describe('DELETE /api/courses/[courseId]', () => {
    it('should delete course for authorized instructor', async () => {
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
      mockSupabase.delete.mockResolvedValueOnce({ error: null })

      const { req } = createMocks({
        method: 'DELETE',
      })

      // Act
      const response = await DELETE(req, { params: { courseId: '1' } })
      const data = await response.json()

      // Assert
      expect(response.status).toBe(200)
      expect(data).toEqual({ message: 'Course deleted successfully' })
      expect(mockSupabase.delete).toHaveBeenCalled()
    })

    it('should reject unauthorized delete attempts', async () => {
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
        method: 'DELETE',
      })

      // Act
      const response = await DELETE(req, { params: { courseId: '1' } })
      const data = await response.json()

      // Assert
      expect(response.status).toBe(403)
      expect(data).toEqual({ error: 'Not authorized to delete this course' })
    })

    it('should handle unauthenticated requests', async () => {
      // Arrange
      mockSupabase.auth.getSession.mockResolvedValueOnce({
        data: { session: null },
      })

      const { req } = createMocks({
        method: 'DELETE',
      })

      // Act
      const response = await DELETE(req, { params: { courseId: '1' } })
      const data = await response.json()

      // Assert
      expect(response.status).toBe(401)
      expect(data).toEqual({ error: 'Unauthorized' })
    })
  })
}) 
