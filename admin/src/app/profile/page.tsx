"use client";

import * as React from "react";
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
import { toast } from "@/components/ui/toast";
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
  Save,
  Camera,
  Trash2,
  RotateCcw,
  Shield,
  Layers,
  MapPin,
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

  const [activeTab, setActiveTab] = React.useState<"identity" | "security" | "sessions" | "notifications">("identity");
  const [showCurrentPassword, setShowCurrentPassword] = React.useState(false);
  const [showNewPassword, setShowNewPassword] = React.useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = React.useState(false);

  const fileInputRef = React.useRef<HTMLInputElement>(null);

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

  const handleAvatarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Invalid File", "Please upload a valid image (JPG, PNG, WebP).");
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      toast.error("File Too Large", "Profile avatar must be under 8MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        detailsForm.setValue("avatarUrl", result, { shouldDirty: true, shouldValidate: true });
        updateProfile({
          ...detailsForm.getValues(),
          avatarUrl: result,
        });
        toast.success("Avatar Updated", "New executive portrait photo loaded.");
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveAvatar = () => {
    detailsForm.setValue("avatarUrl", "", { shouldDirty: true, shouldValidate: true });
    updateProfile({
      ...detailsForm.getValues(),
      avatarUrl: "",
    });
    toast.info("Avatar Removed", "Default studio monogram avatar restored.");
  };

  const currentAvatarUrl = detailsForm.watch("avatarUrl") || profile.avatarUrl;

  return (
    <AdminShell>
      <div className="w-full space-y-4 min-w-0">
        {/* Page Header */}
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
            <p className="text-xs text-muted-foreground font-mono">
              PARIS ATELIER & NEW YORK STUDIO • ZERO-DELETE ENFORCED
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className="text-xs font-mono uppercase tracking-wider px-2.5 py-1 border-emerald-500/40 text-emerald-500 bg-emerald-500/10 flex items-center gap-1.5"
            >
              <span className="size-1.5 rounded-full bg-emerald-500 inline-block animate-pulse" />
              Verified Studio Session
            </Badge>
          </div>
        </div>

        {/* 2-Column Responsive Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
          {/* Left Column: Executive Identity Card & Vertical Navigation */}
          <div className="lg:col-span-4 xl:col-span-3 space-y-3">
            {/* Identity Card */}
            <Card className="border border-border rounded-xs bg-background p-4 space-y-4">
              {/* Avatar with Luxury Hover Camera Action */}
              <div className="flex flex-col items-center text-center space-y-3">
                <div className="relative size-28 sm:size-32 rounded-xs border border-border overflow-hidden bg-muted/20 group">
                  {currentAvatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={currentAvatarUrl}
                      alt={`${profile.firstName} ${profile.lastName}`}
                      className="size-full object-cover"
                    />
                  ) : (
                    <div className="size-full flex items-center justify-center text-muted-foreground bg-muted/10 font-mono text-2xl font-semibold">
                      {profile.firstName[0]}
                      {profile.lastName[0]}
                    </div>
                  )}

                  {/* Hover Camera Overlay */}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute inset-0 bg-background/80 backdrop-blur-xs flex flex-col items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-foreground"
                    title="Change Profile Photo"
                  >
                    <Camera className="size-5" />
                    <span className="text-[11px] font-medium uppercase tracking-wider">
                      Change Photo
                    </span>
                  </button>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarFileChange}
                    className="hidden"
                  />
                </div>

                <div className="space-y-1">
                  <h2 className="text-base font-semibold text-foreground">
                    {profile.firstName} {profile.lastName}
                  </h2>
                  <p className="text-xs font-mono text-muted-foreground">
                    {profile.role}
                  </p>
                  <p className="text-xs text-muted-foreground font-mono truncate max-w-[220px]">
                    {profile.email}
                  </p>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <Button
                    type="button"
                    variant="outline"
                    size="xs"
                    onClick={() => fileInputRef.current?.click()}
                    className="h-7 text-xs px-2.5 border-border gap-1"
                  >
                    <Camera className="size-3" /> Upload
                  </Button>
                  {currentAvatarUrl && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="xs"
                      onClick={handleRemoveAvatar}
                      className="h-7 text-xs px-2 text-destructive hover:bg-destructive/10 gap-1"
                      title="Remove Avatar"
                    >
                      <Trash2 className="size-3" /> Remove
                    </Button>
                  )}
                </div>
              </div>

              {/* Quick Meta Info */}
              <div className="border-t border-border/80 pt-3 space-y-2 text-xs font-mono text-muted-foreground">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Shield className="size-3" /> Authority
                  </span>
                  <span className="text-foreground font-semibold">Root Superuser</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <ShieldCheck className="size-3" /> Security
                  </span>
                  <Badge
                    variant="outline"
                    className={`text-[11px] font-mono px-1.5 py-0 ${
                      profile.twoFactorEnabled
                        ? "border-emerald-500/40 text-emerald-500"
                        : "border-amber-500/40 text-amber-500"
                    }`}
                  >
                    {profile.twoFactorEnabled ? "2FA Active" : "Standard"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <MapPin className="size-3" /> Primary Node
                  </span>
                  <span className="text-foreground truncate max-w-[130px]">Paris Studio</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Laptop className="size-3" /> Workstations
                  </span>
                  <span className="text-foreground">{sessions.length} Active Nodes</span>
                </div>
              </div>
            </Card>

            {/* Vertical Section Switcher Navigation */}
            <Card className="border border-border rounded-xs bg-background p-1.5 space-y-1">
              <button
                type="button"
                onClick={() => setActiveTab("identity")}
                className={`w-full text-left p-2 rounded-xs text-xs flex items-center justify-between transition-colors ${
                  activeTab === "identity"
                    ? "bg-foreground text-background font-medium"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
                }`}
              >
                <div className="flex items-center gap-2">
                  <User className="size-3.5" />
                  <span>Identity & Personal Details</span>
                </div>
                <Sparkles className="size-3" />
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("security")}
                className={`w-full text-left p-2 rounded-xs text-xs flex items-center justify-between transition-colors ${
                  activeTab === "security"
                    ? "bg-foreground text-background font-medium"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
                }`}
              >
                <div className="flex items-center gap-2">
                  <KeyRound className="size-3.5" />
                  <span>Security & Credentials</span>
                </div>
                <Badge
                  variant="outline"
                  className={`text-[10px] font-mono px-1 py-0 ${
                    activeTab === "security"
                      ? "border-background/40 text-background"
                      : "border-emerald-500/40 text-emerald-500"
                  }`}
                >
                  2FA
                </Badge>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("sessions")}
                className={`w-full text-left p-2 rounded-xs text-xs flex items-center justify-between transition-colors ${
                  activeTab === "sessions"
                    ? "bg-foreground text-background font-medium"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
                }`}
              >
                <div className="flex items-center gap-2">
                  <Laptop className="size-3.5" />
                  <span>Active Workstations</span>
                </div>
                <Badge
                  variant="outline"
                  className={`text-[10px] font-mono px-1 py-0 ${
                    activeTab === "sessions"
                      ? "border-background/40 text-background"
                      : "border-border"
                  }`}
                >
                  {sessions.length}
                </Badge>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("notifications")}
                className={`w-full text-left p-2 rounded-xs text-xs flex items-center justify-between transition-colors ${
                  activeTab === "notifications"
                    ? "bg-foreground text-background font-medium"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
                }`}
              >
                <div className="flex items-center gap-2">
                  <BellRing className="size-3.5" />
                  <span>Notification Channels</span>
                </div>
                <Badge
                  variant="outline"
                  className={`text-[10px] font-mono px-1 py-0 ${
                    activeTab === "notifications"
                      ? "border-background/40 text-background"
                      : "border-border"
                  }`}
                >
                  5 Active
                </Badge>
              </button>
            </Card>
          </div>

          {/* Right Column: Main Content Area */}
          <div className="lg:col-span-8 xl:col-span-9 space-y-4">
            {/* Section 1: Identity & Personal Details */}
            {activeTab === "identity" && (
              <form onSubmit={detailsForm.handleSubmit(onSaveDetails)} className="space-y-4">
                <Card className="border border-border rounded-xs bg-background">
                  <CardHeader className="p-3.5 px-4 border-b border-border">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <User className="size-4 text-muted-foreground" />
                      <span>Executive Identity & Merchandising Profile</span>
                    </CardTitle>
                    <CardDescription className="text-xs text-muted-foreground">
                      Update your administrator name, direct contact numbers, primary hub location, and executive notes.
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
                      {/* Enterprise Email */}
                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center justify-between">
                          <span className="flex items-center gap-1.5">
                            <Mail className="size-3.5 text-muted-foreground" />
                            Enterprise Email *
                          </span>
                          <Badge variant="outline" className="text-[10px] font-mono border-emerald-500/40 text-emerald-500 px-1 py-0">
                            Verified
                          </Badge>
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
                        Executive Bio & Merchandising Scope
                      </Label>
                      <Textarea
                        placeholder="Directing catalog taxonomy, runway collections, SKU matrix distribution..."
                        className="text-xs min-h-[80px] resize-none"
                        {...detailsForm.register("bio")}
                      />
                    </div>

                    <div className="pt-3 border-t border-border/80 flex items-center justify-between">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => detailsForm.reset()}
                        className="h-8 text-xs px-3 border-border gap-1"
                      >
                        <RotateCcw className="size-3" /> Reset
                      </Button>

                      <Button
                        type="submit"
                        size="sm"
                        className="h-8 text-xs px-4 bg-foreground text-background hover:bg-foreground/90 font-medium gap-1.5"
                      >
                        <Save className="size-3.5" /> Save Changes
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </form>
            )}

            {/* Section 2: Security & Credentials */}
            {activeTab === "security" && (
              <div className="space-y-4">
                {/* 2FA Card */}
                <Card className="border border-border rounded-xs bg-background p-4 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="size-4 text-emerald-500" />
                        <h3 className="text-sm font-semibold text-foreground">
                          Two-Factor Authentication (2FA)
                        </h3>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed max-w-xl">
                        Enforce FIDO2 hardware security keys (YubiKey / Touch ID) or TOTP authenticator verification on every login session.
                      </p>
                    </div>
                    <Switch
                      checked={profile.twoFactorEnabled}
                      onCheckedChange={toggleTwoFactor}
                    />
                  </div>

                  <div className="border-t border-border/80 pt-2.5 flex items-center justify-between text-xs font-mono">
                    <span className="text-muted-foreground">Verification State:</span>
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

                {/* Password Update Card */}
                <Card className="border border-border rounded-xs bg-background">
                  <CardHeader className="p-3.5 px-4 border-b border-border">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <KeyRound className="size-4 text-muted-foreground" />
                      <span>Update Security Password</span>
                    </CardTitle>
                    <CardDescription className="text-xs text-muted-foreground">
                      Passwords must contain at least 8 characters, one uppercase letter, and one number.
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
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                      </div>

                      <div className="pt-2 flex justify-end">
                        <Button
                          type="submit"
                          size="sm"
                          disabled={isUpdatingPassword}
                          className="h-8 text-xs px-4"
                        >
                          {isUpdatingPassword ? "Updating..." : "Update Security Password"}
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Section 3: Active Workstations & Sessions */}
            {activeTab === "sessions" && (
              <Card className="border border-border rounded-xs bg-background">
                <CardHeader className="p-3.5 px-4 border-b border-border flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <Laptop className="size-4 text-muted-foreground" />
                      <span>Authorized Studio Workstations</span>
                    </CardTitle>
                    <CardDescription className="text-xs text-muted-foreground">
                      Active cryptographic sessions associated with your administrator credentials.
                    </CardDescription>
                  </div>
                  <Badge variant="outline" className="text-xs font-mono border-border">
                    {sessions.length} Active Nodes
                  </Badge>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-b border-border bg-background">
                          <TableHead className="h-9 text-xs">Workstation / Machine</TableHead>
                          <TableHead className="w-[140px] h-9 text-xs">IP Address</TableHead>
                          <TableHead className="w-[140px] h-9 text-xs">Node Location</TableHead>
                          <TableHead className="w-[160px] h-9 text-xs">Browser & OS</TableHead>
                          <TableHead className="w-[120px] h-9 text-xs">Last Activity</TableHead>
                          <TableHead className="w-[120px] text-right h-9 text-xs">Security Action</TableHead>
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
                                    Current
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
                                  Revoke Node
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
            )}

            {/* Section 4: Notification Channels */}
            {activeTab === "notifications" && (
              <Card className="border border-border rounded-xs bg-background">
                <CardHeader className="p-3.5 px-4 border-b border-border">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <BellRing className="size-4 text-muted-foreground" />
                    <span>Studio Notification Subscriptions</span>
                  </CardTitle>
                  <CardDescription className="text-xs text-muted-foreground">
                    Select which operational events trigger instant alerts and executive email digests.
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="divide-y divide-border/60">
                    {/* Daily Digest */}
                    <div className="flex items-center justify-between py-3">
                      <div className="space-y-0.5">
                        <Label className="text-sm font-medium text-foreground cursor-pointer">
                          Daily Executive Merchandising Digest
                        </Label>
                        <p className="text-xs text-muted-foreground">
                          Receive an automated daily summary of catalog modifications, SKU counts, and sales velocity.
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
                          Instant alert when warehouse shelves or boutique display racks drop below safe threshold levels.
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
                          Procurement & Supplier Inbound Shipments
                        </Label>
                        <p className="text-xs text-muted-foreground">
                          Alerts for purchase order status updates, fabric mill dispatches, and atelier deliveries.
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
                          Alerts when Root Categories, Subcategories, or Dynamic Attribute Sets are altered.
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
                          Security & Remote Sign-In Audits
                        </Label>
                        <p className="text-xs text-muted-foreground">
                          Immediate notification when an unrecognized workstation or IP connects to this studio account.
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
            )}
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
