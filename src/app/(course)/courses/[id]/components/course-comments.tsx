import { Course, CourseComment } from "@/types/courses"

interface CourseCommentsProps {
  course: Course
  showAll?: boolean
}

const CourseComments = ({ course, showAll = false }: CourseCommentsProps) => {
  const comments = course.comments
  
  const handleReply = (comment: CourseComment) => {
    // Handle reply logic
    console.log('Replying to comment:', comment.id)
  }
} 