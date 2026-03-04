import { Header } from "@/components/layout/header";

export default function SimulatorLoading() {
  return (
    <div className="min-h-dvh bg-white dark:bg-zinc-950">
      <Header />

      <main className="container mx-auto px-4 py-12">
        <div className="mx-auto max-w-4xl">
          {/* Title */}
          <div className="mb-8">
            <div className="mb-2 h-9 w-48 animate-pulse rounded-lg bg-zinc-100 dark:bg-zinc-800" />
            <div className="h-4 w-80 animate-pulse rounded bg-zinc-100 dark:bg-zinc-800" />
          </div>

          {/* Scenario cards grid */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-64 animate-pulse rounded-2xl bg-zinc-100 dark:bg-zinc-800"
              />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
