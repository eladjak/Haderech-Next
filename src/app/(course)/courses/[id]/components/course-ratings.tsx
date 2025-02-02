import { Course } from "@/types/courses"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Star } from "lucide-react"

interface CourseRatingsProps {
  course: Course
  showAll?: boolean
}

export const CourseRatings = ({ course, showAll = false }: CourseRatingsProps) => {
  const ratings = course.ratings
  const averageRating = ratings.reduce((acc, curr) => acc + curr.rating, 0) / ratings.length

  return (
    <Card>
      <CardHeader>
        <CardTitle>דירוגים</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold">{averageRating.toFixed(1)}</span>
            <Star className="h-6 w-6 fill-yellow-400 text-yellow-400" />
            <span className="text-muted-foreground">({ratings.length} דירוגים)</span>
          </div>
          
          {(showAll ? ratings : ratings.slice(0, 3)).map((rating, index) => (
            <div key={index} className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${
                        i < rating.rating
                          ? "fill-yellow-400 text-yellow-400"
                          : "fill-gray-200 text-gray-200"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm text-muted-foreground">
                  {rating.comment}
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
} 