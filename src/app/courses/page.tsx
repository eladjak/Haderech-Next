import type { Metadata } from "next"
import { CourseCard } from "@/components/courses/course-card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { EXAMPLE_COURSES } from "@/constants/courses"

export const metadata: Metadata = {
  title: "קורסים - הדרך",
  description: "קורסים מקצועיים לשיפור מערכות יחסים",
  keywords: "קורסים, מערכות יחסים, זוגיות, תקשורת, אינטימיות",
}

export default function CoursesPage() {
  return (
    <div className="container py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">קורסים</h1>
        <Button variant="outline">סנן קורסים</Button>
      </div>

      <Tabs defaultValue="all" className="mb-8">
        <TabsList>
          <TabsTrigger value="all">כל הקורסים</TabsTrigger>
          <TabsTrigger value="in-progress">בתהליך למידה</TabsTrigger>
          <TabsTrigger value="completed">הושלמו</TabsTrigger>
        </TabsList>
        <TabsContent value="all" className="mt-6">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {EXAMPLE_COURSES.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        </TabsContent>
        <TabsContent value="in-progress">
          <div className="text-center py-8 text-muted-foreground">
            <p>אין קורסים בתהליך למידה</p>
          </div>
        </TabsContent>
        <TabsContent value="completed">
          <div className="text-center py-8 text-muted-foreground">
            <p>אין קורסים שהושלמו</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
} 