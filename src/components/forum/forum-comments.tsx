import { format } from "date-fns";
import { he } from "date-fns/locale";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ExtendedForumComment } from "@/types/forum";

interface ForumCommentsProps {
  comments: ExtendedForumComment[];
}

export function ForumComments({ comments }: ForumCommentsProps) {
  return (
    <div className="space-y-4">
      {comments.map((comment) => (
        <Card key={comment.id}>
          <CardHeader>
            <div className="flex items-center space-x-4 space-x-reverse">
              <Avatar className="h-8 w-8">
                <AvatarImage
                  src={
                    comment.author.avatar_url ||
                    comment.author.image ||
                    undefined
                  }
                  alt={`תמונת פרופיל של ${comment.author.name}`}
                />
                <AvatarFallback>
                  {comment.author.name?.charAt(0).toUpperCase() || "?"}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold">{comment.author.name}</p>
                <p className="text-sm text-muted-foreground">
                  {format(new Date(comment.created_at), "PP", { locale: he })}
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap">{comment.content}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
