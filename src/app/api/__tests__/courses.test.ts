import { createMocks } from 'node-mocks-http'
import { GET, POST } from '../courses/route'
import { createServerClient } from '@supabase/ssr'

// Mock Supabase client
jest.mock('@supabase/ssr', () => ({
  createServerClient: jest.fn(),
}))

describe('Courses API', () => {
  let mockSupabase: any

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
      auth: {
        getSession: jest.fn(),
      },
    }

    ;(createServerClient as jest.Mock).mockReturnValue(mockSupabase)
  })

  describe('GET /api/courses', () => {
    it('should return courses list', async () => {
      // Arrange
      const mockCourses = [
        {
          id: '1',
          title: 'קורס לדוגמה 1',
          description: 'תיאור קורס 1',
          instructor: {
            id: 'inst1',
            name: 'מדריך 1',
          },
        },
        {
          id: '2',
          title: 'קורס לדוגמה 2',
          description: 'תיאור קורס 2',
          instructor: {
            id: 'inst2',
            name: 'מדריך 2',
          },
        },
      ]

      mockSupabase.select.mockResolvedValueOnce({ data: mockCourses, error: null })

      const { req, res } = createMocks({
        method: 'GET',
      })

      // Act
      const response = await GET(req)
      const data = await response.json()

      // Assert
      expect(response.status).toBe(200)
      expect(data).toEqual(mockCourses)
      expect(mockSupabase.from).toHaveBeenCalledWith('courses')
      expect(mockSupabase.select).toHaveBeenCalledWith(`
        *,
        instructor:profiles!instructor_id (
          id,
          name,
          avatar_url
        ),
        lessons (id)
      `)
      expect(mockSupabase.eq).toHaveBeenCalledWith('published', true)
      expect(mockSupabase.order).toHaveBeenCalledWith('created_at', { ascending: false })
    })

    it('should handle search query', async () => {
      // Arrange
      const searchQuery = 'מבוא'
      const { req } = createMocks({
        method: 'GET',
        url: `/api/courses?search=${searchQuery}`,
      })

      mockSupabase.select.mockResolvedValueOnce({ data: [], error: null })

      // Act
      await GET(req)

      // Assert
      expect(mockSupabase.or).toHaveBeenCalledWith(`
        title.ilike.%${searchQuery}%,
        description.ilike.%${searchQuery}%,
        category.ilike.%${searchQuery}%
      `)
    })

    it('should handle category filter', async () => {
      // Arrange
      const category = 'תכנות'
      const { req } = createMocks({
        method: 'GET',
        url: `/api/courses?category=${category}`,
      })

      mockSupabase.select.mockResolvedValueOnce({ data: [], error: null })

      // Act
      await GET(req)

      // Assert
      expect(mockSupabase.eq).toHaveBeenCalledWith('category', category)
    })

    it('should handle level filter', async () => {
      // Arrange
      const level = 'מתחילים'
      const { req } = createMocks({
        method: 'GET',
        url: `/api/courses?level=${level}`,
      })

      mockSupabase.select.mockResolvedValueOnce({ data: [], error: null })

      // Act
      await GET(req)

      // Assert
      expect(mockSupabase.eq).toHaveBeenCalledWith('level', level)
    })

    it('should handle instructor filter', async () => {
      // Arrange
      const instructorId = 'inst1'
      const { req } = createMocks({
        method: 'GET',
        url: `/api/courses?instructor=${instructorId}`,
      })

      mockSupabase.select.mockResolvedValueOnce({ data: [], error: null })

      // Act
      await GET(req)

      // Assert
      expect(mockSupabase.eq).toHaveBeenCalledWith('instructor_id', instructorId)
    })

    it('should handle database error', async () => {
      // Arrange
      const { req } = createMocks({ method: 'GET' })
      mockSupabase.select.mockResolvedValueOnce({
        data: null,
        error: new Error('Database error'),
      })

      // Act
      const response = await GET(req)
      const data = await response.json()

      // Assert
      expect(response.status).toBe(500)
      expect(data).toEqual({ error: 'Failed to fetch courses' })
    })
  })

  describe('POST /api/courses', () => {
    it('should create a new course for authenticated instructor', async () => {
      // Arrange
      const mockSession = {
        user: { id: 'user1' },
      }
      mockSupabase.auth.getSession.mockResolvedValueOnce({
        data: { session: mockSession },
      })

      const mockCourse = {
        title: 'קורס חדש',
        description: 'תיאור הקורס',
        category: 'תכנות',
        level: 'מתחילים',
      }

      const { req } = createMocks({
        method: 'POST',
        body: mockCourse,
      })

      mockSupabase.insert.mockResolvedValueOnce({
        data: { ...mockCourse, id: '1' },
        error: null,
      })

      // Act
      const response = await POST(req)
      const data = await response.json()

      // Assert
      expect(response.status).toBe(200)
      expect(data).toEqual({ ...mockCourse, id: '1' })
      expect(mockSupabase.from).toHaveBeenCalledWith('courses')
      expect(mockSupabase.insert).toHaveBeenCalledWith([
        {
          ...mockCourse,
          instructor_id: mockSession.user.id,
          created_at: expect.any(String),
          updated_at: expect.any(String),
        },
      ])
    })

    it('should reject unauthenticated requests', async () => {
      // Arrange
      mockSupabase.auth.getSession.mockResolvedValueOnce({
        data: { session: null },
      })

      const { req } = createMocks({
        method: 'POST',
        body: { title: 'קורס חדש' },
      })

      // Act
      const response = await POST(req)
      const data = await response.json()

      // Assert
      expect(response.status).toBe(401)
      expect(data).toEqual({ error: 'Unauthorized' })
    })

    it('should handle database error', async () => {
      // Arrange
      mockSupabase.auth.getSession.mockResolvedValueOnce({
        data: { session: { user: { id: 'user1' } } },
      })

      mockSupabase.insert.mockResolvedValueOnce({
        data: null,
        error: new Error('Database error'),
      })

      const { req } = createMocks({
        method: 'POST',
        body: { title: 'קורס חדש' },
      })

      // Act
      const response = await POST(req)
      const data = await response.json()

      // Assert
      expect(response.status).toBe(500)
      expect(data).toEqual({ error: 'Failed to create course' })
    })
  })
}) 