import { Course, Lesson, LessonProgress } from "@/types/courses"

interface CourseContentProps {
  course: Course
  isEnrolled: boolean
}

export const CourseContent = ({ course, isEnrolled }: CourseContentProps) => {
  const sortedLessons = course.lessons.sort((a: Lesson, b: Lesson) => a.order - b.order)
  
  const completedLessons = sortedLessons.filter((lesson: Lesson) => 
    lesson.progress?.some((p: LessonProgress) => p.completed)
  ).length
  
  const freeLessons = sortedLessons.filter((lesson: Lesson) => lesson.isFree).length

  return (
    <div>
      {/* תוכן הקומפוננטה */}
    </div>
  )
} 