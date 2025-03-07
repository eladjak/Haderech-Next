import type { Metadata } from "next";
import React from "react";
import SimulatorClient from "./simulator-client";

export const metadata: Metadata = {
  title: "סימולטור | הדרך",
  description: "תרגלו תרחישי תקשורת בסביבה בטוחה",
};

export default function SimulatorPage() {
  return <SimulatorClient />;
}
