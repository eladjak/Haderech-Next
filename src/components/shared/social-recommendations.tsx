"use client"

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { UserPlus } from 'lucide-react'
import type { User } from '@/types/api'

interface SocialRecommendationsProps {
  users: User[]
  onFollow?: (userId: string) => void
}

export function SocialRecommendations({ users, onFollow }: SocialRecommendationsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>אנשים שאולי תרצה להכיר</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {users.map((user) => (
          <div key={user.id} className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarImage src={user.avatar_url} />
                <AvatarFallback>{user.name[0]}</AvatarFallback>
              </Avatar>
              <div>
                <div className="font-medium">{user.name}</div>
                <div className="text-sm text-muted-foreground">
                  {user.bio?.slice(0, 50)}...
                </div>
              </div>
            </div>
            {onFollow && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onFollow(user.id)}
              >
                <UserPlus className="h-4 w-4" />
              </Button>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  )
} 