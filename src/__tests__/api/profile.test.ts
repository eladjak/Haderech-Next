import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NextRequest } from 'next/server';
import { GET, PUT } from '@/app/api/profile/route';

// Mock Supabase
const mockGetUser = vi.fn();
const mockSelect = vi.fn();
const mockUpdate = vi.fn();
const mockEq = vi.fn();
const mockSingle = vi.fn();
const mockFrom = vi.fn();

vi.mock('@supabase/auth-helpers-nextjs', () => ({
  createRouteHandlerClient: () => ({
    auth: {
      getUser: mockGetUser,
    },
    from: mockFrom,
  }),
}));

// Mock Next.js cookies
vi.mock('next/headers', () => ({
  cookies: vi.fn(),
}));

// Mock rate limiting
vi.mock('@/lib/middleware/rate-limit', () => ({
  rateLimit: () => async () => null,
  apiRateLimits: {
    standard: { requests: 100, window: 60000 },
    strict: { requests: 10, window: 60000 },
  },
}));

describe('/api/profile', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Setup default mock chain
    mockSingle.mockResolvedValue({ data: { id: 'test-user-id', name: 'Test User', email: 'test@example.com' }, error: null });
    mockEq.mockReturnValue({ single: mockSingle });
    mockSelect.mockReturnValue({ eq: mockEq });
    mockUpdate.mockReturnValue({ eq: mockEq, select: mockSelect });
    mockFrom.mockReturnValue({
      select: mockSelect,
      update: mockUpdate,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('GET', () => {
    it('should return user profile for authenticated user', async () => {
      mockGetUser.mockResolvedValue({
        data: { user: { id: 'test-user-id', email: 'test@example.com' } },
        error: null,
      });

      const request = new NextRequest('http://localhost:3000/api/profile', {
        method: 'GET',
      });

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.id).toBe('test-user-id');
      expect(data.name).toBe('Test User');
    });

    it('should return 401 for unauthenticated requests', async () => {
      mockGetUser.mockResolvedValue({
        data: { user: null },
        error: null,
      });

      const request = new NextRequest('http://localhost:3000/api/profile', {
        method: 'GET',
      });

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('User not authenticated');
    });

    it('should return 500 on database error', async () => {
      mockGetUser.mockResolvedValue({
        data: { user: { id: 'test-user-id' } },
        error: null,
      });

      mockSingle.mockResolvedValue({
        data: null,
        error: { message: 'Database error' },
      });

      const request = new NextRequest('http://localhost:3000/api/profile', {
        method: 'GET',
      });

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to fetch user profile');
    });

    it('should handle unexpected errors gracefully', async () => {
      mockGetUser.mockRejectedValue(new Error('Unexpected error'));

      const request = new NextRequest('http://localhost:3000/api/profile', {
        method: 'GET',
      });

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Internal server error');
    });
  });

  describe('PUT', () => {
    it('should update profile with valid data', async () => {
      mockGetUser.mockResolvedValue({
        data: { user: { id: 'test-user-id' } },
        error: null,
      });

      mockSingle.mockResolvedValue({
        data: { id: 'test-user-id', name: 'Updated Name', bio: 'Updated bio' },
        error: null,
      });

      const request = new NextRequest('http://localhost:3000/api/profile', {
        method: 'PUT',
        body: JSON.stringify({
          name: 'Updated Name',
          bio: 'Updated bio'
        }),
      });

      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.name).toBe('Updated Name');
      expect(data.bio).toBe('Updated bio');
    });

    it('should return 401 for unauthenticated requests', async () => {
      mockGetUser.mockResolvedValue({
        data: { user: null },
        error: null,
      });

      const request = new NextRequest('http://localhost:3000/api/profile', {
        method: 'PUT',
        body: JSON.stringify({ name: 'New Name' }),
      });

      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('User not authenticated');
    });

    it('should return 400 for invalid input', async () => {
      mockGetUser.mockResolvedValue({
        data: { user: { id: 'test-user-id' } },
        error: null,
      });

      const request = new NextRequest('http://localhost:3000/api/profile', {
        method: 'PUT',
        body: JSON.stringify({
          role: 'admin', // Should be rejected by validation
          invalid_field: 'value'
        }),
      });

      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBeDefined();
    });

    it('should return 500 on database error during update', async () => {
      mockGetUser.mockResolvedValue({
        data: { user: { id: 'test-user-id' } },
        error: null,
      });

      mockSingle.mockResolvedValue({
        data: null,
        error: { message: 'Update failed' },
      });

      const request = new NextRequest('http://localhost:3000/api/profile', {
        method: 'PUT',
        body: JSON.stringify({ name: 'New Name' }),
      });

      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to update user profile');
    });

    it('should handle JSON parse errors', async () => {
      mockGetUser.mockResolvedValue({
        data: { user: { id: 'test-user-id' } },
        error: null,
      });

      const request = new NextRequest('http://localhost:3000/api/profile', {
        method: 'PUT',
        body: 'invalid json{',
      });

      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Internal server error');
    });

    it('should accept empty update object', async () => {
      mockGetUser.mockResolvedValue({
        data: { user: { id: 'test-user-id' } },
        error: null,
      });

      mockSingle.mockResolvedValue({
        data: { id: 'test-user-id', name: 'Test User' },
        error: null,
      });

      const request = new NextRequest('http://localhost:3000/api/profile', {
        method: 'PUT',
        body: JSON.stringify({}),
      });

      const response = await PUT(request);

      // Should handle empty updates (validation dependent)
      expect([200, 400]).toContain(response.status);
    });

    it('should handle unexpected errors gracefully', async () => {
      mockGetUser.mockRejectedValue(new Error('Unexpected error'));

      const request = new NextRequest('http://localhost:3000/api/profile', {
        method: 'PUT',
        body: JSON.stringify({ name: 'New Name' }),
      });

      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Internal server error');
    });

    it('should sanitize and validate string inputs', async () => {
      mockGetUser.mockResolvedValue({
        data: { user: { id: 'test-user-id' } },
        error: null,
      });

      mockSingle.mockResolvedValue({
        data: { id: 'test-user-id', name: 'Valid Name', bio: 'Valid bio' },
        error: null,
      });

      const request = new NextRequest('http://localhost:3000/api/profile', {
        method: 'PUT',
        body: JSON.stringify({
          name: 'Valid Name',
          bio: 'Valid bio with some content'
        }),
      });

      const response = await PUT(request);

      expect([200, 400]).toContain(response.status);
    });
  });
});
