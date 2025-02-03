import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";
import { EXAMPLE_POSTS, EXAMPLE_CATEGORIES } from "@/constants/forum";

export const metadata: Metadata = {
  title: "פורום - הדרך",
  description: "פורום לשיתוף ודיון בנושאי זוגיות ומערכות יחסים",
  keywords: "פורום, זוגיות, מערכות יחסים, דיון, קהילה",
};

export default function ForumPage() {
  return (
    <div className="container py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">פורום</h1>
          <p className="text-muted-foreground">
            שתפו, שאלו והתייעצו עם חברי הקהילה
          </p>
        </div>
        <Button asChild>
          <Link href="/forum/new">פתיחת דיון חדש</Link>
        </Button>
      </div>

      <div className="grid gap-8 md:grid-cols-[1fr_300px]">
        <div className="grid gap-6">
          {EXAMPLE_POSTS.map((post) => (
            <Link key={post.id} href={`/forum/${post.id}`}>
              <Card className="p-6 hover:bg-muted/50 transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-semibold mb-2">{post.title}</h2>
                    <p className="text-muted-foreground mb-4">{post.content}</p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Image
                          src={post.author.avatar}
                          alt={post.author.name}
                          width={24}
                          height={24}
                          className="rounded-full"
                        />
                        <span>{post.author.name}</span>
                      </div>
                      <span>{formatDate(post.createdAt)}</span>
                      <span>{post.commentsCount} תגובות</span>
                      <span>{post.views} צפיות</span>
                      <span>{post.likes} לייקים</span>
                    </div>
                    {post.tags && (
                      <div className="flex gap-2 mt-4">
                        {post.tags.map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-1 text-xs bg-muted rounded-md"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">קטגוריות</h2>
          <div className="grid gap-4">
            {EXAMPLE_CATEGORIES.map((category) => (
              <Card key={category.id} className="p-4">
                <h3 className="font-medium mb-1">{category.name}</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  {category.description}
                </p>
                <div className="text-sm text-muted-foreground">
                  {category.postsCount} פוסטים
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
