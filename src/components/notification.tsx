import { Bell, Heart, MessageCircle, UserPlus } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { Notification as NotificationType } from "@/types/api";

interface NotificationProps {
  notification: NotificationType;
  className?: string;
}

export function Notification({ notification, className }: NotificationProps) {
  const icon = () => {
    switch (notification.type) {
      case "like":
        return <Heart className="h-4 w-4 text-primary" />;
      case "comment":
        return <MessageCircle className="h-4 w-4 text-primary" />;
      case "follow":
        return <UserPlus className="h-4 w-4 text-primary" />;
      case "mention":
        return <Bell className="h-4 w-4 text-primary" />;
      default:
        return <Bell className="h-4 w-4 text-primary" />;
    }
  };

  return (
    <div className={cn("flex items-start gap-4 rounded-lg p-4", className)}>
      <Avatar>
        <AvatarImage src={notification.user?.avatar_url || undefined} />
        <AvatarFallback>
          {notification.user?.name?.[0]?.toUpperCase() || "U"}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1">
        <div className="text-sm">{notification.content}</div>
        <div className="mt-1 text-xs text-muted-foreground">
          {new Date(notification.created_at).toLocaleDateString("he-IL", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </div>
      </div>
      <div className="flex-shrink-0">{icon()}</div>
    </div>
  );
}
