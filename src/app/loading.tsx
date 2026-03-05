export default function Loading() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-background dark:bg-background">
      <div className="flex flex-col items-center gap-6">
        {/* Pulsing brand ring */}
        <div className="relative flex h-16 w-16 items-center justify-center">
          <span className="absolute h-full w-full animate-ping rounded-full bg-brand-400/30" />
          <span className="absolute h-full w-full animate-pulse rounded-full bg-brand-300/20" />
          <span className="relative h-10 w-10 rounded-full bg-gradient-to-bl from-brand-500 to-brand-600 shadow-lg shadow-brand-500/25" />
        </div>

        {/* Brand text */}
        <p className="text-xl font-bold bg-gradient-to-l from-brand-500 to-brand-600 bg-clip-text text-transparent">
          הדרך
        </p>

        <p className="text-sm text-blue-500/40 dark:text-zinc-500">
          טוען...
        </p>
      </div>
    </div>
  );
}
