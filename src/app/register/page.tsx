import { Metadata } from "next";
import { RegisterContent } from "@/components/auth/register-content";
import { AuthProvider } from "@/providers/auth-provider";

export const metadata: Metadata = {
  title: "הרשמה",
  description: "צור חשבון חדש בהדרך",
};

export const dynamic = "force-dynamic";

function RegisterClientPage() {
  "use client";
  return (
    <AuthProvider>
      <RegisterContent />
    </AuthProvider>
  );
}

export default function RegisterPage() {
  return <RegisterClientPage />;
}
