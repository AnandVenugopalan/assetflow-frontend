import api from "@/lib/api";

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
}

export const notificationService = {
  async getUnreadNotifications() {
    const response = await api.get<NotificationItem[]>("/notifications/unread");
    return response.data;
  },

  async getAllNotifications(limit = 20) {
    const response = await api.get<NotificationItem[]>(`/notifications?limit=${limit}`);
    return response.data;
  },

  async markAsRead(id: string) {
    await api.patch(`/notifications/${id}/read`, {});
  },

  async markAllAsRead() {
    await api.patch("/notifications/mark-all-read", {});
  },

  async deleteNotification(id: string) {
    await api.delete(`/notifications/${id}`);
  },

  async deleteAllNotifications() {
    await api.delete("/notifications");
  },
};
