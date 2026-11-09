import { z } from "zod";

export const phoneRegex = /^(\+?[1-9]\d{1,14}|[6-9]\d{9})$/;

export const signupSchema = z.object({
  fullName: z
    .string()
    .min(2, "Full name must be at least 2 characters")
    .max(100, "Full name too long"),
  email: z
    .string()
    .email("Please enter a valid email address")
    .toLowerCase()
    .trim(),
  phone: z
    .string()
    .trim()
    .refine((val) => phoneRegex.test(val.replace(/[\s-]/g, "")), {
      message: "Please enter a valid phone number (10 digits or E.164 with country code)",
    }),
  city: z
    .string()
    .min(2, "City name must be at least 2 characters")
    .max(100, "City name too long")
    .trim(),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(100, "Password is too long"),
  events: z
    .array(z.enum(["ST", "HCIE"]))
    .min(1, "Please select at least one HOSA event (ST or HCIE)"),
});

export type SignupInput = z.infer<typeof signupSchema>;

export const loginSchema = z.object({
  email: z
    .string()
    .email("Please enter a valid email address")
    .toLowerCase()
    .trim(),
  password: z.string().min(1, "Password is required"),
});

export type LoginInput = z.infer<typeof loginSchema>;

