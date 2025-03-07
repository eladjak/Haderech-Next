"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// הגדרת ממשק Profile ישירות
interface Profile {
  name: string;
  avatarUrl?: string;
  joinDate?: string;
  level?: number;
  bio?: string;
}

interface ProfileHeaderProps {
  profile: Profile;
  isCurrentUser?: boolean;
}

export function ProfileHeader({ profile, isCurrentUser }: ProfileHeaderProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>פרופיל</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center space-x-4 rtl:space-x-reverse">
          <Avatar className="h-20 w-20">
            <AvatarImage src={profile.avatarUrl || undefined} />
            <AvatarFallback>
              {profile.name?.[0] || profile.name[0]}
            </AvatarFallback>
          </Avatar>
          <div className="space-y-1">
            <h2 className="text-2xl font-bold">{profile.name}</h2>
            <p className="text-sm text-muted-foreground">@{profile.name}</p>
            {profile.bio && (
              <p className="text-sm text-muted-foreground">{profile.bio}</p>
            )}
            {isCurrentUser && (
              <Button variant="outline" size="sm">
                ערוך פרופיל
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
