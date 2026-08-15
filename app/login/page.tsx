import type { Metadata } from "next";
import AuthScreen from "@/components/AuthScreen";

export const metadata: Metadata = {
  title: "Log in — unboxyourtax",
};

export default function LoginPage() {
  return <AuthScreen initialFlow="signIn" />;
}
