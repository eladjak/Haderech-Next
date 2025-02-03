import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { MessageSquare, ThumbsUp, User } from 'lucide-react'
import type { ForumComment } from '@/types/api'

interface ForumCommentProps {
  comment: ForumComment
  onLike?: (commentId: string) => void
  onReply?: (commentId: string) => void
  className?: string
}

export function ForumComment({
  comment,
  onLike,
  onReply,
  className,
}: ForumCommentProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center gap-4">
          <Avatar>
            <AvatarImage src={comment.author?.avatar_url} />
            <AvatarFallback>
              {comment.author?.name?.[0] ?? <User className="h-4 w-4" />}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="font-medium">
              {comment.author?.name ?? 'משתמש אנונימי'}
            </div>
            <div className="text-sm text-muted-foreground">
              {new Date(comment.created_at).toLocaleDateString('he-IL')}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-sm">{comment.content}</div>
      </CardContent>
      <CardFooter>
        <div className="flex gap-4">
          {onLike && (
            <Button
              variant="ghost"
              size="sm"
              className="gap-2"
              onClick={() => onLike(comment.id)}
            >
              <ThumbsUp
                className={`h-4 w-4 ${
                  comment.likes > 0 ? 'fill-primary text-primary' : ''
                }`}
              />
              <span>{comment.likes}</span>
            </Button>
          )}
          {onReply && (
            <Button
              variant="ghost"
              size="sm"
              className="gap-2"
              onClick={() => onReply(comment.id)}
            >
              <MessageSquare className="h-4 w-4" />
              <span>הגב</span>
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  )
} 