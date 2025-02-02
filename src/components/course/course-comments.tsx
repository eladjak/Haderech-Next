"use client"

/**
 * @file course-comments.tsx
 * @description Comments component for course pages showing user discussions
 */

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { MessageCircle, Reply } from 'lucide-react'
import type { CourseComment } from '@/types/courses'

interface CourseCommentsProps {
  comments: CourseComment[]
  courseId: string
}

export function CourseComments({ comments, courseId }: CourseCommentsProps) {
  const [showAll, setShowAll] = useState(false)
  const displayComments = showAll ? comments : comments.slice(0, 3)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>תגובות ודיונים</span>
          <span className="text-sm text-muted-foreground">
            ({comments.length} תגובות)
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {displayComments.map((comment) => (
          <div key={comment.id} className="space-y-4">
            {/* Main Comment */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={comment.user.avatar_url || undefined} />
                  <AvatarFallback>{comment.user.name[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium">{comment.user.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(comment.created_at).toLocaleDateString('he-IL')}
                  </div>
                </div>
              </div>
              <p className="text-sm">{comment.content}</p>
              <Button variant="ghost" size="sm" className="gap-2">
                <Reply className="h-4 w-4" />
                השב
              </Button>
            </div>

            {/* Replies */}
            {comment.replies && comment.replies.length > 0 && (
              <div className="space-y-4 border-r pr-4">
                {comment.replies.map((reply) => (
                  <div key={reply.id} className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={reply.user.avatar_url || undefined} />
                        <AvatarFallback>{reply.user.name[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="text-sm font-medium">{reply.user.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(reply.created_at).toLocaleDateString('he-IL')}
                        </div>
                      </div>
                    </div>
                    <p className="text-sm">{reply.content}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}

        {comments.length > 3 && (
          <Button
            variant="outline"
            className="w-full"
            onClick={() => setShowAll(!showAll)}
          >
            {showAll ? 'הצג פחות' : 'הצג הכל'}
          </Button>
        )}

        <Button className="w-full gap-2">
          <MessageCircle className="h-4 w-4" />
          הוסף תגובה
        </Button>
      </CardContent>
    </Card>
  )
} 