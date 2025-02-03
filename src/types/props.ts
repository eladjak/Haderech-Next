import { CourseWithRelations as Course, CourseComment, CourseRating } from './courses'
import { Profile } from './models'

export interface CourseCardProps {
  course: Course
}

export interface CourseCommentsProps {
  comments: CourseComment[] | null
  courseId: string
}

export interface CourseContentProps {
  course: Course
  isEnrolled?: boolean
}

export interface CourseHeaderProps {
  course: Course
  isEnrolled?: boolean
}

export interface CourseProgressProps {
  course: Course
  isEnrolled: boolean
}

export interface CourseRatingsProps {
  ratings: CourseRating[] | null
}

export interface CourseSidebarProps {
  course: Course
  isEnrolled: boolean
}

export interface ProfileFormProps {
  profile: Profile
}

export interface ProfileHeaderProps {
  profile: Profile
  isCurrentUser?: boolean
}

export interface ProfileStatsProps {
  stats: {
    coursesCompleted: number
    totalCourses: number
    averageScore: number
    totalTime: number
    achievements: number
    certificatesEarned: number
  }
}

export interface AvatarProps {
  src: string | null
  alt?: string
  fallback: string
} 