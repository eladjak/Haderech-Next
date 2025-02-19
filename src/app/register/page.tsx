import React from "react";

import { Metadata } from "next";

import { RegisterContent } from "@/components/auth/register-content";

export const metadata: Metadata = {
  title: "הרשמה - הדרך",
  description: "צרו חשבון חדש בהדרך",
};

export default function RegisterPage(): React.ReactElement {
  return <RegisterContent />;
}
