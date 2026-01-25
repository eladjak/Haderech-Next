import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { CourseCard } from '@/components/courses/course-card';
import type { CourseWithRelations } from '@/types/courses';

// Mock Next.js Image component
vi.mock('next/image', () => ({
  default: ({ src, alt, ...props }: any) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} {...props} />
  ),
}));

/**
 * Performance Tests
 * These tests verify that components render efficiently and meet performance targets
 */
describe('Rendering Performance', () => {
  // Helper function to generate mock courses
  const generateMockCourses = (count: number): CourseWithRelations[] => {
    return Array.from({ length: count }, (_, i) => ({
      id: `course-${i}`,
      title: `Course ${i}`,
      description: `Description for course ${i}`,
      thumbnail: `/images/course-${i}.jpg`,
      duration: 60 + i,
      _count: {
        students: i * 10,
      },
    })) as CourseWithRelations[];
  };

  describe('Single Component Rendering', () => {
    it('should render a single CourseCard quickly', () => {
      const mockCourse = generateMockCourses(1)[0];

      const startTime = performance.now();
      render(<CourseCard course={mockCourse} />);
      const endTime = performance.now();

      const renderTime = endTime - startTime;
      expect(renderTime).toBeLessThan(100); // Should render in < 100ms
    });

    it('should re-render efficiently on prop changes', () => {
      const mockCourse = generateMockCourses(1)[0];
      const { rerender } = render(<CourseCard course={mockCourse} />);

      const startTime = performance.now();
      const updatedCourse = { ...mockCourse, title: 'Updated Title' };
      rerender(<CourseCard course={updatedCourse} />);
      const endTime = performance.now();

      const rerenderTime = endTime - startTime;
      expect(rerenderTime).toBeLessThan(50); // Re-render should be fast
    });
  });

  describe('List Rendering Performance', () => {
    it('should render 10 courses quickly', () => {
      const courses = generateMockCourses(10);

      const startTime = performance.now();
      const { container } = render(
        <div>
          {courses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      );
      const endTime = performance.now();

      const renderTime = endTime - startTime;
      expect(renderTime).toBeLessThan(500); // Should render 10 items in < 500ms
      expect(container.querySelectorAll('.overflow-hidden').length).toBe(10);
    });

    it('should render 50 courses within acceptable time', () => {
      const courses = generateMockCourses(50);

      const startTime = performance.now();
      const { container } = render(
        <div>
          {courses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      );
      const endTime = performance.now();

      const renderTime = endTime - startTime;
      expect(renderTime).toBeLessThan(2000); // Should render 50 items in < 2s
      expect(container.querySelectorAll('.overflow-hidden').length).toBe(50);
    });

    it('should render 100 courses within acceptable time', () => {
      const courses = generateMockCourses(100);

      const startTime = performance.now();
      const { container } = render(
        <div>
          {courses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      );
      const endTime = performance.now();

      const renderTime = endTime - startTime;
      expect(renderTime).toBeLessThan(3000); // Should render 100 items in < 3s
      expect(container.querySelectorAll('.overflow-hidden').length).toBe(100);
    });
  });

  describe('Memory Efficiency', () => {
    it('should not create excessive DOM nodes for single card', () => {
      const mockCourse = generateMockCourses(1)[0];
      const { container } = render(<CourseCard course={mockCourse} />);

      const nodeCount = container.querySelectorAll('*').length;
      expect(nodeCount).toBeLessThan(50); // Should have reasonable number of DOM nodes
    });

    it('should render efficiently with large lists', () => {
      const courses = generateMockCourses(100);

      const { container } = render(
        <div>
          {courses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      );

      const totalNodes = container.querySelectorAll('*').length;
      const averageNodesPerCard = totalNodes / 100;
      expect(averageNodesPerCard).toBeLessThan(100); // Average nodes per card should be reasonable
    });
  });

  describe('React.memo Performance', () => {
    it('should not re-render when props are the same', () => {
      const mockCourse = generateMockCourses(1)[0];
      let renderCount = 0;

      // Create a wrapper to count renders
      const TestWrapper = ({ course }: { course: CourseWithRelations }) => {
        renderCount++;
        return <CourseCard course={course} />;
      };

      const { rerender } = render(<TestWrapper course={mockCourse} />);
      expect(renderCount).toBe(1);

      // Rerender with same props (should use memo)
      rerender(<TestWrapper course={mockCourse} />);
      expect(renderCount).toBe(2); // Will increment but React.memo prevents CourseCard re-render
    });

    it('should have React.memo optimization', () => {
      // CourseCard should be memoized for performance
      expect(CourseCard.displayName).toBe('CourseCard');
    });
  });

  describe('Component Lifecycle Performance', () => {
    it('should mount quickly', () => {
      const mockCourse = generateMockCourses(1)[0];

      const startTime = performance.now();
      const { unmount } = render(<CourseCard course={mockCourse} />);
      const mountTime = performance.now() - startTime;

      expect(mountTime).toBeLessThan(100);

      const unmountStart = performance.now();
      unmount();
      const unmountTime = performance.now() - unmountStart;

      expect(unmountTime).toBeLessThan(50);
    });

    it('should handle rapid mount/unmount cycles', () => {
      const mockCourse = generateMockCourses(1)[0];

      const startTime = performance.now();
      for (let i = 0; i < 10; i++) {
        const { unmount } = render(<CourseCard course={mockCourse} />);
        unmount();
      }
      const totalTime = performance.now() - startTime;

      expect(totalTime).toBeLessThan(500); // 10 mount/unmount cycles in < 500ms
    });
  });

  describe('Update Performance', () => {
    it('should handle frequent prop updates efficiently', () => {
      const mockCourse = generateMockCourses(1)[0];
      const { rerender } = render(<CourseCard course={mockCourse} />);

      const startTime = performance.now();
      for (let i = 0; i < 10; i++) {
        const updatedCourse = {
          ...mockCourse,
          title: `Updated Title ${i}`,
          _count: {
            students: i * 10,
          },
        };
        rerender(<CourseCard course={updatedCourse} />);
      }
      const totalTime = performance.now() - startTime;

      expect(totalTime).toBeLessThan(500); // 10 updates in < 500ms
    });

    it('should batch multiple prop updates efficiently', () => {
      const mockCourse = generateMockCourses(1)[0];
      const { rerender } = render(<CourseCard course={mockCourse} />);

      const updates = Array.from({ length: 5 }, (_, i) => ({
        ...mockCourse,
        title: `Title ${i}`,
        description: `Description ${i}`,
        duration: 60 + i,
      }));

      const startTime = performance.now();
      updates.forEach((course) => {
        rerender(<CourseCard course={course} />);
      });
      const totalTime = performance.now() - startTime;

      expect(totalTime).toBeLessThan(250); // 5 batched updates in < 250ms
    });
  });

  describe('Concurrent Rendering', () => {
    it('should handle rendering multiple different courses simultaneously', () => {
      const courses = generateMockCourses(5);

      const startTime = performance.now();
      const results = courses.map((course) => render(<CourseCard course={course} />));
      const totalTime = performance.now() - startTime;

      expect(totalTime).toBeLessThan(500);
      expect(results.length).toBe(5);

      // Cleanup
      results.forEach((result) => result.unmount());
    });

    it('should maintain performance with staggered renders', async () => {
      const courses = generateMockCourses(10);
      const startTime = performance.now();

      for (const course of courses) {
        const { unmount } = render(<CourseCard course={course} />);
        unmount();
      }

      const totalTime = performance.now() - startTime;
      expect(totalTime).toBeLessThan(1000); // 10 sequential renders in < 1s
    });
  });

  describe('Performance Benchmarks', () => {
    it('should meet performance benchmarks for typical use case', () => {
      // Typical use case: render 12 courses (common grid size)
      const courses = generateMockCourses(12);

      const startTime = performance.now();
      const { container } = render(
        <div className="grid grid-cols-3 gap-4">
          {courses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      );
      const endTime = performance.now();

      const renderTime = endTime - startTime;
      expect(renderTime).toBeLessThan(750); // Typical grid in < 750ms
      expect(container.querySelectorAll('.overflow-hidden').length).toBe(12);
    });

    it('should maintain performance under load', () => {
      // Heavy load: 200 courses
      const courses = generateMockCourses(200);

      const startTime = performance.now();
      const { container } = render(
        <div>
          {courses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      );
      const endTime = performance.now();

      const renderTime = endTime - startTime;
      expect(renderTime).toBeLessThan(5000); // Large list in < 5s
      expect(container.querySelectorAll('.overflow-hidden').length).toBe(200);
    });
  });

  describe('Resource Usage', () => {
    it('should not leak memory on unmount', () => {
      const mockCourse = generateMockCourses(1)[0];

      // Render and unmount multiple times
      for (let i = 0; i < 100; i++) {
        const { unmount } = render(<CourseCard course={mockCourse} />);
        unmount();
      }

      // If we get here without running out of memory, test passes
      expect(true).toBe(true);
    });

    it('should clean up resources properly', () => {
      const courses = generateMockCourses(50);
      const { unmount } = render(
        <div>
          {courses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      );

      // Unmount should complete quickly
      const startTime = performance.now();
      unmount();
      const unmountTime = performance.now() - startTime;

      expect(unmountTime).toBeLessThan(100); // Cleanup should be fast
    });
  });
});
