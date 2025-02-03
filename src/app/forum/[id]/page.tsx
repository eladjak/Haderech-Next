import type { Metadata } from "next";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { formatDate } from "@/lib/utils";
import { EXAMPLE_POSTS } from "@/constants/forum";
import type { ForumPost } from "@/types/forum";

interface ForumPostPageProps {
  params: {
    id: string;
  };
}

const EXAMPLE_POST: ForumPost = {
  ...EXAMPLE_POSTS[0],
  comments: [
    {
      id: "1",
      content:
        "חשוב מאוד לתרגל הקשבה פעילה. נסו להבין את נקודת המבט של בן/בת הזוג מבלי לשפוט או להתגונן.",
      author: {
        id: "2",
        name: "יוסי לוי",
        avatar: "/avatars/2.jpg",
      },
      createdAt: "2024-01-20T11:30:00.000Z",
    },
    {
      id: "2",
      content:
        "אנחנו משתמשים בטכניקת 'זמן שקט' - כשאנחנו מרגישים שהדיון מתלהט, לוקחים הפסקה של 20 דקות להירגע ולחשוב.",
      author: {
        id: "3",
        name: "מיכל ברק",
        avatar: "/avatars/3.jpg",
      },
      createdAt: "2024-01-20T12:15:00.000Z",
    },
  ],
};

export async function generateMetadata({
  params,
}: ForumPostPageProps): Promise<Metadata> {
  const post = EXAMPLE_POSTS.find((post) => post.id === params.id);

  if (!post) {
    return {
      title: "פוסט לא נמצא - פורום הדרך",
      description: "הפוסט המבוקש לא נמצא",
    };
  }

  return {
    title: `${post.title} - פורום הדרך`,
    description: post.content,
  };
}

export default function ForumPostPage({ params }: ForumPostPageProps) {
  const post = EXAMPLE_POSTS.find((post) => post.id === params.id);

  if (!post) {
    return (
      <div className="container py-8">
        <h1 className="text-3xl font-bold mb-4">פוסט לא נמצא</h1>
        <p className="text-muted-foreground">הפוסט המבוקש לא נמצא במערכת.</p>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <Card className="p-6 mb-8">
        <div className="flex items-start gap-4 mb-6">
          <Image
            src={post.author.avatar}
            alt={post.author.name}
            width={40}
            height={40}
            className="rounded-full"
          />
          <div>
            <h1 className="text-2xl font-bold mb-2">{post.title}</h1>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>{post.author.name}</span>
              <span>{formatDate(post.createdAt)}</span>
              <span>{post.views} צפיות</span>
              <span>{post.likes} לייקים</span>
            </div>
          </div>
        </div>
        <p className="text-lg mb-6">{post.content}</p>
        {post.tags && (
          <div className="flex gap-2">
            {post.tags.map((tag) => (
              <span key={tag} className="px-2 py-1 text-xs bg-muted rounded-md">
                {tag}
              </span>
            ))}
          </div>
        )}
      </Card>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">תגובות</h2>
        <div className="grid gap-6">
          {EXAMPLE_POST.comments?.map((comment) => (
            <Card key={comment.id} className="p-4">
              <div className="flex items-start gap-4">
                <Image
                  src={comment.author.avatar}
                  alt={comment.author.name}
                  width={32}
                  height={32}
                  className="rounded-full"
                />
                <div>
                  <div className="flex items-center gap-2 text-sm mb-2">
                    <span className="font-medium">{comment.author.name}</span>
                    <span className="text-muted-foreground">
                      {formatDate(comment.createdAt)}
                    </span>
                  </div>
                  <p>{comment.content}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">הוספת תגובה</h2>
        <div className="grid gap-4">
          <Textarea
            placeholder="כתבו את תגובתכם כאן..."
            className="min-h-[120px]"
          />
          <div className="flex justify-end">
            <Button>שליחת תגובה</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
