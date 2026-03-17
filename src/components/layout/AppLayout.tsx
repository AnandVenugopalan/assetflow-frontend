import { ReactNode, useEffect, useMemo, useState } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { Bell, Search, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { notificationService, type NotificationItem } from "@/lib/notifications";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoadingNotifications, setIsLoadingNotifications] = useState(false);

  const notificationRouteMap = useMemo(
    () => ({
      PROCUREMENT_REQUEST: "/procurement",
      PROCUREMENT_APPROVED: "/procurement",
      PROCUREMENT_REJECTED: "/procurement",
      MAINTENANCE_REQUEST: "/maintenance",
      MAINTENANCE_APPROVED: "/maintenance",
      MAINTENANCE: "/maintenance",
      ALLOCATION_REQUEST: "/allocation",
      ASSET_ALLOCATED: "/my-assets",
      DISPOSAL_REQUEST: "/disposal",
      ASSET_REQUEST: "/requests",
      PROPERTY_REQUEST: "/properties",
      IT_ASSET_REQUEST: "/it-assets",
    }),
    [],
  );

  const getNotificationTarget = (notification: NotificationItem) => {
    return notificationRouteMap[notification.type as keyof typeof notificationRouteMap] ?? "/notifications";
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    if (Number.isNaN(date.getTime())) {
      return "";
    }

    return new Intl.DateTimeFormat(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(date);
  };

  const loadNotifications = async () => {
    try {
      setIsLoadingNotifications(true);
      const [unread, all] = await Promise.all([
        notificationService.getUnreadNotifications(),
        notificationService.getAllNotifications(20),
      ]);

      setUnreadCount(unread.length);
      setNotifications(all);
    } catch (error) {
      console.error("Failed to load notifications:", error);
    } finally {
      setIsLoadingNotifications(false);
    }
  };

  const handleNotificationClick = async (notification: NotificationItem) => {
    try {
      if (!notification.isRead) {
        await notificationService.markAsRead(notification.id);
      }
      navigate(getNotificationTarget(notification));
      await loadNotifications();
    } catch (error) {
      toast.error("Failed to open notification");
    }
  };

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await notificationService.markAsRead(notificationId);
      await loadNotifications();
    } catch (error) {
      toast.error("Failed to mark notification as read");
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      toast.success("All notifications marked as read");
      await loadNotifications();
    } catch (error) {
      toast.error("Failed to mark all notifications as read");
    }
  };

  const handleDeleteNotification = async (notificationId: string) => {
    try {
      await notificationService.deleteNotification(notificationId);
      await loadNotifications();
    } catch (error) {
      toast.error("Failed to delete notification");
    }
  };

  const handleDeleteAll = async () => {
    try {
      await notificationService.deleteAllNotifications();
      toast.success("All notifications deleted");
      await loadNotifications();
    } catch (error) {
      toast.error("Failed to delete all notifications");
    }
  };

  useEffect(() => {
    void loadNotifications();

    const intervalId = window.setInterval(() => {
      void loadNotifications();
    }, 30000);

    return () => window.clearInterval(intervalId);
  }, []);

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <div className="flex flex-1 flex-col">
          <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background/95 px-6 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <SidebarTrigger />
            <div className="flex flex-1 items-center gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search assets, requests, or documents..."
                  className="pl-9 bg-muted/50"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              >
                {theme === "dark" ? (
                  <Sun className="h-5 w-5" />
                ) : (
                  <Moon className="h-5 w-5" />
                )}
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative" aria-label="Notifications">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                      <span className="absolute -right-1 -top-1 min-w-5 rounded-full bg-destructive px-1.5 py-0.5 text-center text-[10px] font-semibold leading-none text-destructive-foreground">
                        {unreadCount > 99 ? "99+" : unreadCount}
                      </span>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-[360px] p-0">
                  <div className="flex items-center justify-between border-b px-3 py-2">
                    <div>
                      <p className="text-sm font-semibold">Notifications</p>
                      <p className="text-xs text-muted-foreground">{unreadCount} unread</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 text-xs"
                        onClick={() => void handleMarkAllAsRead()}
                        disabled={unreadCount === 0}
                      >
                        Mark all read
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => void handleDeleteAll()}
                        disabled={notifications.length === 0}
                        aria-label="Delete all notifications"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="max-h-[420px] overflow-y-auto">
                    {isLoadingNotifications && notifications.length === 0 ? (
                      <div className="px-3 py-6 text-center text-sm text-muted-foreground">Loading notifications...</div>
                    ) : notifications.length === 0 ? (
                      <div className="px-3 py-6 text-center text-sm text-muted-foreground">No notifications yet</div>
                    ) : (
                      notifications.map((notification, index) => (
                        <div key={notification.id}>
                          <button
                            type="button"
                            className="w-full px-3 py-3 text-left transition-colors hover:bg-accent"
                            onClick={() => void handleNotificationClick(notification)}
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                <p className="text-sm font-medium leading-5">{notification.title}</p>
                                <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{notification.message}</p>
                                <p className="mt-2 text-[11px] text-muted-foreground">{formatTimestamp(notification.createdAt)}</p>
                              </div>
                              {!notification.isRead && <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary" />}
                            </div>
                          </button>
                          <div className="flex items-center justify-end gap-1 px-3 pb-2">
                            {!notification.isRead && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 px-2 text-xs"
                                onClick={() => void handleMarkAsRead(notification.id)}
                              >
                                Mark as read
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 px-2 text-xs text-destructive hover:text-destructive"
                              onClick={() => void handleDeleteNotification(notification.id)}
                            >
                              Delete
                            </Button>
                          </div>
                          {index < notifications.length - 1 && <DropdownMenuSeparator />}
                        </div>
                      ))
                    )}
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>
          <main className="flex-1 overflow-auto p-6">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}
