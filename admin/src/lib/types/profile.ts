export interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  studioHub: string;
  phone?: string;
  avatarUrl?: string;
  language: string;
  timezone: string;
  bio?: string;
  twoFactorEnabled: boolean;
  lastLogin: string;
  createdAt: string;
}

export interface UserSession {
  id: string;
  device: string;
  ipAddress: string;
  location: string;
  browser: string;
  isCurrent: boolean;
  lastActive: string;
}

export interface NotificationSettings {
  emailDigest: boolean;
  lowStockAlerts: boolean;
  supplierOrderUpdates: boolean;
  taxonomyChanges: boolean;
  securityAudits: boolean;
}
