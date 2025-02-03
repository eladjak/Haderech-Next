import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Notification } from '@/components/notification'
import type { Notification as NotificationType } from '@/types/api'

interface NotificationsProps {
  notifications: NotificationType[]
  className?: string
}

export function Notifications({ notifications, className }: NotificationsProps) {
  if (!notifications.length) {
    return null
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>התראות</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4">
        {notifications.map((notification) => (
          <Notification key={notification.id} notification={notification} />
        ))}
      </CardContent>
    </Card>
  )
} 