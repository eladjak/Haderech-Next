import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Profile } from '@/types/models'

interface ProfileHeaderProps {
  profile: Profile
  isCurrentUser?: boolean
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
            <AvatarImage src={profile.avatar_url || undefined} />
            <AvatarFallback>{profile.full_name[0]}</AvatarFallback>
          </Avatar>
          <div className="space-y-1">
            <h2 className="text-2xl font-bold">{profile.full_name}</h2>
            <p className="text-sm text-muted-foreground">@{profile.username}</p>
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
  )
} 