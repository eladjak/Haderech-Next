"use client";

import { useState, useCallback } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/../convex/_generated/api";
import type { Id } from "@/../convex/_generated/dataModel";

interface CommentsSectionProps {
  lessonId: Id<"lessons">;
  courseId: Id<"courses">;
  userId: Id<"users"> | null;
  userRole?: string;
}

export function CommentsSection({
  lessonId,
  courseId,
  userId,
  userRole,
}: CommentsSectionProps) {
  const comments = useQuery(api.comments.listByLesson, { lessonId });
  const commentCount = useQuery(api.comments.countByLesson, { lessonId });
  const createComment = useMutation(api.comments.create);
  const updateComment = useMutation(api.comments.update);
  const removeComment = useMutation(api.comments.remove);

  const [newComment, setNewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [replyingTo, setReplyingTo] = useState<Id<"comments"> | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [editingId, setEditingId] = useState<Id<"comments"> | null>(null);
  const [editContent, setEditContent] = useState("");

  const handleSubmit = useCallback(async () => {
    if (!newComment.trim() || submitting) return;
    setSubmitting(true);
    await createComment({
      lessonId,
      courseId,
      content: newComment.trim(),
    });
    setNewComment("");
    setSubmitting(false);
  }, [newComment, submitting, createComment, lessonId, courseId]);

  const handleReply = useCallback(
    async (parentId: Id<"comments">) => {
      if (!replyContent.trim() || submitting) return;
      setSubmitting(true);
      await createComment({
        lessonId,
        courseId,
        content: replyContent.trim(),
        parentId,
      });
      setReplyContent("");
      setReplyingTo(null);
      setSubmitting(false);
    },
    [replyContent, submitting, createComment, lessonId, courseId]
  );

  const handleEdit = useCallback(
    async (id: Id<"comments">) => {
      if (!editContent.trim() || submitting) return;
      setSubmitting(true);
      await updateComment({ id, content: editContent.trim() });
      setEditingId(null);
      setEditContent("");
      setSubmitting(false);
    },
    [editContent, submitting, updateComment]
  );

  const handleDelete = useCallback(
    async (id: Id<"comments">) => {
      await removeComment({ id });
    },
    [removeComment]
  );

  const formatTime = (timestamp: number) => {
    const diff = Date.now() - timestamp;
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return "עכשיו";
    if (minutes < 60) return `לפני ${minutes} דקות`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `לפני ${hours} שעות`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `לפני ${days} ימים`;
    return new Date(timestamp).toLocaleDateString("he-IL");
  };

  const isAdmin = userRole === "admin";

  return (
    <section className="mt-10 border-t border-zinc-200 pt-8 dark:border-zinc-800">
      <h2 className="mb-6 text-xl font-bold text-zinc-900 dark:text-white">
        דיון ({commentCount ?? 0})
      </h2>

      {/* New comment form */}
      {userId ? (
        <div className="mb-8">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="כתוב תגובה..."
            rows={3}
            maxLength={2000}
            className="w-full resize-none rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-400 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-white dark:placeholder:text-zinc-500 dark:focus:border-zinc-600"
          />
          <div className="mt-2 flex items-center justify-between">
            <span className="text-xs text-zinc-400">
              {newComment.length}/2000
            </span>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!newComment.trim() || submitting}
              className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100"
            >
              {submitting ? "שולח..." : "שלח תגובה"}
            </button>
          </div>
        </div>
      ) : (
        <p className="mb-8 rounded-xl bg-zinc-50 p-4 text-center text-sm text-zinc-500 dark:bg-zinc-900 dark:text-zinc-400">
          התחבר כדי להשתתף בדיון
        </p>
      )}

      {/* Comments list */}
      {comments === undefined ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="animate-pulse rounded-xl bg-zinc-50 p-4 dark:bg-zinc-900"
            >
              <div className="mb-2 h-4 w-24 rounded bg-zinc-200 dark:bg-zinc-700" />
              <div className="h-4 w-full rounded bg-zinc-200 dark:bg-zinc-700" />
            </div>
          ))}
        </div>
      ) : comments.length === 0 ? (
        <div className="rounded-xl bg-zinc-50 p-8 text-center dark:bg-zinc-900">
          <svg
            className="mx-auto mb-2 h-10 w-10 text-zinc-300 dark:text-zinc-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z"
            />
          </svg>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            אין תגובות עדיין. היו הראשונים להגיב!
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <div
              key={comment._id}
              className="rounded-xl border border-zinc-100 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900/50"
            >
              {/* Comment header */}
              <div className="mb-2 flex items-center gap-2">
                {comment.userImage ? (
                  <img
                    src={comment.userImage}
                    alt=""
                    className="h-7 w-7 rounded-full"
                  />
                ) : (
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-zinc-200 text-xs font-medium text-zinc-600 dark:bg-zinc-700 dark:text-zinc-300">
                    {comment.userName.charAt(0)}
                  </div>
                )}
                <span className="text-sm font-medium text-zinc-900 dark:text-white">
                  {comment.userName}
                </span>
                <span className="text-xs text-zinc-400">
                  {formatTime(comment.createdAt)}
                </span>
                {comment.updatedAt > comment.createdAt + 1000 && (
                  <span className="text-xs text-zinc-400">(נערך)</span>
                )}
              </div>

              {/* Comment content or edit form */}
              {editingId === comment._id ? (
                <div className="mb-2">
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    rows={3}
                    maxLength={2000}
                    className="w-full resize-none rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-zinc-400 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-white dark:focus:border-zinc-600"
                  />
                  <div className="mt-1 flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleEdit(comment._id)}
                      disabled={!editContent.trim() || submitting}
                      className="rounded-lg bg-zinc-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-zinc-800 disabled:opacity-50 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100"
                    >
                      שמור
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingId(null);
                        setEditContent("");
                      }}
                      className="rounded-lg px-3 py-1.5 text-xs text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                    >
                      ביטול
                    </button>
                  </div>
                </div>
              ) : (
                <p className="mb-2 whitespace-pre-wrap text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
                  {comment.content}
                </p>
              )}

              {/* Comment actions */}
              {userId && editingId !== comment._id && (
                <div className="flex gap-3 text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      setReplyingTo(
                        replyingTo === comment._id ? null : comment._id
                      );
                      setReplyContent("");
                    }}
                    className="text-zinc-400 transition-colors hover:text-zinc-900 dark:hover:text-white"
                  >
                    הגב
                  </button>
                  {(comment.userId === userId || isAdmin) && (
                    <>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingId(comment._id);
                          setEditContent(comment.content);
                        }}
                        className="text-zinc-400 transition-colors hover:text-zinc-900 dark:hover:text-white"
                      >
                        ערוך
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(comment._id)}
                        className="text-zinc-400 transition-colors hover:text-red-600 dark:hover:text-red-400"
                      >
                        מחק
                      </button>
                    </>
                  )}
                </div>
              )}

              {/* Reply form */}
              {replyingTo === comment._id && userId && (
                <div className="mt-3 mr-4 border-r-2 border-zinc-200 pr-4 dark:border-zinc-700">
                  <textarea
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    placeholder="כתוב תשובה..."
                    rows={2}
                    maxLength={2000}
                    className="w-full resize-none rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-400 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-white dark:placeholder:text-zinc-500 dark:focus:border-zinc-600"
                  />
                  <div className="mt-1 flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleReply(comment._id)}
                      disabled={!replyContent.trim() || submitting}
                      className="rounded-lg bg-zinc-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-zinc-800 disabled:opacity-50 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100"
                    >
                      {submitting ? "שולח..." : "שלח תשובה"}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setReplyingTo(null);
                        setReplyContent("");
                      }}
                      className="rounded-lg px-3 py-1.5 text-xs text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                    >
                      ביטול
                    </button>
                  </div>
                </div>
              )}

              {/* Replies */}
              {comment.replies && comment.replies.length > 0 && (
                <div className="mt-3 space-y-3 mr-4 border-r-2 border-zinc-100 pr-4 dark:border-zinc-800">
                  {comment.replies.map((reply) => (
                    <div key={reply._id}>
                      <div className="mb-1 flex items-center gap-2">
                        {reply.userImage ? (
                          <img
                            src={reply.userImage}
                            alt=""
                            className="h-6 w-6 rounded-full"
                          />
                        ) : (
                          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-zinc-200 text-xs font-medium text-zinc-600 dark:bg-zinc-700 dark:text-zinc-300">
                            {reply.userName.charAt(0)}
                          </div>
                        )}
                        <span className="text-sm font-medium text-zinc-900 dark:text-white">
                          {reply.userName}
                        </span>
                        <span className="text-xs text-zinc-400">
                          {formatTime(reply.createdAt)}
                        </span>
                        {reply.updatedAt > reply.createdAt + 1000 && (
                          <span className="text-xs text-zinc-400">(נערך)</span>
                        )}
                      </div>

                      {editingId === reply._id ? (
                        <div className="mb-1">
                          <textarea
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                            rows={2}
                            maxLength={2000}
                            className="w-full resize-none rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-zinc-400 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-white dark:focus:border-zinc-600"
                          />
                          <div className="mt-1 flex gap-2">
                            <button
                              type="button"
                              onClick={() => handleEdit(reply._id)}
                              disabled={!editContent.trim() || submitting}
                              className="rounded-lg bg-zinc-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-zinc-800 disabled:opacity-50 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100"
                            >
                              שמור
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setEditingId(null);
                                setEditContent("");
                              }}
                              className="rounded-lg px-3 py-1.5 text-xs text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                            >
                              ביטול
                            </button>
                          </div>
                        </div>
                      ) : (
                        <p className="mb-1 whitespace-pre-wrap text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
                          {reply.content}
                        </p>
                      )}

                      {userId &&
                        editingId !== reply._id &&
                        (reply.userId === userId || isAdmin) && (
                          <div className="flex gap-3 text-xs">
                            <button
                              type="button"
                              onClick={() => {
                                setEditingId(reply._id);
                                setEditContent(reply.content);
                              }}
                              className="text-zinc-400 transition-colors hover:text-zinc-900 dark:hover:text-white"
                            >
                              ערוך
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete(reply._id)}
                              className="text-zinc-400 transition-colors hover:text-red-600 dark:hover:text-red-400"
                            >
                              מחק
                            </button>
                          </div>
                        )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
