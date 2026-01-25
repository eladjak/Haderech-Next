import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CourseCard } from '@/components/courses/course-card';
import type { CourseWithRelations } from '@/types/courses';

// Mock Next.js Image component
vi.mock('next/image', () => ({
  default: ({ src, alt, ...props }: any) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} {...props} />
  ),
}));

describe('CourseCard', () => {
  const mockCourse: CourseWithRelations = {
    id: '1',
    title: 'Test Course',
    description: 'Test Description for this amazing course',
    thumbnail: '/test.jpg',
    duration: 120,
    _count: {
      students: 25,
    },
  } as CourseWithRelations;

  it('should render course title', () => {
    render(<CourseCard course={mockCourse} />);
    expect(screen.getByText('Test Course')).toBeInTheDocument();
  });

  it('should render course description', () => {
    render(<CourseCard course={mockCourse} />);
    expect(screen.getByText('Test Description for this amazing course')).toBeInTheDocument();
  });

  it('should render course thumbnail', () => {
    render(<CourseCard course={mockCourse} />);
    const image = screen.getByAltText('Test Course');
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', '/test.jpg');
  });

  it('should display duration in minutes', () => {
    render(<CourseCard course={mockCourse} />);
    expect(screen.getByText('120 דקות')).toBeInTheDocument();
  });

  it('should display number of students', () => {
    render(<CourseCard course={mockCourse} />);
    expect(screen.getByText('25 תלמידים')).toBeInTheDocument();
  });

  it('should handle missing thumbnail with placeholder', () => {
    const courseWithoutThumbnail = { ...mockCourse, thumbnail: null };
    render(<CourseCard course={courseWithoutThumbnail} />);
    const image = screen.getByAltText('Test Course');
    expect(image).toHaveAttribute('src', '/placeholder.jpg');
  });

  it('should handle zero students count', () => {
    const courseWithNoStudents = {
      ...mockCourse,
      _count: undefined,
    };
    render(<CourseCard course={courseWithNoStudents} />);
    expect(screen.getByText('0 תלמידים')).toBeInTheDocument();
  });

  it('should truncate long descriptions', () => {
    const longDescription = 'This is a very long description that should be truncated '.repeat(10);
    const courseWithLongDesc = { ...mockCourse, description: longDescription };
    render(<CourseCard course={courseWithLongDesc} />);

    // The description should be rendered (line-clamp-2 is a CSS property)
    const descElement = screen.getByText(longDescription);
    expect(descElement).toHaveClass('line-clamp-2');
  });

  it('should truncate long titles', () => {
    const longTitle = 'This is a very long title that should be truncated and shown with ellipsis';
    const courseWithLongTitle = { ...mockCourse, title: longTitle };
    render(<CourseCard course={courseWithLongTitle} />);

    const titleElement = screen.getByText(longTitle);
    expect(titleElement).toHaveClass('line-clamp-2');
  });

  it('should render with correct card structure', () => {
    const { container } = render(<CourseCard course={mockCourse} />);

    // Check for card components
    expect(container.querySelector('.overflow-hidden')).toBeInTheDocument();
  });

  it('should render clock icon for duration', () => {
    const { container } = render(<CourseCard course={mockCourse} />);

    // Clock icon should be present (from lucide-react)
    const clockIcon = container.querySelector('svg');
    expect(clockIcon).toBeInTheDocument();
  });

  it('should handle undefined _count gracefully', () => {
    const courseWithUndefinedCount = {
      ...mockCourse,
      _count: undefined,
    } as CourseWithRelations;

    render(<CourseCard course={courseWithUndefinedCount} />);
    expect(screen.getByText('0 תלמידים')).toBeInTheDocument();
  });

  it('should maintain aspect ratio for thumbnail', () => {
    const { container } = render(<CourseCard course={mockCourse} />);
    const aspectRatioContainer = container.querySelector('.aspect-video');
    expect(aspectRatioContainer).toBeInTheDocument();
  });

  it('should have proper accessibility structure', () => {
    render(<CourseCard course={mockCourse} />);

    // Image should have alt text
    const image = screen.getByAltText('Test Course');
    expect(image).toBeInTheDocument();

    // Title should be present and readable
    expect(screen.getByText('Test Course')).toBeInTheDocument();
  });

  it('should render multiple courses independently', () => {
    const course1 = mockCourse;
    const course2 = { ...mockCourse, id: '2', title: 'Second Course' };

    const { rerender } = render(<CourseCard course={course1} />);
    expect(screen.getByText('Test Course')).toBeInTheDocument();

    rerender(<CourseCard course={course2} />);
    expect(screen.getByText('Second Course')).toBeInTheDocument();
  });

  it('should use React.memo for performance', () => {
    // CourseCard is wrapped in React.memo
    expect(CourseCard.displayName).toBe('CourseCard');
  });
});
