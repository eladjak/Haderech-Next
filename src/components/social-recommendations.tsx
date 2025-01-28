import { useQuery } from '@tanstack/react-query'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

interface SocialRecommendation {
  id: string
  name: string
  avatar_url?: string
  bio: string
  commonInterests: string[]
  matchScore: number
}

async function getSocialRecommendations(): Promise<SocialRecommendation[]> {
  const response = await fetch('/api/social/recommendations')
  if (!response.ok) {
    throw new Error('Failed to fetch social recommendations')
  }
  return response.json()
}

export function SocialRecommendations() {
  const { data: recommendations, isLoading, error } = useQuery({
    queryKey: ['socialRecommendations'],
    queryFn: getSocialRecommendations
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8 text-muted-foreground">
        מחפש המלצות חברתיות...
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center p-8 text-destructive">
        שגיאה בטעינת ההמלצות החברתיות
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold tracking-tight">
          אנשים שכדאי להכיר
        </h2>
        <Button variant="outline" asChild>
          <Link href="/social">
            לכל ההמלצות
          </Link>
        </Button>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {recommendations?.map(person => (
          <Card key={person.id}>
            <CardHeader>
              <div className="flex items-center gap-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={person.avatar_url} />
                  <AvatarFallback>{person.name[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-lg">{person.name}</CardTitle>
                  <CardDescription className="line-clamp-2">
                    {person.bio}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">
                  התאמה: {person.matchScore}%
                </div>
                <div className="flex flex-wrap gap-2">
                  {person.commonInterests.map(interest => (
                    <div
                      key={interest}
                      className="rounded-full bg-secondary px-2.5 py-0.5 text-xs text-secondary-foreground"
                    >
                      {interest}
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
} 