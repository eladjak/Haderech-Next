import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bell, MessageSquare, Star, ThumbsUp, User } from "lucide-react";
import type { Notification } from "@/types/api";

interface NotificationProps {
  notification: Notification;
  className?: string;
}

export function Notification({ notification, className }: NotificationProps) {
  const getIcon = () => {
    switch (notification.type) {
      case "info":
        return <Bell className="h-4 w-4" />;
      case "success":
        return <Star className="h-4 w-4" />;
      case "warning":
        return <MessageSquare className="h-4 w-4" />;
      case "error":
        return <ThumbsUp className="h-4 w-4" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  return (
    <Card className={className}>
      <CardContent className="flex items-center gap-4 p-4">
        <Avatar>
          <AvatarImage src={notification.user?.avatar_url} />
          <AvatarFallback>
            {notification.user?.name?.[0] ?? <User className="h-4 w-4" />}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="font-medium">{notification.title}</div>
          <div className="mt-1 text-sm text-muted-foreground">
            {notification.content}
          </div>
          <div className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
            <span>{notification.user?.name ?? "משתמש אנונימי"}</span>
            <span>•</span>
            <span>
              {new Date(notification.created_at).toLocaleDateString("he-IL")}
            </span>
          </div>
        </div>
        <div className="text-muted-foreground">{getIcon()}</div>
      </CardContent>
    </Card>
  );
}
