"use client";

/**
 * @file course-comments.tsx
 * @description Comments component for course pages showing user discussions
 */
import { useState } from "react";

import Image from "next/image";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { CourseComment } from "@/types/api";

interface CourseCommentsProps {
  comments: CourseComment[];
  courseId: string;
  onAddComment?: (content: string) => Promise<void>;
  onAddReply?: (commentId: string, content: string) => Promise<void>;
}

export function CourseComments({
  comments,
  courseId,
  onAddComment,
  onAddReply,
}: CourseCommentsProps) {
  const [showAll, setShowAll] = useState(false);

  if (!comments?.length) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-muted-foreground">אין תגובות עדיין</p>
        </CardContent>
      </Card>
    );
  }

  const displayComments = showAll ? comments : comments.slice(0, 3);

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">תגובות</h3>
          <span className="text-sm text-muted-foreground">
            ({comments.length} תגובות)
          </span>
        </div>
        <div className="mt-6 space-y-6">
          {displayComments.map((comment) => (
            <div key={comment.id} className="space-y-4">
              <div className="flex items-start space-x-4 rtl:space-x-reverse">
                <div className="relative h-10 w-10">
                  <Image
                    src={comment.user.avatar_url || "/placeholder.png"}
                    alt={comment.user.name}
                    fill
                    className="rounded-full object-cover"
                  />
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="font-medium">{comment.user.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(comment.created_at).toLocaleDateString("he-IL")}
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {comment.content}
                  </p>
                  {comment.replies && comment.replies.length > 0 && (
                    <div className="mt-4 space-y-4 border-l-2 pl-4 rtl:border-r-2 rtl:pl-0 rtl:pr-4">
                      {comment.replies.map((reply) => (
                        <div
                          key={reply.id}
                          className="flex items-start space-x-4 rtl:space-x-reverse"
                        >
                          <div className="relative h-10 w-10">
                            <Image
                              src={reply.user.avatar_url || "/placeholder.png"}
                              alt={reply.user.name}
                              fill
                              className="rounded-full object-cover"
                            />
                          </div>
                          <div className="flex-1 space-y-1">
                            <div className="flex items-center justify-between">
                              <div className="text-sm font-medium">
                                {reply.user.name}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {new Date(reply.created_at).toLocaleDateString(
                                  "he-IL"
                                )}
                              </div>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {reply.content}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
        {!showAll && comments.length > 3 && (
          <div className="mt-6 text-center">
            <Button variant="outline" onClick={() => setShowAll(true)}>
              הצג עוד תגובות
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
