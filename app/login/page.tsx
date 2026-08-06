import type { Metadata } from "next";
import AuthScreen from "@/components/AuthScreen";

export const metadata: Metadata = {
  title: "Log in — Unbury",
};

export default function LoginPage() {
  return <AuthScreen initialFlow="signIn" />;
}
