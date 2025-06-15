
import React, { useState } from "react";
import { Bell } from "lucide-react";
import { useNotifications, useMarkNotificationAsRead } from "@/hooks/useNotifications";

interface NotificationBellProps {
  userId: string | undefined;
}

function getRelativeTime(dateString: string): string {
  const now = Date.now();
  const then = new Date(dateString).getTime();
  const diff = Math.max(0, now - then);
  if (diff < 60000) return "just now";
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return new Date(dateString).toLocaleDateString();
}

export default function NotificationBell({ userId }: NotificationBellProps) {
  const [open, setOpen] = useState(false);
  const { data: notifications, isLoading } = useNotifications(userId, true);
  const markRead = useMarkNotificationAsRead();

  // Show badge if there are unread notifications
  const showBadge = (notifications?.length || 0) > 0;

  // Maximum 10 shown in dropdown
  const notificationList = notifications?.slice(0, 10) || [];

  function handleNotificationClick(ntf: any) {
    if (!ntf.id) return;

    markRead.mutate(ntf.id);

    // Simple navigation logic:
    if (ntf.task_id) {
      window.location.href = `/task/${ntf.task_id}`;
    } else {
      // Generic: go to messages or dashboard
      window.location.href = "/"; // TODO/INFO: adapt as needed
    }
    setOpen(false);
  }

  return (
    <div className="relative">
      <button
        className="relative p-2 rounded-full hover:bg-accent focus:outline-none transition"
        aria-label="Notifications"
        onClick={() => setOpen((o) => !o)}
      >
        <Bell className="h-6 w-6" />
        {showBadge && (
          <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5">
            {notifications?.length}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white shadow-lg rounded-lg border z-50">
          <div className="p-3 border-b font-medium text-sm">Notifications</div>
          <div className="max-h-80 overflow-y-auto">
            {isLoading && (
              <div className="p-4 text-center text-muted-foreground">Loading...</div>
            )}
            {!isLoading && notificationList.length === 0 && (
              <div className="p-4 text-center text-muted-foreground">No new notifications.</div>
            )}
            {notificationList.map((ntf) => (
              <button
                key={ntf.id}
                className="flex w-full text-left px-4 py-3 border-b last:border-b-0 hover:bg-accent focus:outline-none transition"
                onClick={() => handleNotificationClick(ntf)}
              >
                <div>
                  <div className="font-medium text-gray-800 text-sm">{ntf.content}</div>
                  <div className="text-xs text-gray-500">{getRelativeTime(ntf.created_at)}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
