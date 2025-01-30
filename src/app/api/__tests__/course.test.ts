/**
 * @file course.test.ts
 * @description Tests for specific course API endpoints
 */

import { createMocks } from 'node-mocks-http'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import { GET, PUT, DELETE } from '../courses/[id]/route'

jest.mock('next/headers')
jest.mock('@supabase/ssr')

describe('Course API Routes', () => {
  let mockCookies: jest.Mock
  let mockCreateServerClient: jest.Mock
  let mockSupabase: any

  beforeEach(() => {
    mockCookies = cookies as jest.Mock
    mockCreateServerClient = createServerClient as jest.Mock
    mockSupabase = {
      auth: {
        getSession: jest.fn()
      },
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn(),
      delete: jest.fn(),
      update: jest.fn()
    }

    mockCookies.mockReturnValue({
      get: jest.fn().mockReturnValue({ value: 'mock-cookie' })
    })
    mockCreateServerClient.mockReturnValue(mockSupabase)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('GET /api/courses/[id]', () => {
    it('should return course details', async () => {
      const mockCourse = {
        id: '1',
        title: 'Test Course',
        description: 'Test Description'
      }

      mockSupabase.single.mockResolvedValue({ data: mockCourse })

      const { req } = createMocks({
        method: 'GET'
      })

      const response = await GET(req, { params: { id: '1' } })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toEqual(mockCourse)
    })

    it('should return 404 if course not found', async () => {
      mockSupabase.single.mockResolvedValue({ data: null })

      const { req } = createMocks({
        method: 'GET'
      })

      const response = await GET(req, { params: { id: '999' } })
      const data = await response.json()

      expect(response.status).toBe(404)
      expect(data).toEqual({ error: 'Course not found' })
    })

    it('should handle errors', async () => {
      mockSupabase.single.mockRejectedValue(new Error('Database error'))

      const { req } = createMocks({
        method: 'GET'
      })

      const response = await GET(req, { params: { id: '1' } })
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data).toEqual({ error: 'Internal server error' })
    })
  })

  describe('PUT /api/courses/[id]', () => {
    it('should update course if user is instructor', async () => {
      const mockSession = {
        user: { id: 'instructor-id' }
      }

      const mockCourse = {
        id: '1',
        instructor_id: 'instructor-id',
        title: 'Updated Course'
      }

      mockSupabase.auth.getSession.mockResolvedValue({ data: { session: mockSession } })
      mockSupabase.single.mockResolvedValueOnce({ data: { instructor_id: 'instructor-id' } })
      mockSupabase.update.mockResolvedValueOnce({ data: mockCourse })

      const { req } = createMocks({
        method: 'PUT',
        body: {
          title: 'Updated Course'
        }
      })

      const response = await PUT(req, { params: { id: '1' } })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toEqual(mockCourse)
    })

    it('should return 401 if user not authenticated', async () => {
      mockSupabase.auth.getSession.mockResolvedValue({ data: { session: null } })

      const { req } = createMocks({
        method: 'PUT',
        body: {
          title: 'Updated Course'
        }
      })

      const response = await PUT(req, { params: { id: '1' } })
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data).toEqual({ error: 'Unauthorized' })
    })

    it('should return 403 if user is not instructor', async () => {
      const mockSession = {
        user: { id: 'other-user' }
      }

      mockSupabase.auth.getSession.mockResolvedValue({ data: { session: mockSession } })
      mockSupabase.single.mockResolvedValue({ data: { instructor_id: 'instructor-id' } })

      const { req } = createMocks({
        method: 'PUT',
        body: {
          title: 'Updated Course'
        }
      })

      const response = await PUT(req, { params: { id: '1' } })
      const data = await response.json()

      expect(response.status).toBe(403)
      expect(data).toEqual({ error: 'Unauthorized' })
    })
  })

  describe('DELETE /api/courses/[id]', () => {
    it('should delete course if user is instructor', async () => {
      const mockSession = {
        user: { id: 'instructor-id' }
      }

      mockSupabase.auth.getSession.mockResolvedValue({ data: { session: mockSession } })
      mockSupabase.single.mockResolvedValueOnce({ data: { role: 'instructor' } })
      mockSupabase.single.mockResolvedValueOnce({ data: { instructor_id: 'instructor-id' } })
      mockSupabase.delete.mockResolvedValue({ data: null })

      const { req } = createMocks({
        method: 'DELETE'
      })

      const response = await DELETE(req, { params: { id: '1' } })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toEqual({ message: 'Course deleted successfully' })
    })

    it('should delete course if user is admin', async () => {
      const mockSession = {
        user: { id: 'admin-id' }
      }

      mockSupabase.auth.getSession.mockResolvedValue({ data: { session: mockSession } })
      mockSupabase.single.mockResolvedValueOnce({ data: { role: 'admin' } })
      mockSupabase.single.mockResolvedValueOnce({ data: { instructor_id: 'instructor-id' } })
      mockSupabase.delete.mockResolvedValue({ data: null })

      const { req } = createMocks({
        method: 'DELETE'
      })

      const response = await DELETE(req, { params: { id: '1' } })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toEqual({ message: 'Course deleted successfully' })
    })

    it('should return 403 if user is not instructor or admin', async () => {
      const mockSession = {
        user: { id: 'other-user' }
      }

      mockSupabase.auth.getSession.mockResolvedValue({ data: { session: mockSession } })
      mockSupabase.single.mockResolvedValueOnce({ data: { role: 'user' } })
      mockSupabase.single.mockResolvedValueOnce({ data: { instructor_id: 'instructor-id' } })

      const { req } = createMocks({
        method: 'DELETE'
      })

      const response = await DELETE(req, { params: { id: '1' } })
      const data = await response.json()

      expect(response.status).toBe(403)
      expect(data).toEqual({ error: 'Unauthorized' })
    })
  })
}) 
