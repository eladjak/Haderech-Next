'use client';

import { WifiOff } from 'lucide-react';

export default function OfflinePage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <WifiOff className="h-20 w-20 mx-auto text-muted-foreground mb-4" />
        <h1 className="text-3xl font-bold mb-2">אין חיבור לאינטרנט</h1>
        <p className="text-muted-foreground mb-6">
          נראה שאתה לא מחובר לאינטרנט. חלק מהתכנים עדיין זמינים במצב לא מקוון.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="bg-primary text-primary-foreground px-6 py-2 rounded-md"
        >
          נסה שוב
        </button>
      </div>
    </div>
  );
}
