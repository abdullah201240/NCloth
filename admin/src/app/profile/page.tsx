"use client";

import * as React from "react";
import Image from "next/image";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AdminShell } from "@/components/layout/admin-shell";
import { useProfile } from "@/lib/stores/profile-context";
import {
  profileDetailsSchema,
  passwordChangeSchema,
  type ProfileDetailsFormValues,
  type PasswordChangeFormValues,
} from "@/lib/validations/profile";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ImageUploader } from "@/components/ui/image-uploader";
import {
  User,
  ShieldCheck,
  KeyRound,
  BellRing,
  Laptop,
  Globe,
  Building2,
  Mail,
  Phone,
  Clock,
  Sparkles,
  CheckCircle2,
  Lock,
  Eye,
  EyeOff,
  LogOut,
  Save,
} from "lucide-react";

const STUDIO_HUBS = [
  "Paris Atelier & New York Studio",
  "Paris Central Atelier & Vault",
  "Dhaka Central Logistics Hub",
  "Manhattan SoHo Flagship Hub",
  "Milan Quadrilatero Distribution",
  "London New Bond Street Salon",
  "Tokyo Ginza Depot",
];

const TIMEZONES = [
  "Europe/Paris (UTC+1)",
  "Europe/London (UTC+0)",
  "America/New_York (UTC-5)",
  "Asia/Dhaka (UTC+6)",
  "Asia/Tokyo (UTC+9)",
];

const LANGUAGES = [
  { value: "en-US", label: "English (United States)" },
  { value: "en-GB", label: "English (United Kingdom)" },
  { value: "fr-FR", label: "Français (France)" },
  { value: "it-IT", label: "Italiano (Italy)" },
  { value: "ja-JP", label: "日本語 (Japan)" },
];

