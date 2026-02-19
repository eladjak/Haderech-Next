import { Header } from "@/components/layout/header";

export default function DashboardLoading() {
  return (
    <div className="min-h-dvh bg-white dark:bg-zinc-950">
      <Header />

      <main className="container mx-auto px-4 py-12">
        {/* Title */}
        <div className="mb-2 h-9 w-40 animate-pulse rounded-lg bg-zinc-100 dark:bg-zinc-800" />
        <div className="mb-8 h-4 w-56 animate-pulse rounded bg-zinc-100 dark:bg-zinc-800" />

        {/* Stats cards */}
        <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-28 animate-pulse rounded-2xl bg-zinc-100 dark:bg-zinc-800"
            />
          ))}
        </div>

        {/* Continue learning */}
        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          <div className="h-40 animate-pulse rounded-2xl bg-zinc-100 lg:col-span-2 dark:bg-zinc-800" />
          <div className="h-40 animate-pulse rounded-2xl bg-zinc-100 dark:bg-zinc-800" />
        </div>

        {/* Course cards */}
        <div className="mt-12">
          <div className="mb-6 h-7 w-32 animate-pulse rounded-lg bg-zinc-100 dark:bg-zinc-800" />
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-48 animate-pulse rounded-2xl bg-zinc-100 dark:bg-zinc-800"
              />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
