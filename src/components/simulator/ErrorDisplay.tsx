import type { ReactElement } from "react";

import { AlertCircle } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

interface ErrorDisplayProps {
  error: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorDisplay({
  error,
  onRetry,
  className,
}: ErrorDisplayProps): ReactElement {
  return (
    <Alert variant="destructive" className={className}>
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>שגיאה</AlertTitle>
      <AlertDescription>{error}</AlertDescription>
      {onRetry && (
        <Button
          variant="outline"
          size="sm"
          onClick={onRetry}
          className="mt-2"
        >
          נסה שוב
        </Button>
      )}
    </Alert>
  );
} 