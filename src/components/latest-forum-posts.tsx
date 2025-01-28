import { useQuery } from '@tanstack/react-query'
import { getLatestForumPosts } from '@/lib/api'
import { formatDistanceToNow } from 'date-fns'
import { he } from 'date-fns/locale'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export function LatestForumPosts() {
  const { data: posts, isLoading, error } = useQuery({
    queryKey: ['latestForumPosts'],
    queryFn: getLatestForumPosts
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8 text-muted-foreground">
        טוען פוסטים אחרונים...
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center p-8 text-destructive">
        שגיאה בטעינת הפוסטים האחרונים
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold tracking-tight">
          פוסטים אחרונים בפורום
        </h2>
        <Button variant="outline" asChild>
          <Link href="/forum">
            לכל הפוסטים
          </Link>
        </Button>
      </div>
      <div className="space-y-4">
        {posts?.map(post => (
          <Card key={post.id}>
            <CardHeader>
              <div className="flex items-center gap-4">
                <Avatar>
                  <AvatarImage src={post.author.avatar_url} />
                  <AvatarFallback>{post.author.name[0]}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <CardTitle className="text-lg">{post.title}</CardTitle>
                  <CardDescription>
                    {post.author.name} • {formatDistanceToNow(new Date(post.created_at), { locale: he, addSuffix: true })}
                  </CardDescription>
                </div>
                <div className="text-sm text-muted-foreground">
                  {post.replies_count} תגובות
                </div>
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  )
} 