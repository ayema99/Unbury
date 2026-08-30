/// <reference types="node" />
import { Email } from "@convex-dev/auth/providers/Email";
import { Resend as ResendAPI } from "resend";
import { generateRandomString, type RandomReader } from "@oslojs/crypto/random";

const random: RandomReader = {
  read(bytes) {
    const entropy = new Uint8Array(bytes.length);
    crypto.getRandomValues(entropy);
    bytes.set(entropy);
  },
};

const FROM = "unboxyourtax <onboarding@resend.dev>";
const CODE_TTL_SECONDS = 60 * 15;

function emailedOTP({
  id,
  subject,
  text,
}: {
  id: string;
  subject: string;
  text: (code: string) => string;
}) {
  return Email({
    id,
    apiKey: process.env.RESEND_API_KEY,
    maxAge: CODE_TTL_SECONDS,
    async generateVerificationToken() {
      return generateRandomString(random, "0123456789", 8);
    },
    async sendVerificationRequest({ identifier: email, provider, token }) {
      const apiKey = provider.apiKey;
      if (!apiKey) {
        throw new Error("RESEND_API_KEY is not set");
      }
      const { error } = await new ResendAPI(apiKey).emails.send({
        from: FROM,
        to: [email],
        subject,
        text: text(token),
      });
      if (error) {
        throw new Error(`Could not send email: ${JSON.stringify(error)}`);
      }
    },
  });
}

export const ResendOTP = emailedOTP({
  id: "resend-otp",
  subject: "Confirm your unboxyourtax account",
  text: (code) => `Your verification code is ${code}. It expires in 15 minutes.`,
});

export const ResendOTPPasswordReset = emailedOTP({
  id: "resend-otp-password-reset",
  subject: "Reset your unboxyourtax password",
  text: (code) =>
    `Your password reset code is ${code}. It expires in 15 minutes. ` +
    `If you didn't request this, you can ignore this email.`,
});
