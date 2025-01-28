import { Users } from "lucide-react"
import Link from "next/link"

import type { User } from "@/types/api"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface SocialRecommendationsProps {
  users: User[]
}

export function SocialRecommendations({ users }: SocialRecommendationsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>אנשים שאולי תרצה להכיר</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {users.map((user) => (
            <Link
              key={user.id}
              href={`/profile/${user.id}`}
              className="flex items-center gap-4 rounded-lg border p-4 hover:bg-muted/50"
            >
              <Avatar>
                <AvatarImage src={user.avatarUrl} />
                <AvatarFallback>
                  <Users className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-1">
                <h3 className="font-medium">{user.fullName}</h3>
                <p className="text-sm text-muted-foreground line-clamp-1">
                  {user.bio}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  )
} 