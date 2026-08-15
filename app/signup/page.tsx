import type { Metadata } from "next";
import AuthScreen from "@/components/AuthScreen";

export const metadata: Metadata = {
  title: "Sign up — unboxyourtax",
};

export default function SignUpPage() {
  return <AuthScreen initialFlow="signUp" />;
}
