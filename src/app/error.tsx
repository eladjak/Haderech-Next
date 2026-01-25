"use client";

import React from "react";
import { Button } from "@/components/ui/button";

export default function Error({
  _error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}): React.ReactElement {
  return (
    <div className="container flex h-screen flex-col items-center justify-center">
      <h2 className="text-2xl font-bold">משהו השתבש</h2>
      <p className="text-muted-foreground">אירעה שגיאה בטעינת העמוד</p>
      <Button className="mt-4" onClick={() => reset()}>
        נסו שוב
      </Button>
    </div>
  );
}
