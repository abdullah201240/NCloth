"use client";

import * as React from "react";
import { UserProfile, UserSession, NotificationSettings } from "@/lib/types/profile";
import { ProfileDetailsFormValues, PasswordChangeFormValues } from "@/lib/validations/profile";
import { toast } from "@/components/ui/toast";

interface ProfileContextType {
  profile: UserProfile;
  sessions: UserSession[];
  notifications: NotificationSettings;
  isAuthenticated: boolean;
  login: (email: string) => void;
  logout: () => void;
  updateProfile: (data: ProfileDetailsFormValues) => void;
  changePassword: (data: PasswordChangeFormValues) => Promise<boolean>;
  toggleTwoFactor: () => void;
  terminateSession: (sessionId: string) => void;
  updateNotifications: (settings: Partial<NotificationSettings>) => void;
}

const AUTH_STORAGE_KEY = "ncloth_auth_user_v1";
const PROFILE_STORAGE_KEY = "ncloth_studio_profile_v1";
const SESSIONS_STORAGE_KEY = "ncloth_studio_sessions_v1";
const NOTIFICATIONS_STORAGE_KEY = "ncloth_studio_notifications_v1";

const initialProfile: UserProfile = {
  id: "usr-alex-01",
  firstName: "Alexander",
  lastName: "Sterling",
  email: "alex@ncloth.studio",
  role: "Studio Master Administrator",
  studioHub: "Paris Atelier & New York Studio",
  phone: "+33 1 42 68 55 00",
  avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=400&auto=format&fit=crop",
  language: "en-US",
  timezone: "Europe/Paris (UTC+1)",
  bio: "Directing luxury catalog taxonomy, global SKU matrices, and multi-hub merchandising operations for SS26 collection.",
  twoFactorEnabled: true,
  lastLogin: "2026-02-26T18:30:00.000Z",
  createdAt: "2025-09-01T08:00:00.000Z",
};

const initialSessions: UserSession[] = [
  {
    id: "sess-01",
    device: "MacBook Pro 16″ (M3 Max)",
    ipAddress: "192.168.1.104",
    location: "Paris, France",
    browser: "Google Chrome 133 (macOS)",
    isCurrent: true,
    lastActive: "Just now",
  },
  {
    id: "sess-02",
    device: "Mac Studio (M2 Ultra)",
    ipAddress: "198.51.100.42",
    location: "New York, USA",
    browser: "Safari 18.2 (macOS)",
    isCurrent: false,
    lastActive: "Yesterday at 21:40",
  },
  {
    id: "sess-03",
    device: "iPad Pro 13″ (M4)",
    ipAddress: "203.0.113.19",
    location: "Milan, Italy",
    browser: "Mobile Safari (iPadOS)",
    isCurrent: false,
    lastActive: "3 days ago",
  },
];

const initialNotifications: NotificationSettings = {
  emailDigest: true,
  lowStockAlerts: true,
  supplierOrderUpdates: true,
  taxonomyChanges: true,
  securityAudits: true,
};

import { createSyncedStore } from "./create-synced-store";

const profileStore = createSyncedStore<UserProfile>(
  PROFILE_STORAGE_KEY,
  initialProfile
);
const sessionsStore = createSyncedStore<UserSession[]>(
  SESSIONS_STORAGE_KEY,
  initialSessions
);
const notificationsStore = createSyncedStore<NotificationSettings>(
  NOTIFICATIONS_STORAGE_KEY,
  initialNotifications
);

const authStore = createSyncedStore<string | null>(AUTH_STORAGE_KEY, "alex@ncloth.studio");

const ProfileContext = React.createContext<ProfileContextType | undefined>(undefined);

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = profileStore.useStore();
  const [sessions, setSessions] = sessionsStore.useStore();
  const [notifications, setNotifications] = notificationsStore.useStore();
  const [authUser, setAuthUser] = authStore.useStore();

  const isAuthenticated = Boolean(authUser);

  const login = React.useCallback((email: string) => {
    setAuthUser(email);
  }, [setAuthUser]);

  const logout = React.useCallback(() => {
    setAuthUser(null);
    toast.info("Session Closed", "You have been signed out from the studio admin.");
  }, [setAuthUser]);

  const updateProfile = React.useCallback((data: ProfileDetailsFormValues) => {
    setProfile((prev) => ({
      ...prev,
      firstName: data.firstName.trim(),
      lastName: data.lastName.trim(),
      email: data.email.trim(),
      phone: data.phone?.trim() || undefined,
      studioHub: data.studioHub.trim(),
      language: data.language,
      timezone: data.timezone,
      bio: data.bio?.trim() || undefined,
      avatarUrl: data.avatarUrl?.trim() || prev.avatarUrl,
    }));

    toast.success(
      "Profile Details Saved",
      "Studio administrator identity and preferences have been updated."
    );
  }, []);

  const changePassword = React.useCallback(async (data: PasswordChangeFormValues) => {
    // Simulate verification
    await new Promise((resolve) => setTimeout(resolve, 400));
    toast.success(
      "Password Updated",
      "Your studio security credentials have been updated successfully."
    );
    return true;
  }, []);

  const toggleTwoFactor = React.useCallback(() => {
    setProfile((prev) => {
      const nextState = !prev.twoFactorEnabled;
      if (nextState) {
        toast.success(
          "2FA Security Active",
          "Hardware key / authenticator verification enforced."
        );
      } else {
        toast.warning(
          "2FA Security Suspended",
          "Account is running with single-factor authentication."
        );
      }
      return {
        ...prev,
        twoFactorEnabled: nextState,
      };
    });
  }, []);

  const terminateSession = React.useCallback((sessionId: string) => {
    setSessions((prev) => prev.filter((s) => s.id !== sessionId));
    toast.info("Session Revoked", "Remote workstation access has been terminated.");
  }, []);

  const updateNotifications = React.useCallback((settings: Partial<NotificationSettings>) => {
    setNotifications((prev) => ({
      ...prev,
      ...settings,
    }));
    toast.success("Preferences Saved", "Studio notification channels updated.");
  }, []);

  return (
    <ProfileContext.Provider
      value={{
        profile,
        sessions,
        notifications,
        isAuthenticated,
        login,
        logout,
        updateProfile,
        changePassword,
        toggleTwoFactor,
        terminateSession,
        updateNotifications,
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  const context = React.useContext(ProfileContext);
  if (!context) {
    throw new Error("useProfile must be used within a ProfileProvider");
  }
  return context;
}
