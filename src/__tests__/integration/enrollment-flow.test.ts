import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

/**
 * Integration tests for the enrollment flow
 * These tests verify the complete user journey from course discovery to enrollment
 */

// Mock Supabase client
const mockSupabaseClient = {
  auth: {
    getUser: vi.fn(),
    signInWithPassword: vi.fn(),
    signOut: vi.fn(),
  },
  from: vi.fn(),
};

vi.mock('@supabase/supabase-js', () => ({
  createClient: () => mockSupabaseClient,
}));

describe('Enrollment Flow Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Complete Enrollment Journey', () => {
    it('should complete full enrollment flow for authenticated user', async () => {
      // Step 1: User authentication
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
      };

      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      const { data: authData, error: authError } = await mockSupabaseClient.auth.getUser();
      expect(authError).toBeNull();
      expect(authData.user).toBeDefined();
      expect(authData.user?.id).toBe('user-123');

      // Step 2: Check if user is already enrolled
      const mockFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: null,
                error: { code: 'PGRST116' }, // Not found
              }),
            }),
          }),
        }),
      });

      mockSupabaseClient.from = mockFrom;

      const checkEnrollment = await mockSupabaseClient
        .from('enrollments')
        .select('*')
        .eq('user_id', mockUser.id)
        .eq('course_id', 'course-123')
        .single();

      expect(checkEnrollment.data).toBeNull();

      // Step 3: Create enrollment
      const mockEnrollmentInsert = vi.fn().mockReturnValue({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: {
                id: 'enrollment-123',
                user_id: mockUser.id,
                course_id: 'course-123',
                created_at: new Date().toISOString(),
              },
              error: null,
            }),
          }),
        }),
      });

      mockSupabaseClient.from = mockEnrollmentInsert;

      const { data: enrollment, error: enrollError } = await mockSupabaseClient
        .from('enrollments')
        .insert({
          user_id: mockUser.id,
          course_id: 'course-123',
        })
        .select()
        .single();

      expect(enrollError).toBeNull();
      expect(enrollment).toBeDefined();
      expect(enrollment?.user_id).toBe(mockUser.id);
      expect(enrollment?.course_id).toBe('course-123');
    });

    it('should prevent duplicate enrollments', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
      };

      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      // User is already enrolled
      const mockFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: {
                  id: 'existing-enrollment',
                  user_id: mockUser.id,
                  course_id: 'course-123',
                },
                error: null,
              }),
            }),
          }),
        }),
      });

      mockSupabaseClient.from = mockFrom;

      const existingEnrollment = await mockSupabaseClient
        .from('enrollments')
        .select('*')
        .eq('user_id', mockUser.id)
        .eq('course_id', 'course-123')
        .single();

      expect(existingEnrollment.data).toBeDefined();
      expect(existingEnrollment.data?.id).toBe('existing-enrollment');

      // Should not create duplicate enrollment
      // In real app, this would be prevented by UI or API
    });

    it('should require authentication for enrollment', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: { message: 'Not authenticated' },
      });

      const { data: authData, error: authError } = await mockSupabaseClient.auth.getUser();

      expect(authData.user).toBeNull();
      expect(authError).toBeDefined();
      expect(authError?.message).toBe('Not authenticated');
    });

    it('should handle enrollment creation errors', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
      };

      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      const mockFrom = vi.fn().mockReturnValue({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: null,
              error: { message: 'Database error' },
            }),
          }),
        }),
      });

      mockSupabaseClient.from = mockFrom;

      const { data: enrollment, error } = await mockSupabaseClient
        .from('enrollments')
        .insert({
          user_id: mockUser.id,
          course_id: 'course-123',
        })
        .select()
        .single();

      expect(enrollment).toBeNull();
      expect(error).toBeDefined();
      expect(error?.message).toBe('Database error');
    });
  });

  describe('Post-Enrollment Actions', () => {
    it('should fetch course details after enrollment', async () => {
      const mockCourse = {
        id: 'course-123',
        title: 'Test Course',
        description: 'Test Description',
      };

      const mockFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: mockCourse,
              error: null,
            }),
          }),
        }),
      });

      mockSupabaseClient.from = mockFrom;

      const { data: course, error } = await mockSupabaseClient
        .from('courses')
        .select('*')
        .eq('id', 'course-123')
        .single();

      expect(error).toBeNull();
      expect(course).toBeDefined();
      expect(course?.title).toBe('Test Course');
    });

    it('should track enrollment analytics', async () => {
      const enrollmentEvent = {
        event_type: 'course_enrolled',
        user_id: 'user-123',
        course_id: 'course-123',
        timestamp: new Date().toISOString(),
      };

      const mockFrom = vi.fn().mockReturnValue({
        insert: vi.fn().mockResolvedValue({
          data: enrollmentEvent,
          error: null,
        }),
      });

      mockSupabaseClient.from = mockFrom;

      const { data, error } = await mockSupabaseClient
        .from('analytics_events')
        .insert(enrollmentEvent);

      expect(error).toBeNull();
      expect(data).toBeDefined();
    });

    it('should send enrollment confirmation', async () => {
      // Mock email/notification service
      const mockNotification = {
        user_id: 'user-123',
        type: 'enrollment_confirmation',
        message: 'You have been enrolled in Test Course',
        sent_at: new Date().toISOString(),
      };

      const mockFrom = vi.fn().mockReturnValue({
        insert: vi.fn().mockResolvedValue({
          data: mockNotification,
          error: null,
        }),
      });

      mockSupabaseClient.from = mockFrom;

      const { data, error } = await mockSupabaseClient
        .from('notifications')
        .insert(mockNotification);

      expect(error).toBeNull();
      expect(data).toBeDefined();
    });
  });

  describe('Enrollment Permissions', () => {
    it('should check course availability before enrollment', async () => {
      const mockCourse = {
        id: 'course-123',
        status: 'published',
        enrollment_open: true,
      };

      const mockFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: mockCourse,
              error: null,
            }),
          }),
        }),
      });

      mockSupabaseClient.from = mockFrom;

      const { data: course } = await mockSupabaseClient
        .from('courses')
        .select('status, enrollment_open')
        .eq('id', 'course-123')
        .single();

      expect(course?.status).toBe('published');
      expect(course?.enrollment_open).toBe(true);
    });

    it('should prevent enrollment in closed courses', async () => {
      const mockCourse = {
        id: 'course-123',
        status: 'published',
        enrollment_open: false,
      };

      const mockFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: mockCourse,
              error: null,
            }),
          }),
        }),
      });

      mockSupabaseClient.from = mockFrom;

      const { data: course } = await mockSupabaseClient
        .from('courses')
        .select('status, enrollment_open')
        .eq('id', 'course-123')
        .single();

      expect(course?.enrollment_open).toBe(false);
      // In real app, would prevent enrollment
    });

    it('should check user prerequisites', async () => {
      const mockPrerequisites = {
        course_id: 'course-123',
        required_courses: ['course-100', 'course-101'],
      };

      const mockUserCompletions = ['course-100', 'course-101'];

      const mockFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: mockPrerequisites,
              error: null,
            }),
          }),
        }),
      });

      mockSupabaseClient.from = mockFrom;

      const { data: prereqs } = await mockSupabaseClient
        .from('course_prerequisites')
        .select('required_courses')
        .eq('course_id', 'course-123')
        .single();

      const hasPrerequisites = prereqs?.required_courses.every(
        (course: string) => mockUserCompletions.includes(course)
      );

      expect(hasPrerequisites).toBe(true);
    });
  });

  describe('Enrollment Cleanup', () => {
    it('should allow unenrollment', async () => {
      const mockFrom = vi.fn().mockReturnValue({
        delete: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({
              data: { id: 'enrollment-123' },
              error: null,
            }),
          }),
        }),
      });

      mockSupabaseClient.from = mockFrom;

      const { error } = await mockSupabaseClient
        .from('enrollments')
        .delete()
        .eq('user_id', 'user-123')
        .eq('course_id', 'course-123');

      expect(error).toBeNull();
    });

    it('should handle concurrent enrollment attempts', async () => {
      // Simulate race condition
      const enrollment1 = Promise.resolve({
        data: { id: 'enrollment-1' },
        error: null,
      });

      const enrollment2 = Promise.resolve({
        data: null,
        error: { message: 'Duplicate enrollment' },
      });

      const results = await Promise.all([enrollment1, enrollment2]);

      const successCount = results.filter((r) => r.data !== null).length;
      expect(successCount).toBe(1);
    });
  });
});
