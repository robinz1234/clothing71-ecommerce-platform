import { z } from "zod";

// ─────────────────────────────────────────────────────────────────────────────
// Feature flag: set NEXT_PUBLIC_PHONE_AUTH_ENABLED=true in .env.local once
// the Supabase project has an SMS provider (Twilio/Vonage) configured.
// Do NOT enable this without a real verified SMS provider — phone numbers
// will NOT be verified if this is forced on without the provider.
// ─────────────────────────────────────────────────────────────────────────────
export const PHONE_AUTH_ENABLED =
  process.env.NEXT_PUBLIC_PHONE_AUTH_ENABLED === "true";

/**
 * Normalise a Bangladeshi mobile number to E.164 format (+8801XXXXXXXXX).
 * Accepts:
 *  - 01XXXXXXXXX   (11 digits, starts with 01)
 *  - 8801XXXXXXXXX (13 digits)
 *  - +8801XXXXXXXXX (14 chars)
 * Valid prefixes: 011, 012, 013, 014, 015, 016, 017, 018, 019
 */
export function normalizeBDPhone(raw: string): string | null {
  const cleaned = raw.replace(/[\s\-().]/g, "");
  let local: string | null = null;

  if (/^\+8801[3-9]\d{8}$/.test(cleaned)) {
    local = cleaned.slice(1); // strip leading +
  } else if (/^8801[3-9]\d{8}$/.test(cleaned)) {
    local = cleaned;
  } else if (/^01[3-9]\d{8}$/.test(cleaned)) {
    local = `880${cleaned.slice(1)}`; // replace leading 0 with 880
  }

  if (!local) return null;
  return `+${local}`;
}

/**
 * Returns true if the string looks like a Bangladeshi mobile number
 * (before normalisation), so the UI can auto-switch to phone mode.
 */
export function looksLikePhone(value: string): boolean {
  const cleaned = value.replace(/[\s\-().+]/g, "");
  return /^(880)?01[3-9]\d{8}$/.test(cleaned);
}

export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address."),
  password: z.string().min(6, "Password must be at least 6 characters."),
});

export const phoneLoginSchema = z.object({
  phone: z.string().refine(
    (val) => normalizeBDPhone(val) !== null,
    "Please enter a valid Bangladeshi mobile number (e.g. 01700000000).",
  ),
  password: z.string().min(6, "Password must be at least 6 characters."),
});

export const phoneOtpRequestSchema = z.object({
  phone: z.string().refine(
    (val) => normalizeBDPhone(val) !== null,
    "Please enter a valid Bangladeshi mobile number.",
  ),
});

export const phoneOtpVerifySchema = z.object({
  phone: z.string(),
  token: z.string().min(4).max(8),
});

export const registerSchema = z
  .object({
    fullName: z.string().min(2, "Full name must be at least 2 characters."),
    email: z.string().email("Please enter a valid email address."),
    password: z.string().min(6, "Password must be at least 6 characters."),
    confirmPassword: z.string().min(6, "Confirm password is required."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

export const phoneRegisterSchema = z
  .object({
    fullName: z.string().min(2, "Full name must be at least 2 characters."),
    phone: z.string().refine(
      (val) => normalizeBDPhone(val) !== null,
      "Please enter a valid Bangladeshi mobile number (e.g. 01700000000).",
    ),
    password: z.string().min(6, "Password must be at least 6 characters."),
    confirmPassword: z.string().min(6, "Confirm password is required."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

export const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address."),
});

export const updatePasswordSchema = z
  .object({
    password: z.string().min(6, "Password must be at least 6 characters."),
    confirmPassword: z.string().min(6, "Confirm password is required."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

export const profileSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters."),
  phone: z
    .string()
    .optional()
    .refine((val) => !val || /^[0-9+\s-]{6,20}$/.test(val), {
      message: "Please enter a valid phone number.",
    }),
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type PhoneLoginFormData = z.infer<typeof phoneLoginSchema>;
export type PhoneOtpRequestFormData = z.infer<typeof phoneOtpRequestSchema>;
export type PhoneOtpVerifyFormData = z.infer<typeof phoneOtpVerifySchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type PhoneRegisterFormData = z.infer<typeof phoneRegisterSchema>;
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;
export type UpdatePasswordFormData = z.infer<typeof updatePasswordSchema>;
export type ProfileFormData = z.infer<typeof profileSchema>;
