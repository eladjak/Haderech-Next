import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getLatestForumPosts, type ForumPost } from '@/lib/api'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { formatDistanceToNow } from 'date-fns'
import { he } from 'date-fns/locale'

export async function LatestForumPosts() {
  const posts = await getLatestForumPosts()

  if (!posts || posts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>פוסטים אחרונים בפורום</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">אין פוסטים חדשים</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>פוסטים אחרונים בפורום</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {posts.map((post: ForumPost) => (
            <Link
              key={post.id}
              href={`/forum/posts/${post.id}`}
              className="block space-y-3"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <Avatar className="h-8 w-8">
                    {post.author.avatar_url ? (
                      <AvatarImage src={post.author.avatar_url} />
                    ) : null}
                    <AvatarFallback>
                      {post.author.name.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium leading-none">
                      {post.title}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {post.author.name} •{' '}
                      {formatDistanceToNow(new Date(post.created_at), {
                        addSuffix: true,
                        locale: he,
                      })}
                    </p>
                  </div>
                </div>
                {post.replies_count > 0 && (
                  <span className="text-sm text-muted-foreground">
                    {post.replies_count} תגובות
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  )
} 