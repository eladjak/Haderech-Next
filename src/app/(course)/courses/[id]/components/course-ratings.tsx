import { Course, CourseRating } from "@/types/courses"

interface CourseRatingsProps {
  course: Course
  showAll?: boolean
}

const CourseRatings = ({ course, showAll = false }: CourseRatingsProps) => {
  const ratings = course.ratings
  const averageRating = ratings.reduce((acc, curr) => acc + curr.rating, 0) / ratings.length

  // ... existing code ...
} 