export default function ProfilePage() {
  const {
    profile,
    sessions,
    notifications,
    updateProfile,
    changePassword,
    toggleTwoFactor,
    terminateSession,
    updateNotifications,
  } = useProfile();

  const [activeTab, setActiveTab] = React.useState("identity");
  const [showCurrentPassword, setShowCurrentPassword] = React.useState(false);
  const [showNewPassword, setShowNewPassword] = React.useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = React.useState(false);

  // Profile Details Form
  const detailsForm = useForm<ProfileDetailsFormValues>({
    resolver: zodResolver(profileDetailsSchema),
    defaultValues: {
      firstName: profile.firstName,
      lastName: profile.lastName,
      email: profile.email,
      phone: profile.phone || "",
      studioHub: profile.studioHub,
      language: profile.language,
      timezone: profile.timezone,
      bio: profile.bio || "",
      avatarUrl: profile.avatarUrl || "",
    },
  });

  // Password Change Form
  const passwordForm = useForm<PasswordChangeFormValues>({
    resolver: zodResolver(passwordChangeSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  React.useEffect(() => {
    detailsForm.reset({
      firstName: profile.firstName,
      lastName: profile.lastName,
      email: profile.email,
      phone: profile.phone || "",
      studioHub: profile.studioHub,
      language: profile.language,
      timezone: profile.timezone,
      bio: profile.bio || "",
      avatarUrl: profile.avatarUrl || "",
    });
  }, [profile, detailsForm]);

  const onSaveDetails = (data: ProfileDetailsFormValues) => {
    updateProfile(data);
  };

  const onSavePassword = async (data: PasswordChangeFormValues) => {
    setIsUpdatingPassword(true);
    const success = await changePassword(data);
    setIsUpdatingPassword(false);
    if (success) {
      passwordForm.reset({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    }
  };

  return (
    <AdminShell>
      <div className="w-full space-y-4 min-w-0">
        {/* Top Header Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-semibold tracking-tight text-foreground">
                Studio Administrator Profile
              </h1>
              <Badge variant="outline" className="text-xs font-mono border-border px-2 py-0.5">
                Master Authority
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              Manage personal identity, security credentials, active workstation sessions, and system notifications.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className="text-xs font-mono uppercase tracking-wider px-2 py-1 border-emerald-500/40 text-emerald-500 bg-emerald-500/10 flex items-center gap-1.5"
            >
              <span className="size-1.5 rounded-full bg-emerald-500 inline-block animate-pulse" />
              Verified Studio Session
            </Badge>
          </div>
        </div>

        {/* 4 Minimalist Overview KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <Card className="p-3.5 border border-border rounded-xs bg-background">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-medium uppercase tracking-wider">Administrator</span>
              <User className="size-4" />
            </div>
            <div className="mt-2.5 flex items-baseline justify-between">
              <span className="text-base font-semibold text-foreground truncate">
                {profile.firstName} {profile.lastName}
              </span>
              <Badge variant="outline" className="text-[11px] font-mono border-border px-1.5 py-0">
                Root
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-1 font-mono truncate">
              {profile.email}
            </p>
          </Card>

          <Card className="p-3.5 border border-border rounded-xs bg-background">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-medium uppercase tracking-wider">Two-Factor Security</span>
              <ShieldCheck className="size-4" />
            </div>
            <div className="mt-2.5 flex items-baseline justify-between">
              <span className="text-2xl font-light font-mono tabular-nums text-foreground">
                {profile.twoFactorEnabled ? "Enforced" : "Disabled"}
              </span>
              <Badge
                variant="outline"
                className={`text-xs font-mono ${
                  profile.twoFactorEnabled
                    ? "border-emerald-500/40 text-emerald-500"
                    : "border-amber-500/40 text-amber-500"
                }`}
              >
                {profile.twoFactorEnabled ? "Hardware 2FA" : "Standard"}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-1 font-mono">
              256-bit TLS Session Guard
            </p>
          </Card>

          <Card className="p-3.5 border border-border rounded-xs bg-background">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-medium uppercase tracking-wider">Active Workstations</span>
              <Laptop className="size-4" />
            </div>
            <div className="mt-2.5 flex items-baseline justify-between">
              <span className="text-2xl font-light font-mono tabular-nums text-foreground">
                {sessions.length}
              </span>
              <span className="text-xs font-mono text-emerald-600 font-medium">
                1 Current Device
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1 font-mono">
              Paris & New York Nodes
            </p>
          </Card>

          <Card className="p-3.5 border border-border rounded-xs bg-background">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-medium uppercase tracking-wider">Studio Node</span>
              <Building2 className="size-4" />
            </div>
            <div className="mt-2.5 flex items-baseline justify-between">
              <span className="text-sm font-semibold text-foreground truncate">
                Paris Atelier
              </span>
              <Badge variant="outline" className="text-[11px] font-mono border-border px-1.5 py-0">
                Primary
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-1 font-mono truncate">
              {profile.timezone}
            </p>
          </Card>
        </div>

        {/* Profile Tabs Navigation */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full space-y-4">
          <TabsList className="h-9 p-0.5 bg-background border border-border rounded-xs flex w-full max-w-md">
            <TabsTrigger
              value="identity"
              className="flex-1 text-xs data-[state=active]:bg-foreground data-[state=active]:text-background rounded-xs transition-all gap-1.5"
            >
              <User className="size-3.5" /> Identity & Details
            </TabsTrigger>
            <TabsTrigger
              value="security"
              className="flex-1 text-xs data-[state=active]:bg-foreground data-[state=active]:text-background rounded-xs transition-all gap-1.5"
            >
              <KeyRound className="size-3.5" /> Security & 2FA
            </TabsTrigger>
            <TabsTrigger
              value="notifications"
              className="flex-1 text-xs data-[state=active]:bg-foreground data-[state=active]:text-background rounded-xs transition-all gap-1.5"
            >
              <BellRing className="size-3.5" /> Preferences
            </TabsTrigger>
          </TabsList>

          {/* Tab 1: Personal & Studio Identity */}
          <TabsContent value="identity" className="space-y-4 mt-0">
            <form onSubmit={detailsForm.handleSubmit(onSaveDetails)} className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Left Card: Avatar & Role Summary */}
                <Card className="lg:col-span-1 border border-border rounded-xs bg-background p-4 flex flex-col items-center text-center space-y-4">
                  <div className="space-y-2 w-full flex flex-col items-center">
                    <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Studio Avatar Photography
                    </Label>
                    <Controller
                      name="avatarUrl"
                      control={detailsForm.control}
                      render={({ field }) => (
                        <ImageUploader
                          value={field.value}
                          onChange={(url) => field.onChange(url)}
                          label="Upload Avatar"
                          description="Square portrait ratio (PNG, WebP, JPG)"
                          aspectRatio="square"
                          className="w-40 h-40"
                        />
                      )}
                    />
                  </div>

                  <div className="space-y-1 w-full border-t border-border pt-3">
                    <h3 className="text-base font-semibold text-foreground">
                      {profile.firstName} {profile.lastName}
                    </h3>
                    <p className="text-xs font-mono text-muted-foreground">
                      {profile.role}
                    </p>
                    <div className="pt-2 flex justify-center">
                      <Badge variant="outline" className="text-xs font-mono border-border px-2 py-0.5">
                        <Sparkles className="size-3 mr-1 text-amber-500" />
                        SS26 Studio Admin
                      </Badge>
                    </div>
                  </div>

                  <div className="w-full text-xs text-muted-foreground font-mono border-t border-border/80 pt-3 space-y-1 text-left">
                    <div className="flex items-center justify-between">
                      <span>User ID:</span>
                      <strong className="text-foreground">{profile.id}</strong>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Authority Tier:</span>
                      <strong className="text-foreground">Superuser</strong>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Registered:</span>
                      <span>Sep 2025</span>
                    </div>
                  </div>
                </Card>

                {/* Right Card: Editable Details Form */}
                <Card className="lg:col-span-2 border border-border rounded-xs bg-background">
                  <CardHeader className="p-3.5 px-4 border-b border-border">
                    <CardTitle className="text-sm font-medium">Personal & Enterprise Credentials</CardTitle>
                    <CardDescription className="text-xs text-muted-foreground">
                      Update your administrator name, direct studio contact numbers, primary hub, and bio.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-4 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* First Name */}
                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          First Name *
                        </Label>
                        <Input
                          placeholder="e.g. Alexander"
                          className="h-8.5 text-sm"
                          {...detailsForm.register("firstName")}
                        />
                        {detailsForm.formState.errors.firstName && (
                          <p className="text-xs text-destructive font-medium">
                            {detailsForm.formState.errors.firstName.message}
                          </p>
                        )}
                      </div>

                      {/* Last Name */}
                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          Last Name *
                        </Label>
                        <Input
                          placeholder="e.g. Sterling"
                          className="h-8.5 text-sm"
                          {...detailsForm.register("lastName")}
                        />
                        {detailsForm.formState.errors.lastName && (
                          <p className="text-xs text-destructive font-medium">
                            {detailsForm.formState.errors.lastName.message}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* Email */}
                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                          <Mail className="size-3.5 text-muted-foreground" />
                          Enterprise Email *
                        </Label>
                        <Input
                          placeholder="alex@ncloth.studio"
                          className="h-8.5 text-sm font-mono"
                          {...detailsForm.register("email")}
                        />
                        {detailsForm.formState.errors.email && (
                          <p className="text-xs text-destructive font-medium">
                            {detailsForm.formState.errors.email.message}
                          </p>
                        )}
                      </div>

                      {/* Direct Phone */}
                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                          <Phone className="size-3.5 text-muted-foreground" />
                          Direct Phone (Optional)
                        </Label>
                        <Input
                          placeholder="+33 1 42 68 55 00"
                          className="h-8.5 text-sm font-mono"
                          {...detailsForm.register("phone")}
                        />
                        {detailsForm.formState.errors.phone && (
                          <p className="text-xs text-destructive font-medium">
                            {detailsForm.formState.errors.phone.message}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* Studio Hub */}
                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                          <Building2 className="size-3.5 text-muted-foreground" />
                          Primary Studio Hub *
                        </Label>
                        <Controller
                          name="studioHub"
                          control={detailsForm.control}
                          render={({ field }) => (
                            <Select value={field.value} onValueChange={field.onChange}>
                              <SelectTrigger className="h-8.5 text-sm w-full">
                                <SelectValue placeholder="Select Studio Hub" />
                              </SelectTrigger>
                              <SelectContent>
                                {STUDIO_HUBS.map((hub) => (
                                  <SelectItem key={hub} value={hub} className="text-sm">
                                    {hub}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                        />
                      </div>

                      {/* Timezone */}
                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                          <Clock className="size-3.5 text-muted-foreground" />
                          Operational Timezone *
                        </Label>
                        <Controller
                          name="timezone"
                          control={detailsForm.control}
                          render={({ field }) => (
                            <Select value={field.value} onValueChange={field.onChange}>
                              <SelectTrigger className="h-8.5 text-sm w-full">
                                <SelectValue placeholder="Select Timezone" />
                              </SelectTrigger>
                              <SelectContent>
                                {TIMEZONES.map((tz) => (
                                  <SelectItem key={tz} value={tz} className="text-sm">
                                    {tz}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                        />
                      </div>
                    </div>

                    {/* Language */}
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                        <Globe className="size-3.5 text-muted-foreground" />
                        Admin Interface Language
                      </Label>
                      <Controller
                        name="language"
                        control={detailsForm.control}
                        render={({ field }) => (
                          <Select value={field.value} onValueChange={field.onChange}>
                            <SelectTrigger className="h-8.5 text-sm w-full">
                              <SelectValue placeholder="Select Language" />
                            </SelectTrigger>
                            <SelectContent>
                              {LANGUAGES.map((lang) => (
                                <SelectItem key={lang.value} value={lang.value} className="text-sm">
                                  {lang.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      />
                    </div>

                    {/* Editorial Bio */}
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Executive Bio & Notes
                      </Label>
                      <Textarea
                        placeholder="Directing studio operations and collection rollouts..."
                        className="text-xs min-h-[80px] resize-none"
                        {...detailsForm.register("bio")}
                      />
                    </div>

                    <div className="pt-2 flex items-center justify-end">
                      <Button
                        type="submit"
                        size="sm"
                        className="h-8 text-xs px-4 bg-foreground text-background hover:bg-foreground/90 font-medium gap-1.5"
                      >
                        <Save className="size-3.5" /> Save Identity Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </form>
          </TabsContent>

          {/* Tab 2: Security & Credentials */}
          <TabsContent value="security" className="space-y-4 mt-0">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Password Update Card */}
              <Card className="border border-border rounded-xs bg-background">
                <CardHeader className="p-3.5 px-4 border-b border-border">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <KeyRound className="size-4 text-muted-foreground" />
                    <span>Update Security Password</span>
                  </CardTitle>
                  <CardDescription className="text-xs text-muted-foreground">
                    Enforce high-entropy security credentials (min 8 chars, uppercase, and numbers).
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-4">
                  <form onSubmit={passwordForm.handleSubmit(onSavePassword)} className="space-y-3.5">
                    {/* Current Password */}
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Current Password *
                      </Label>
                      <div className="relative">
                        <Lock className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                        <Input
                          type={showCurrentPassword ? "text" : "password"}
                          placeholder="••••••••••••"
                          className="pl-9 pr-9 text-sm h-8.5 font-mono"
                          {...passwordForm.register("currentPassword")}
                        />
                        <button
                          type="button"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-0.5"
                        >
                          {showCurrentPassword ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
                        </button>
                      </div>
                      {passwordForm.formState.errors.currentPassword && (
                        <p className="text-xs text-destructive font-medium">
                          {passwordForm.formState.errors.currentPassword.message}
                        </p>
                      )}
                    </div>

                    {/* New Password */}
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        New Security Password *
                      </Label>
                      <div className="relative">
                        <Lock className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                        <Input
                          type={showNewPassword ? "text" : "password"}
                          placeholder="••••••••••••"
                          className="pl-9 pr-9 text-sm h-8.5 font-mono"
                          {...passwordForm.register("newPassword")}
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-0.5"
                        >
                          {showNewPassword ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
                        </button>
                      </div>
                      {passwordForm.formState.errors.newPassword && (
                        <p className="text-xs text-destructive font-medium">
                          {passwordForm.formState.errors.newPassword.message}
                        </p>
                      )}
                    </div>

                    {/* Confirm Password */}
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Confirm New Password *
                      </Label>
                      <div className="relative">
                        <Lock className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                        <Input
                          type="password"
                          placeholder="••••••••••••"
                          className="pl-9 text-sm h-8.5 font-mono"
                          {...passwordForm.register("confirmPassword")}
                        />
                      </div>
                      {passwordForm.formState.errors.confirmPassword && (
                        <p className="text-xs text-destructive font-medium">
                          {passwordForm.formState.errors.confirmPassword.message}
                        </p>
                      )}
                    </div>

                    <div className="pt-2 flex justify-end">
                      <Button
                        type="submit"
                        size="sm"
                        disabled={isUpdatingPassword}
                        className="h-8 text-xs px-4"
                      >
                        {isUpdatingPassword ? "Saving..." : "Update Password"}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>

              {/* Two-Factor Authentication Card */}
              <div className="space-y-4">
                <Card className="border border-border rounded-xs bg-background p-4 space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="size-4 text-emerald-500" />
                        <h3 className="text-sm font-semibold text-foreground">
                          Two-Factor Authentication (2FA)
                        </h3>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        Enforce FIDO2 WebAuthn hardware security keys (YubiKey / Touch ID) or TOTP authenticator apps.
                      </p>
                    </div>
                    <Switch
                      checked={profile.twoFactorEnabled}
                      onCheckedChange={toggleTwoFactor}
                    />
                  </div>

                  <div className="border-t border-border/80 pt-3 flex items-center justify-between text-xs font-mono">
                    <span className="text-muted-foreground">Status:</span>
                    <Badge
                      variant="outline"
                      className={`text-xs uppercase font-mono px-2 py-0.5 ${
                        profile.twoFactorEnabled
                          ? "border-emerald-500/40 text-emerald-500 bg-emerald-500/10"
                          : "border-zinc-500/40 text-zinc-500"
                      }`}
                    >
                      {profile.twoFactorEnabled ? "Active & Enforced" : "Disabled"}
                    </Badge>
                  </div>
                </Card>

                {/* Security Audit Badge */}
                <Card className="border border-border rounded-xs bg-background p-4 space-y-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block">
                    Security Architecture Standard
                  </span>
                  <div className="text-xs text-muted-foreground space-y-1.5 font-mono">
                    <div className="flex items-center gap-2 text-foreground">
                      <CheckCircle2 className="size-3.5 text-emerald-500 shrink-0" />
                      <span>Zero-Delete Enforced Database Operations</span>
                    </div>
                    <div className="flex items-center gap-2 text-foreground">
                      <CheckCircle2 className="size-3.5 text-emerald-500 shrink-0" />
                      <span>100% Client & Server Zod Validation</span>
                    </div>
                    <div className="flex items-center gap-2 text-foreground">
                      <CheckCircle2 className="size-3.5 text-emerald-500 shrink-0" />
                      <span>Role-Based Access Control (RBAC)</span>
                    </div>
                  </div>
                </Card>
              </div>
            </div>

            {/* Active Sessions & Workstations Table */}
            <Card className="border border-border rounded-xs bg-background">
              <CardHeader className="p-3.5 px-4 border-b border-border flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-sm font-medium">Active Workstation Sessions</CardTitle>
                  <CardDescription className="text-xs text-muted-foreground">
                    Authorised devices connected to this administrator account.
                  </CardDescription>
                </div>
                <Badge variant="outline" className="text-xs font-mono border-border">
                  {sessions.length} Authorized Nodes
                </Badge>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-b border-border bg-background">
                        <TableHead className="h-9 text-xs">Workstation / Device</TableHead>
                        <TableHead className="w-[140px] h-9 text-xs">IP Address</TableHead>
                        <TableHead className="w-[140px] h-9 text-xs">Location</TableHead>
                        <TableHead className="w-[160px] h-9 text-xs">Browser & Platform</TableHead>
                        <TableHead className="w-[120px] h-9 text-xs">Last Active</TableHead>
                        <TableHead className="w-[120px] text-right h-9 text-xs">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sessions.map((sess) => (
                        <TableRow key={sess.id} className="border-b border-border/60 hover:bg-muted/30">
                          <TableCell className="py-2.5">
                            <div className="flex items-center gap-2">
                              <Laptop className="size-3.5 text-muted-foreground shrink-0" />
                              <span className="text-sm font-medium text-foreground">{sess.device}</span>
                              {sess.isCurrent && (
                                <Badge variant="outline" className="text-[10px] font-mono border-emerald-500/40 text-emerald-500 px-1 py-0">
                                  Current Device
                                </Badge>
                              )}
                            </div>
                          </TableCell>

                          <TableCell className="py-2.5 font-mono text-xs text-muted-foreground">
                            {sess.ipAddress}
                          </TableCell>

                          <TableCell className="py-2.5 text-xs text-foreground">
                            {sess.location}
                          </TableCell>

                          <TableCell className="py-2.5 text-xs text-muted-foreground">
                            {sess.browser}
                          </TableCell>

                          <TableCell className="py-2.5 font-mono text-xs text-muted-foreground">
                            {sess.lastActive}
                          </TableCell>

                          <TableCell className="text-right py-2.5">
                            {!sess.isCurrent && (
                              <Button
                                variant="outline"
                                size="xs"
                                onClick={() => terminateSession(sess.id)}
                                className="h-6.5 text-[11px] px-2 text-destructive border-destructive/30 hover:bg-destructive/10"
                              >
                                Revoke Session
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab 3: Preferences & Notifications */}
          <TabsContent value="notifications" className="space-y-4 mt-0">
            <Card className="border border-border rounded-xs bg-background">
              <CardHeader className="p-3.5 px-4 border-b border-border">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <BellRing className="size-4 text-muted-foreground" />
                  <span>Studio Notification Subscriptions</span>
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground">
                  Select which operational events trigger instant alerts and email digests.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 space-y-4">
                <div className="divide-y divide-border/60">
                  {/* Daily Digest */}
                  <div className="flex items-center justify-between py-3">
                    <div className="space-y-0.5">
                      <Label className="text-sm font-medium text-foreground cursor-pointer">
                        Daily Executive Merchandising Digest
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        Receive a daily summary of catalog modifications, SKU counts, and sales velocity.
                      </p>
                    </div>
                    <Switch
                      checked={notifications.emailDigest}
                      onCheckedChange={(checked) =>
                        updateNotifications({ emailDigest: checked })
                      }
                    />
                  </div>

                  {/* Low Stock Alerts */}
                  <div className="flex items-center justify-between py-3">
                    <div className="space-y-0.5">
                      <Label className="text-sm font-medium text-foreground cursor-pointer">
                        Low Stock & Inventory Threshold Alerts
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        Instant notification when warehouse shelves or boutique racks drop below safety thresholds.
                      </p>
                    </div>
                    <Switch
                      checked={notifications.lowStockAlerts}
                      onCheckedChange={(checked) =>
                        updateNotifications({ lowStockAlerts: checked })
                      }
                    />
                  </div>

                  {/* Supplier Order Updates */}
                  <div className="flex items-center justify-between py-3">
                    <div className="space-y-0.5">
                      <Label className="text-sm font-medium text-foreground cursor-pointer">
                        Procurement & Supplier Shipments
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        Alerts for inbound purchase orders, fabric mills, and atelier shipments.
                      </p>
                    </div>
                    <Switch
                      checked={notifications.supplierOrderUpdates}
                      onCheckedChange={(checked) =>
                        updateNotifications({ supplierOrderUpdates: checked })
                      }
                    />
                  </div>

                  {/* Taxonomy Changes */}
                  <div className="flex items-center justify-between py-3">
                    <div className="space-y-0.5">
                      <Label className="text-sm font-medium text-foreground cursor-pointer">
                        Taxonomy & Hierarchy Modifications
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        Notifications when Root Categories, Subcategories, or Dynamic Attributes are updated.
                      </p>
                    </div>
                    <Switch
                      checked={notifications.taxonomyChanges}
                      onCheckedChange={(checked) =>
                        updateNotifications({ taxonomyChanges: checked })
                      }
                    />
                  </div>

                  {/* Security Audits */}
                  <div className="flex items-center justify-between py-3">
                    <div className="space-y-0.5">
                      <Label className="text-sm font-medium text-foreground cursor-pointer">
                        Security & Login Audits
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        Immediate alert when a new workstation or unrecognized IP signs into the studio portal.
                      </p>
                    </div>
                    <Switch
                      checked={notifications.securityAudits}
                      onCheckedChange={(checked) =>
                        updateNotifications({ securityAudits: checked })
                      }
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminShell>
  );
}
