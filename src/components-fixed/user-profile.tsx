"use client";

import { Mail, UserPlus } from "lucide-react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { User } from "@/types/models";

// הגדרת טיפוס מותאם עבור פרופיל משתמש
interface UserProfile {
  id: string;
  name?: string;
  username?: string;
  avatar_url?: string;
  bio?: string;
  followers_count?: number;
  following_count?: number;
  posts_count?: number;
}

interface UserProfileProps {
  user: UserProfile;
  onFollow?: (userId: string) => void;
  className?: string;
}

export function UserProfile({ user, onFollow, className }: UserProfileProps) {
  return (
    <Card className={className}>
      <CardHeader className="text-center">
        <Avatar className="mx-auto h-24 w-24">
          <AvatarImage src={user.avatar_url || undefined} />
          <AvatarFallback>{user.name?.[0] || "U"}</AvatarFallback>
        </Avatar>
        <div className="mt-4">
          <div className="text-2xl font-bold">{user.name}</div>
          <div className="text-sm text-muted-foreground">@{user.username}</div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {user.bio && <div className="text-center text-sm">{user.bio}</div>}
        <div className="flex justify-center gap-4 text-sm text-muted-foreground">
          <div className="flex flex-col items-center">
            <span className="font-medium">{user.followers_count || 0}</span>
            <span>עוקבים</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="font-medium">{user.following_count || 0}</span>
            <span>עוקב</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="font-medium">{user.posts_count || 0}</span>
            <span>פוסטים</span>
          </div>
        </div>
        <div className="flex gap-2">
          {onFollow && (
            <Button
              onClick={() => onFollow(user.id)}
              variant="outline"
              size="sm"
              className="w-full"
            >
              <UserPlus className="mr-2 h-4 w-4" />
              עקוב
            </Button>
          )}
          <Button asChild variant="outline" size="sm" className="w-full">
            <Link href={`/messages/${user.id}`}>
              <Mail className="mr-2 h-4 w-4" />
              שלח הודעה
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
