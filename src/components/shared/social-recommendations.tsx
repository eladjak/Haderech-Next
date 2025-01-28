import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

interface Recommendation {
  id: string
  user: {
    name: string
    avatar: string
  }
  course: {
    title: string
    id: string
  }
  content: string
  rating: number
}

const EXAMPLE_RECOMMENDATIONS: Recommendation[] = [
  {
    id: '1',
    user: {
      name: 'דוד כהן',
      avatar: '/avatars/david.jpg'
    },
    course: {
      title: 'תקשורת זוגית אפקטיבית',
      id: '1'
    },
    content: 'הקורס הזה שינה את הדרך שבה אני מתקשר עם בת הזוג שלי. ממליץ בחום!',
    rating: 5
  },
  {
    id: '2',
    user: {
      name: 'מיכל לוי',
      avatar: '/avatars/michal.jpg'
    },
    course: {
      title: 'בניית אמון בזוגיות',
      id: '2'
    },
    content: 'למדתי המון כלים פרקטיים שעוזרים לי ביומיום. תודה!',
    rating: 4
  }
]

export function SocialRecommendations() {
  return (
    <section className="py-12">
      <div className="container">
        <h2 className="text-3xl font-bold mb-8">המלצות מהקהילה</h2>
        <div className="grid gap-6 md:grid-cols-2">
          {EXAMPLE_RECOMMENDATIONS.map((recommendation) => (
            <Card key={recommendation.id}>
              <CardHeader>
                <div className="flex items-center gap-4">
                  <Avatar>
                    <AvatarImage src={recommendation.user.avatar} alt={recommendation.user.name} />
                    <AvatarFallback>{recommendation.user.name[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-semibold">{recommendation.user.name}</div>
                    <div className="text-sm text-muted-foreground">
                      על הקורס: {recommendation.course.title}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{recommendation.content}</p>
                <div className="mt-2 flex items-center">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <svg
                      key={i}
                      className={`h-4 w-4 ${
                        i < recommendation.rating ? 'text-yellow-400' : 'text-gray-300'
                      }`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
} 