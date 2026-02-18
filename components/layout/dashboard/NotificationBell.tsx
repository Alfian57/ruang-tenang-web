"use client";

import { useState, useEffect, useCallback } from "react";
import { Bell, Check, CheckCheck, Heart, Star, Award, TrendingUp } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { notificationService } from "@/services/api/notification";
import { useAuthStore } from "@/store/authStore";
import type { Notification } from "@/types";

const POLL_INTERVAL = 30000; // 30 seconds

function getNotificationIcon(type: string) {
  switch (type) {
    case "heart":
      return <Heart className="w-4 h-4 text-red-500 fill-red-500" />;
    case "story_approved":
      return <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />;
    case "story_rejected":
      return <Star className="w-4 h-4 text-gray-400" />;
    case "badge_earned":
      return <Award className="w-4 h-4 text-purple-500" />;
    case "level_up":
      return <TrendingUp className="w-4 h-4 text-green-500" />;
    default:
      return <Bell className="w-4 h-4 text-gray-500" />;
  }
}

function timeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diff < 60) return "baru saja";
  if (diff < 3600) return `${Math.floor(diff / 60)}m lalu`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}j lalu`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}h lalu`;
  return date.toLocaleDateString("id-ID", { day: "numeric", month: "short" });
}

export function NotificationBell() {
  const { token } = useAuthStore();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  const fetchUnreadCount = useCallback(async () => {
    if (!token) return;
    try {
      const res = await notificationService.getUnreadCount(token);
      if (res.data) {
        setUnreadCount(res.data.unread_count);
      }
    } catch {
      // Silent fail
    }
  }, [token]);

  const fetchNotifications = useCallback(async () => {
    if (!token) return;
    try {
      const res = await notificationService.getNotifications(token, { limit: 10 });
      if (res.data?.notifications) {
        setNotifications(res.data.notifications);
        setUnreadCount(res.data.unread_count);
      }
    } catch {
      // Silent fail
    }
  }, [token]);

  // Poll for unread count
  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchUnreadCount]);

  // Fetch notifications when dropdown opens
  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen, fetchNotifications]);

  const handleMarkAsRead = async (notifId: string) => {
    if (!token) return;
    try {
      await notificationService.markAsRead(token, notifId);
      setNotifications((prev) =>
        prev.map((n) => (n.id === notifId ? { ...n, is_read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch {
      // Silent fail
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!token) return;
    try {
      await notificationService.markAllAsRead(token);
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch {
      // Silent fail
    }
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <button
          className="relative p-2 rounded-full hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-300"
          aria-label="Notifikasi"
        >
          <Bell className="w-5 h-5 text-gray-600" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 max-h-96 overflow-hidden p-0">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b bg-gradient-to-r from-purple-50 to-indigo-50">
          <h3 className="font-semibold text-sm text-gray-800">Notifikasi</h3>
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="flex items-center gap-1 text-xs text-purple-600 hover:text-purple-800 transition-colors"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              Tandai Semua
            </button>
          )}
        </div>

        {/* Notification List */}
        <div className="overflow-y-auto max-h-72">
          {notifications.length === 0 ? (
            <div className="py-8 text-center text-gray-400">
              <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Belum ada notifikasi</p>
            </div>
          ) : (
            notifications.map((notif) => (
              <div
                key={notif.id}
                className={`flex items-start gap-3 px-4 py-3 border-b last:border-b-0 transition-colors hover:bg-gray-50 ${
                  !notif.is_read ? "bg-purple-50/50" : ""
                }`}
              >
                <div className="mt-0.5 shrink-0">
                  {getNotificationIcon(notif.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm leading-snug ${!notif.is_read ? "font-semibold text-gray-900" : "text-gray-700"}`}>
                    {notif.title}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5 truncate">{notif.message}</p>
                  <p className="text-[10px] text-gray-400 mt-1">{timeAgo(notif.created_at)}</p>
                </div>
                {!notif.is_read && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleMarkAsRead(notif.id);
                    }}
                    className="mt-1 shrink-0 p-1 rounded-full hover:bg-purple-100 transition-colors"
                    title="Tandai sudah dibaca"
                  >
                    <Check className="w-3.5 h-3.5 text-purple-500" />
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
