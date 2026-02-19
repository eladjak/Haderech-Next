import { Header } from "@/components/layout/header";

export default function CoursesLoading() {
  return (
    <div className="min-h-dvh bg-white dark:bg-zinc-950">
      <Header />

      <main className="container mx-auto px-4 py-12">
        {/* Title */}
        <div className="mb-8">
          <div className="mb-2 h-9 w-40 animate-pulse rounded-lg bg-zinc-100 dark:bg-zinc-800" />
          <div className="h-4 w-72 animate-pulse rounded bg-zinc-100 dark:bg-zinc-800" />
        </div>

        {/* Search bar */}
        <div className="mb-8">
          <div className="h-11 max-w-md animate-pulse rounded-xl bg-zinc-100 dark:bg-zinc-800" />
        </div>

        {/* Course grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="h-80 animate-pulse rounded-2xl bg-zinc-100 dark:bg-zinc-800"
            />
          ))}
        </div>
      </main>
    </div>
  );
}
