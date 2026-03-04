import { Header } from "@/components/layout/header";

export default function ChatLoading() {
  return (
    <div className="min-h-dvh bg-white dark:bg-zinc-950">
      <Header />

      <main className="container mx-auto px-4 py-12">
        <div className="grid gap-6 lg:grid-cols-4">
          {/* Sidebar skeleton */}
          <div className="lg:col-span-1">
            <div className="mb-4 h-10 w-full animate-pulse rounded-lg bg-zinc-100 dark:bg-zinc-800" />
            <div className="space-y-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="h-12 w-full animate-pulse rounded-lg bg-zinc-100 dark:bg-zinc-800"
                />
              ))}
            </div>
          </div>

          {/* Chat area skeleton */}
          <div className="lg:col-span-3">
            {/* Messages area */}
            <div className="mb-6 space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex gap-3">
                  <div className="h-10 w-10 flex-shrink-0 animate-pulse rounded-full bg-zinc-100 dark:bg-zinc-800" />
                  <div className="flex-1">
                    <div className="mb-2 h-4 w-32 animate-pulse rounded bg-zinc-100 dark:bg-zinc-800" />
                    <div className="h-4 w-3/4 animate-pulse rounded bg-zinc-100 dark:bg-zinc-800" />
                  </div>
                </div>
              ))}
            </div>

            {/* Input area */}
            <div className="mt-auto">
              <div className="h-12 w-full animate-pulse rounded-lg bg-zinc-100 dark:bg-zinc-800" />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
