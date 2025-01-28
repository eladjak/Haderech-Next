'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // אופציונלי: שליחת השגיאה לשירות ניטור
    console.error(error)
  }, [error])

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col items-center justify-center gap-4">
      <div className="space-y-4 text-center">
        <h2 className="text-2xl font-bold">אופס! משהו השתבש</h2>
        <p className="text-muted-foreground">
          אנחנו מצטערים, אבל נראה שהתרחשה שגיאה. אנא נסו שוב.
        </p>
      </div>
      <Button
        variant="outline"
        onClick={() => reset()}
      >
        נסו שוב
      </Button>
    </div>
  )
} 