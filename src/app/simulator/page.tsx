import type { Metadata } from "next";
import React from "react";
import SimulatorClient from "./simulator-client";

export const metadata: Metadata = {
  title: "סימולטור שיחה",
  description: "תרגול שיחות בסביבה בטוחה ומבוקרת",
};

export default function SimulatorPage(): React.ReactNode {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 text-center">
        <h1 className="mb-4 text-4xl font-bold">סימולטור שיחה</h1>
        <p className="text-xl text-muted-foreground">
          תרגול שיחות בסביבה בטוחה ומבוקרת
        </p>
      </div>

      <div className="mx-auto max-w-4xl">
        <SimulatorClient />
      </div>
    </div>
  );
}
