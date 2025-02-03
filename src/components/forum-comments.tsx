import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ForumComment } from '@/components/forum-comment'
import type { ForumPost } from '@/types/api'

interface ForumCommentsProps {
  post: ForumPost
  onLike?: (commentId: string) => void
  onReply?: (commentId: string) => void
  className?: string
}

export function ForumComments({
  post,
  onLike,
  onReply,
  className,
}: ForumCommentsProps) {
  if (!post.comments?.length) {
    return null
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>תגובות</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4">
        {post.comments.map((comment) => (
          <ForumComment
            key={comment.id}
            comment={comment}
            onLike={onLike}
            onReply={onReply}
          />
        ))}
      </CardContent>
    </Card>
  )
} 