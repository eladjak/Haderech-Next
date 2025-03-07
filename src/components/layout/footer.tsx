"use client";

import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t">
      <div className="container py-8">
        <div className="grid gap-8 lg:grid-cols-2">
          <div>
            <Link href="/" className="flex items-center space-x-2">
              <span className="inline-block font-bold">הדרך</span>
            </Link>
            <p className="mt-4 text-sm text-muted-foreground">
              נבנה באהבה על ידי צוות הדרך ❤️
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2 text-sm">
              <h3 className="font-semibold">משפטי</h3>
              <Link
                href="/privacy"
                className="text-muted-foreground transition-colors hover:text-primary"
              >
                מדיניות פרטיות
              </Link>
              <Link
                href="/terms"
                className="text-muted-foreground transition-colors hover:text-primary"
              >
                תנאי שימוש
              </Link>
            </div>
            <div className="grid gap-2 text-sm">
              <h3 className="font-semibold">צור קשר</h3>
              <Link
                href="/contact"
                className="text-muted-foreground transition-colors hover:text-primary"
              >
                צור קשר
              </Link>
              <Link
                href="/about"
                className="text-muted-foreground transition-colors hover:text-primary"
              >
                אודות
              </Link>
            </div>
          </div>
        </div>
        <div className="mt-8 border-t pt-8 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} הדרך. כל הזכויות שמורות.</p>
        </div>
      </div>
    </footer>
  );
}
