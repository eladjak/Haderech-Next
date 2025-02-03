"use client"

import type { CourseWithRelations } from "@/types/courses"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MessageCircle, Reply } from "lucide-react"

interface CourseCommentsProps {
  course: CourseWithRelations
  showAll?: boolean
}

export function CourseComments({ course, showAll = false }: CourseCommentsProps) {
  const comments = course.comments || []
  const displayComments = showAll ? comments : comments.slice(0, 3)
  
  const handleReply = (commentId: string) => {
    // Handle reply logic
    console.log('Replying to comment:', commentId)
  }

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
                  <AvatarImage src={comment.user.avatar_url} />
                  <AvatarFallback>{comment.user.name[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium">{comment.user.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {new Date('2024-01-01T00:00:00.000Z').toLocaleDateString('he-IL')}
                  </div>
                </div>
              </div>
              <p className="text-sm">{comment.content}</p>
              <Button variant="ghost" size="sm" className="gap-2" onClick={() => handleReply(comment.id)}>
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
                        <AvatarImage src={reply.user.avatar_url} />
                        <AvatarFallback>{reply.user.name[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="text-sm font-medium">{reply.user.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {new Date('2024-01-01T00:00:00.000Z').toLocaleDateString('he-IL')}
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

        {!showAll && comments.length > 3 && (
          <Button variant="outline" className="w-full">
            הצג עוד תגובות
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