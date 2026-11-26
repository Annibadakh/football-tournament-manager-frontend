import { z } from "zod";
import { USER_RULES } from "@/constants/user.constants";

// Frontend schemas give instant feedback; the API re-validates everything
export const emailField = z
  .string()
  .trim()
  .toLowerCase()
  .pipe(z.email("Enter a valid email address"));

export const fullNameField = z
  .string()
  .trim()
  .min(USER_RULES.FULL_NAME_MIN, "Full name is required")
  .max(
    USER_RULES.FULL_NAME_MAX,
    `Full name must be at most ${USER_RULES.FULL_NAME_MAX} characters`,
  );

export const passwordField = z
  .string()
  .min(USER_RULES.PASSWORD_MIN, `Password must be at least ${USER_RULES.PASSWORD_MIN} characters`)
  .max(USER_RULES.PASSWORD_MAX, `Password must be at most ${USER_RULES.PASSWORD_MAX} characters`)
  .regex(/[A-Za-z]/, "Password must contain a letter")
  .regex(/\d/, "Password must contain a number");

export const phoneField = z
  .string()
  .trim()
  .regex(USER_RULES.PHONE_REGEX, "Enter a valid 10-digit mobile number");

export const otpField = z
  .string()
  .trim()
  .regex(
    new RegExp(`^\\d{${USER_RULES.OTP_LENGTH}}$`),
    `Enter the ${USER_RULES.OTP_LENGTH}-digit code`,
  );

// Adds a "confirm password" field that must match
export const withPasswordConfirmation = (schema, passwordKey = "password") =>
  schema
    .extend({ confirmPassword: z.string().min(1, "Please confirm your password") })
    .refine((values) => values[passwordKey] === values.confirmPassword, {
      message: "Passwords don't match",
      path: ["confirmPassword"],
    });

export const profileSchema = z.object({
  fullName: fullNameField,
  dateOfBirth: z
    .string()
    .nullable()
    .refine((value) => !value || new Date(value) < new Date(), "Date of birth must be in the past"),
  gender: z.number().nullable(),
  city: z
    .string()
    .trim()
    .max(USER_RULES.CITY_MAX, `City must be at most ${USER_RULES.CITY_MAX} characters`),
  bio: z
    .string()
    .trim()
    .max(USER_RULES.BIO_MAX, `Bio must be at most ${USER_RULES.BIO_MAX} characters`),
});

export const changePasswordSchema = withPasswordConfirmation(
  z.object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: passwordField,
  }),
  "newPassword",
);

export const createStaffUserSchema = z.object({
  fullName: fullNameField,
  email: emailField,
  accountRole: z.number({ error: "Select a role" }),
});
