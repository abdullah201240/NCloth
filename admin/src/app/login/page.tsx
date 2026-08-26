"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginFormValues } from "@/lib/validations/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { ModeToggle } from "@/components/mode-toggle";
import { toast } from "@/components/ui/toast";
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Loader2,
  CheckCircle2,
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [authSuccess, setAuthSuccess] = React.useState(false);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: true,
    },
  });

  const handleDemoFill = () => {
    form.setValue("email", "alex@ncloth.studio", { shouldValidate: true });
    form.setValue("password", "couture2026", { shouldValidate: true });
    form.setValue("rememberMe", true, { shouldValidate: true });
    toast.info("Demo Credentials Loaded", "Ready to sign in as Studio Administrator.");
  };

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    if (typeof window !== "undefined") {
      localStorage.setItem("ncloth_auth_user", data.email);
    }
    // Simulate secure authentication verification
    await new Promise((resolve) => setTimeout(resolve, 800));
    setIsLoading(false);
    setAuthSuccess(true);
    toast.success("Access Authorized", "Welcome back, Alexander S. (Studio Admin)");
    setTimeout(() => {
      router.push("/");
    }, 600);
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col lg:flex-row bg-background text-foreground">
      {/* Left Panel: Luxury High-Fashion Editorial Imagery (Desktop) */}
      <div className="relative hidden lg:flex lg:w-1/2 flex-col justify-between p-10 border-r border-border bg-background overflow-hidden">
        {/* Background Editorial Visual with Subtle Gradient Overlay */}
        <div className="absolute inset-0 z-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1600&auto=format&fit=crop"
            alt="NCloth Runway Editorial"
            className="size-full object-cover grayscale opacity-30 dark:opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-background/20" />
        </div>

        {/* Top Brand Monogram */}
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="font-mono text-base font-semibold tracking-widest text-foreground uppercase">
              N C L O T H
            </span>
            <span className="text-xs uppercase tracking-widest text-muted-foreground font-medium">
              Studio Operating System
            </span>
          </div>
          <Badge variant="outline" className="text-xs font-mono border-border bg-background/90 px-2 py-0.5">
            SS26 Live Edition
          </Badge>
        </div>

        {/* Center Quote & Collection Details */}
        <div className="relative z-10 space-y-4 max-w-lg">
          <Badge
            variant="outline"
            className="text-xs font-mono uppercase tracking-wider px-2 py-0.5 border-border bg-background/80"
          >
            <Sparkles className="size-3 mr-1 inline text-amber-500" />
            Couture Merchandising & Taxonomy
          </Badge>
          <blockquote className="text-2xl font-light tracking-tight text-foreground leading-relaxed">
            &ldquo;Precision is the foundation of luxury. Every silhouette, fabric matrix, and SKU prefix tells a coherent architectural story.&rdquo;
          </blockquote>
          <div className="flex items-center gap-3 pt-2 text-xs font-mono text-muted-foreground">
            <span>PARIS STUDIO • 48.8566° N</span>
            <span className="text-border">|</span>
            <span>NEW YORK • 40.7128° N</span>
          </div>
        </div>

        {/* Bottom System Status */}
        <div className="relative z-10 flex items-center justify-between text-xs font-mono text-muted-foreground border-t border-border/80 pt-4">
          <div className="flex items-center gap-2">
            <span className="size-2 rounded-full bg-emerald-500 inline-block" />
            <span>Encrypted Studio Gateway Active</span>
          </div>
          <span>Zero-Delete Enforced</span>
        </div>
      </div>

      {/* Right Panel: Authentication Card & Form */}
      <div className="flex-1 flex flex-col justify-between p-4 sm:p-8 lg:p-12 bg-background">
        {/* Top Header Toolbar */}
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2 lg:hidden">
            <span className="font-mono text-sm font-semibold tracking-widest text-foreground uppercase">
              N C L O T H
            </span>
            <span className="text-xs text-muted-foreground font-mono">Studio</span>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Badge variant="outline" className="text-xs font-mono border-border px-2 py-0.5 text-muted-foreground">
              v1.0.4
            </Badge>
            <ModeToggle />
          </div>
        </div>

        {/* Center Auth Form Container */}
        <div className="w-full max-w-md mx-auto my-auto space-y-6 py-6">
          <div className="space-y-1.5">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              Studio Sign In
            </h1>
            <p className="text-xs text-muted-foreground">
              Enter your enterprise credentials to access the NCloth merchandising and catalog portal.
            </p>
          </div>

          {/* Quick Demo 1-Click Fill Button */}
          <div className="border border-border p-3 rounded-xs bg-background flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-xs font-medium text-foreground block">
                Demo Administrator Access
              </span>
              <span className="text-[11px] font-mono text-muted-foreground">
                alex@ncloth.studio • Merchandising
              </span>
            </div>
            <Button
              type="button"
              variant="outline"
              size="xs"
              onClick={handleDemoFill}
              className="h-7 text-xs px-2.5 border-border"
            >
              Fill Demo Credentials
            </Button>
          </div>

          {/* Login Form */}
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Email Field */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Enterprise Email *
              </Label>
              <div className="relative">
                <Mail className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder="name@ncloth.studio"
                  className="pl-9 text-sm h-9 bg-background"
                  {...form.register("email")}
                  autoComplete="email"
                />
              </div>
              {form.formState.errors.email && (
                <p className="text-xs text-destructive font-medium">
                  {form.formState.errors.email.message}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Security Password *
                </Label>
                <button
                  type="button"
                  onClick={() => toast.info("Password Reset Requested", "Security instructions dispatched to your registered administrator email.")}
                  className="text-xs text-muted-foreground hover:text-foreground font-mono transition-colors"
                >
                  Forgot credentials?
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••••••"
                  className="pl-9 pr-9 text-sm h-9 font-mono bg-background"
                  {...form.register("password")}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-0.5"
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
                </button>
              </div>
              {form.formState.errors.password && (
                <p className="text-xs text-destructive font-medium">
                  {form.formState.errors.password.message}
                </p>
              )}
            </div>

            {/* Remember Me Checkbox */}
            <div className="flex items-center space-x-2 pt-1">
              <Controller
                name="rememberMe"
                control={form.control}
                render={({ field }) => (
                  <Checkbox
                    id="rememberMe"
                    checked={field.value}
                    onCheckedChange={(checked) => field.onChange(!!checked)}
                  />
                )}
              />
              <Label
                htmlFor="rememberMe"
                className="text-xs font-normal text-muted-foreground cursor-pointer"
              >
                Remember this workstation for 30 days
              </Label>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isLoading || authSuccess}
              className="w-full h-9 text-sm font-medium transition-all"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="size-4 animate-spin" />
                  Verifying Credentials...
                </span>
              ) : authSuccess ? (
                <span className="flex items-center gap-2 text-emerald-400">
                  <CheckCircle2 className="size-4" />
                  Authorized • Redirecting...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-1.5">
                  Sign In to Studio <ArrowRight className="size-4" />
                </span>
              )}
            </Button>
          </form>

          {/* Security Guarantee */}
          <div className="border-t border-border pt-4 text-center">
            <p className="text-xs text-muted-foreground flex items-center justify-center gap-1.5 font-mono">
              <ShieldCheck className="size-3.5 text-emerald-600 dark:text-emerald-400" />
              Role-Based Access Control • 256-Bit TLS Encryption
            </p>
          </div>
        </div>

        {/* Bottom Studio Signature */}
        <div className="w-full flex items-center justify-between text-xs font-mono text-muted-foreground pt-4 border-t border-border/60">
          <span>NCLOTH • ARCHIVE & COUTURE</span>
          <span>SYSTEM ID: 4892-PROD</span>
        </div>
      </div>
    </div>
  );
}
