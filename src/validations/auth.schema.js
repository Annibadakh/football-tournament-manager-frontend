import { z } from "zod";
import {
  emailField,
  fullNameField,
  otpField,
  passwordField,
  phoneField,
  withPasswordConfirmation,
} from "@/validations/user.schema";

export const loginSchema = z.object({
  email: emailField,
  password: z.string().min(1, "Password is required"),
});

export const signupSchema = withPasswordConfirmation(
  z.object({ fullName: fullNameField, email: emailField, password: passwordField }),
);

export const verifyAccountSchema = z.object({ otp: otpField, phone: phoneField });

export const forgotPasswordSchema = z.object({ email: emailField });

export const resetPasswordSchema = withPasswordConfirmation(
  z.object({ otp: otpField, newPassword: passwordField }),
  "newPassword",
);

export const acceptInviteSchema = withPasswordConfirmation(
  z.object({ fullName: fullNameField, password: passwordField, phone: phoneField }),
);
