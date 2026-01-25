import Link from "next/link";
import { Button } from "@/components/ui/button";

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <div className="flex gap-6 md:gap-10">
          <Link
            href="/"
            className="flex items-center space-x-2"
            aria-label="דף הבית - חזרה לעמוד הראשי של הדרך"
          >
            <span className="inline-block font-bold">הדרך</span>
          </Link>
          <nav className="flex gap-6" aria-label="ניווט ראשי">
            <Link
              href="/courses"
              className="flex items-center text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
              aria-label="עמוד הקורסים - עבור לרשימת כל הקורסים"
            >
              קורסים
            </Link>
            <Link
              href="/forum"
              className="flex items-center text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
              aria-label="פורום הדיונים - עבור לפורום הקהילה"
            >
              פורום
            </Link>
            <Link
              href="/about"
              className="flex items-center text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
              aria-label="אודות - מידע על הפלטפורמה"
            >
              אודות
            </Link>
          </nav>
        </div>
        <div className="flex flex-1 items-center justify-end space-x-4">
          <nav className="flex items-center space-x-2" aria-label="ניווט משתמש">
            <Link href="/login" aria-label="התחברות למערכת">
              <Button variant="ghost">התחברות</Button>
            </Link>
            <Link href="/register" aria-label="הרשמה לפלטפורמה">
              <Button>הרשמה</Button>
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
