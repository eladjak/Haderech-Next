import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { UserPlus } from 'lucide-react'
import type { User } from '@/types/api'

interface UserCardProps {
  user: User
  onFollow?: (userId: string) => void
  className?: string
}

export function UserCard({ user, onFollow, className }: UserCardProps) {
  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center gap-4">
        <Avatar className="h-12 w-12">
          <AvatarImage src={user.avatar_url} />
          <AvatarFallback>{user.name[0]}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="font-semibold">{user.name}</div>
          <div className="text-sm text-muted-foreground">
            {user.bio?.slice(0, 100)}...
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
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4 text-center text-sm">
          <div>
            <div className="font-semibold">קורסים</div>
            <div className="text-muted-foreground">0</div>
          </div>
          <div>
            <div className="font-semibold">עוקבים</div>
            <div className="text-muted-foreground">0</div>
          </div>
          <div>
            <div className="font-semibold">הישגים</div>
            <div className="text-muted-foreground">0</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 