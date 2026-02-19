import { Header } from "@/components/layout/header";

export default function Loading() {
  return (
    <div className="min-h-dvh bg-white dark:bg-zinc-950">
      <Header />

      <main className="container mx-auto px-4 py-12">
        <div className="mx-auto max-w-3xl">
          <div className="mb-6 h-8 w-48 animate-pulse rounded-lg bg-zinc-100 dark:bg-zinc-800" />
          <div className="mb-4 h-4 w-full animate-pulse rounded bg-zinc-100 dark:bg-zinc-800" />
          <div className="mb-4 h-4 w-3/4 animate-pulse rounded bg-zinc-100 dark:bg-zinc-800" />
          <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
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
