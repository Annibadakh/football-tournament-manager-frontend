import { signupSchema, verifyAccountSchema } from "@/validations/auth.schema";
import { validateWithSchema } from "@/utils/form";

describe("auth schemas", () => {
  it("requires matching passwords on sign-up", () => {
    const result = validateWithSchema(signupSchema, {
      fullName: "Aniket B",
      email: "A@B.com",
      password: "Pass1234",
      confirmPassword: "Pass12345",
    });
    expect(result.errors).toEqual({ confirmPassword: "Passwords don't match" });
  });

  it("accepts a 6-digit code and a 10-digit Indian mobile", () => {
    expect(
      validateWithSchema(verifyAccountSchema, { otp: "123456", phone: "9876543210" }).isValid,
    ).toBe(true);
    expect(
      validateWithSchema(verifyAccountSchema, { otp: "12345", phone: "1234567890" }).errors,
    ).toEqual({
      otp: "Enter the 6-digit code",
      phone: "Enter a valid 10-digit mobile number",
    });
  });
});
