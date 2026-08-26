import { z } from "zod";

export const profileDetailsSchema = z.object({
  firstName: z
    .string()
    .trim()
    .min(2, "First name must be at least 2 characters")
    .max(50, "First name cannot exceed 50 characters"),
  lastName: z
    .string()
    .trim()
    .min(2, "Last name must be at least 2 characters")
    .max(50, "Last name cannot exceed 50 characters"),
  email: z
    .string()
    .trim()
    .email("Please enter a valid enterprise email address"),
  phone: z
    .string()
    .trim()
    .max(30, "Phone number cannot exceed 30 characters")
    .optional()
    .or(z.literal("")),
  studioHub: z
    .string()
    .trim()
    .min(1, "Please select your primary studio hub"),
  language: z
    .string()
    .trim()
    .min(1, "Please select interface language"),
  timezone: z
    .string()
    .trim()
    .min(1, "Please select your operational timezone"),
  bio: z
    .string()
    .trim()
    .max(300, "Bio cannot exceed 300 characters")
    .optional()
    .or(z.literal("")),
  avatarUrl: z
    .string()
    .trim()
    .optional()
    .or(z.literal("")),
});

export type ProfileDetailsFormValues = z.infer<typeof profileDetailsSchema>;

export const passwordChangeSchema = z
  .object({
    currentPassword: z
      .string()
      .min(1, "Current password is required"),
    newPassword: z
      .string()
      .min(8, "New password must be at least 8 characters")
      .max(64, "Password cannot exceed 64 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[0-9]/, "Password must contain at least one number"),
    confirmPassword: z
      .string()
      .min(1, "Please confirm your new password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type PasswordChangeFormValues = z.infer<typeof passwordChangeSchema>;
