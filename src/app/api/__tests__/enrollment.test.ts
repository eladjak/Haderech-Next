/**
 * @file enrollment.test.ts
 * @description Tests for course enrollment API endpoints
 */

import { createMocks } from 'node-mocks-http'
import { POST, DELETE } from '../courses/[courseId]/enroll/route'
import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

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

describe('Course Enrollment API', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('POST /api/courses/[courseId]/enroll', () => {
    it('should enroll user in course', async () => {
      const mockSession = {
        user: { id: 'test-user' },
      }

      mockSupabase.auth.getSession.mockResolvedValueOnce({ data: { session: mockSession } })

      const mockCourse = {
        id: '1',
        price: 100,
      }

      mockSupabase.from().select.mockResolvedValueOnce({ data: mockCourse, error: null })
      mockSupabase.from().select.mockResolvedValueOnce({ data: null, error: null })
      mockSupabase.from().insert.mockResolvedValueOnce({ data: { id: '1' }, error: null })
      mockSupabase.from().update.mockResolvedValueOnce({ error: null })
      mockSupabase.from().insert.mockResolvedValueOnce({ error: null })

      const request = new Request('http://localhost:3000/api/courses/1/enroll', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          payment_method_id: 'pm_123',
          coupon_code: 'DISCOUNT10',
        }),
      })

      const response = await POST(request, { params: { courseId: '1' } })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toEqual({
        message: 'נרשמת בהצלחה לקורס',
        enrollment: { id: '1' },
      })
    })

    it('should handle already enrolled user', async () => {
      const mockSession = {
        user: { id: 'test-user' },
      }

      mockSupabase.auth.getSession.mockResolvedValueOnce({ data: { session: mockSession } })

      const mockCourse = {
        id: '1',
        price: 100,
      }

      mockSupabase.from().select.mockResolvedValueOnce({ data: mockCourse, error: null })
      mockSupabase.from().select.mockResolvedValueOnce({ 
        data: { id: '1' }, 
        error: null 
      })

      const request = new Request('http://localhost:3000/api/courses/1/enroll', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          payment_method_id: 'pm_123',
        }),
      })

      const response = await POST(request, { params: { courseId: '1' } })
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data).toEqual({ error: 'כבר נרשמת לקורס זה' })
    })

    it('should handle course not found', async () => {
      const mockSession = {
        user: { id: 'test-user' },
      }

      mockSupabase.auth.getSession.mockResolvedValueOnce({ data: { session: mockSession } })
      mockSupabase.from().select.mockResolvedValueOnce({ data: null, error: null })

      const request = new Request('http://localhost:3000/api/courses/999/enroll', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          payment_method_id: 'pm_123',
        }),
      })

      const response = await POST(request, { params: { courseId: '999' } })
      const data = await response.json()

      expect(response.status).toBe(404)
      expect(data).toEqual({ error: 'קורס לא נמצא' })
    })

    it('should handle unauthenticated requests', async () => {
      mockSupabase.auth.getSession.mockResolvedValueOnce({ data: { session: null } })

      const request = new Request('http://localhost:3000/api/courses/1/enroll', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          payment_method_id: 'pm_123',
        }),
      })

      const response = await POST(request, { params: { courseId: '1' } })
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data).toEqual({ error: 'יש להתחבר כדי להירשם לקורס' })
    })
  })

  describe('DELETE /api/courses/[courseId]/enroll', () => {
    it('should unenroll user from course', async () => {
      const mockSession = {
        user: { id: 'test-user' },
      }

      mockSupabase.auth.getSession.mockResolvedValueOnce({ data: { session: mockSession } })
      mockSupabase.from().delete.mockResolvedValueOnce({ error: null })

      const request = new Request('http://localhost:3000/api/courses/1/enroll', {
        method: 'DELETE',
      })

      const response = await DELETE(request, { params: { courseId: '1' } })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toEqual({ message: 'ההרשמה בוטלה בהצלחה' })
    })

    it('should handle unauthenticated requests', async () => {
      mockSupabase.auth.getSession.mockResolvedValueOnce({ data: { session: null } })

      const request = new Request('http://localhost:3000/api/courses/1/enroll', {
        method: 'DELETE',
      })

      const response = await DELETE(request, { params: { courseId: '1' } })
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data).toEqual({ error: 'יש להתחבר כדי לבטל הרשמה' })
    })
  })
}) 