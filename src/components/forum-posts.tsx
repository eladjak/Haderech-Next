import { ForumPost } from '@/components/forum-post'
import type { ForumPost as ForumPostType } from '@/types/api'

interface ForumPostsProps {
  posts: ForumPostType[]
  onLike?: (postId: string) => void
  className?: string
}

export function ForumPosts({ posts, onLike, className }: ForumPostsProps) {
  return (
    <div className={`grid gap-4 ${className}`}>
      {posts.map((post) => (
        <ForumPost key={post.id} post={post} onLike={onLike} />
      ))}
    </div>
  )
} 