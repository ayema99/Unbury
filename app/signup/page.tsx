import type { Metadata } from "next";
import AuthScreen from "@/components/AuthScreen";

export const metadata: Metadata = {
  title: "Sign up — Unbury",
};

export default function SignUpPage() {
  return <AuthScreen initialFlow="signUp" />;
}
