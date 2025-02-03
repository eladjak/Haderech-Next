import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t py-6 md:py-0">
      <div className="container flex flex-col items-center gap-4 md:h-24 md:flex-row md:justify-between">
        <div className="flex flex-col items-center gap-4 px-8 md:flex-row md:gap-2 md:px-0">
          <p className="text-center text-sm leading-loose text-muted-foreground md:text-right">
            נבנה על ידי{" "}
            <Link
              href="https://haderech.co.il"
              target="_blank"
              rel="noreferrer"
              className="font-medium underline underline-offset-4"
            >
              הדרך
            </Link>
            . קוד פתוח על{" "}
            <Link
              href="https://github.com/haderech-co/haderech"
              target="_blank"
              rel="noreferrer"
              className="font-medium underline underline-offset-4"
            >
              GitHub
            </Link>
            .
          </p>
        </div>
        <div className="flex flex-col items-center gap-4 px-8 md:flex-row md:gap-2 md:px-0">
          <nav className="flex gap-4 text-sm text-muted-foreground">
            <Link href="/privacy">פרטיות</Link>
            <Link href="/terms">תנאי שימוש</Link>
            <Link href="/contact">צור קשר</Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
