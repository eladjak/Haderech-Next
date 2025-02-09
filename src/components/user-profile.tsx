"use client";

import { UserPlus, Mail } from "lucide-react";
import Link from "next/link";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

import type { User } from "@/types/api";

interface UserProfileProps {
  user: User;
  onFollow?: (userId: string) => void;
  className?: string;
}

export function UserProfile({ user, onFollow, className }: UserProfileProps) {
  return (
    <Card className={className}>
      <CardHeader className="text-center">
        <Avatar className="mx-auto h-24 w-24">
          <AvatarImage src={user.avatar_url || undefined} />
          <AvatarFallback>{user.name[0]}</AvatarFallback>
        </Avatar>
        <div className="mt-4">
          <div className="text-2xl font-bold">{user.name}</div>
          {user.bio && (
            <div className="mt-2 text-muted-foreground">{user.bio}</div>
          )}
        </div>
        <div className="mt-4 flex justify-center gap-2">
          {onFollow && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onFollow(user.id)}
            >
              <UserPlus className="mr-2 h-4 w-4" />
              עקוב
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            asChild
          >
            <Link href={`mailto:${user.email}`}>
              <Mail className="mr-2 h-4 w-4" />
              שלח מייל
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold">0</div>
            <div className="text-sm text-muted-foreground">קורסים</div>
          </div>
          <div>
            <div className="text-2xl font-bold">0</div>
            <div className="text-sm text-muted-foreground">עוקבים</div>
          </div>
          <div>
            <div className="text-2xl font-bold">0</div>
            <div className="text-sm text-muted-foreground">הישגים</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
