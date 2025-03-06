"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { CourseComment } from "@/types/courses";

/**
 * @file course-comments.tsx
 * @description Comments component for course pages showing user discussions
 */

// הרחבה של הטיפוס CourseComment להוספת תמיכה ב-replies
interface CommentWithReplies extends CourseComment {
  replies?: CourseComment[];
}

interface CourseCommentsProps {
  comments?: CommentWithReplies[];
  maxComments?: number;
  showAll?: boolean;
}

export function CourseComments({
  comments = [],
  maxComments = 5,
  showAll = false,
}: CourseCommentsProps) {
  const [showAllComments, setShowAllComments] = useState(showAll);
  const [activeReplyId, setActiveReplyId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");

  const visibleComments = showAllComments
    ? comments
    : comments.slice(0, maxComments);

  const handleReplyClick = (commentId: string) => {
    setActiveReplyId(activeReplyId === commentId ? null : commentId);
    setReplyText("");
  };

  const handleReplySubmit = (commentId: string) => {
    console.log(`Submitting reply to comment ${commentId}: ${replyText}`);
    // כאן יבוא קוד לשליחת התגובה לשרת
    setReplyText("");
    setActiveReplyId(null);
  };

  if (comments.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">
            אין תגובות עדיין. היה הראשון להגיב!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {visibleComments.map((comment) => (
        <Card key={comment.id} className="overflow-hidden">
          <CardContent className="p-4">
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="relative h-10 w-10 overflow-hidden rounded-full">
                  <Image
                    src={comment.user.image || "/images/avatars/default.png"}
                    alt={comment.user.name}
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
              <div className="flex-1 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">{comment.user.name}</h4>
                    <p className="text-xs text-muted-foreground">
                      {new Date(comment.created_at).toLocaleDateString("he-IL")}
                    </p>
                  </div>
                  {comment.rating && (
                    <div className="flex items-center">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <span
                          key={i}
                          className={`h-4 w-4 text-${
                            i < comment.rating! ? "yellow-400" : "gray-200"
                          }`}
                        >
                          ★
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <p className="text-sm">{comment.content}</p>
                <div className="flex justify-end">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleReplyClick(comment.id)}
                  >
                    {activeReplyId === comment.id ? "ביטול" : "הגב"}
                  </Button>
                </div>

                {activeReplyId === comment.id && (
                  <div className="mt-2 space-y-2">
                    <textarea
                      className="w-full rounded-md border p-2 text-sm"
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="הוסף תגובה..."
                      rows={3}
                    />
                    <div className="flex justify-end">
                      <Button
                        size="sm"
                        onClick={() => handleReplySubmit(comment.id)}
                        disabled={!replyText.trim()}
                      >
                        שלח
                      </Button>
                    </div>
                  </div>
                )}

                {comment.replies && comment.replies.length > 0 && (
                  <div className="mt-4 space-y-3 border-r border-gray-200 pr-4">
                    {comment.replies.map((reply) => (
                      <div key={reply.id} className="flex gap-2">
                        <div className="flex-shrink-0">
                          <div className="relative h-8 w-8 overflow-hidden rounded-full">
                            <Image
                              src={
                                reply.user.image ||
                                "/images/avatars/default.png"
                              }
                              alt={reply.user.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center">
                            <h5 className="text-sm font-medium">
                              {reply.user.name}
                            </h5>
                            <span className="mx-2 text-xs text-muted-foreground">
                              •
                            </span>
                            <p className="text-xs text-muted-foreground">
                              {new Date(reply.created_at).toLocaleDateString(
                                "he-IL"
                              )}
                            </p>
                          </div>
                          <p className="text-sm">{reply.content}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      {comments.length > maxComments && !showAllComments && (
        <div className="flex justify-center">
          <Button variant="outline" onClick={() => setShowAllComments(true)}>
            הצג את כל {comments.length} התגובות
          </Button>
        </div>
      )}
    </div>
  );
}
