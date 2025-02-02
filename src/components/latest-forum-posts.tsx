import { MessageSquare } from "lucide-react"
import Link from "next/link"

import type { ForumPost } from "@/types/forum"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface LatestForumPostsProps {
  posts: ForumPost[]
}

export function LatestForumPosts({ posts }: LatestForumPostsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>דיונים אחרונים</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {posts.map((post) => (
            <Link
              key={post.id}
              href={`/forum/${post.id}`}
              className="block space-y-2 rounded-lg border p-4 hover:bg-muted/50"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">{post.title}</h3>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <MessageSquare className="h-4 w-4" />
                  <span>{post.commentsCount}</span>
                </div>
              </div>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {post.content}
              </p>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  )
} 