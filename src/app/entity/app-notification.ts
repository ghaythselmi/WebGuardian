export interface AppNotification {
  id: number;
  type: 'website_down' | 'website_recovered' | string;
  title: string;
  message: string;
  websiteUrl: string;
  createdAt: string;
  read: boolean;
}

export interface NotificationFeed {
  notifications: AppNotification[];
  unreadCount: number;
}
