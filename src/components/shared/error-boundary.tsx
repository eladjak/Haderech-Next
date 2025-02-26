import { AlertTriangle } from "lucide-react";
import { useEffect } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

("use client");

interface ErrorBoundaryProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export function ErrorBoundary({ error, reset }: ErrorBoundaryProps) {
  useEffect(() => {
    console.error("Error:", error);
  }, [error]);

  return (
    <div className="flex h-[50vh] items-center justify-center">
      <Alert variant="destructive" className="max-w-2xl">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>שגיאה</AlertTitle>
        <AlertDescription className="mt-2 flex flex-col gap-4">
          <p>מצטערים, אך משהו השתבש. אנא נסו שוב מאוחר יותר.</p>
          <Button onClick={reset} variant="outline">
            נסה שוב
          </Button>
        </AlertDescription>
      </Alert>
    </div>
  );
}
