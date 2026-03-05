"use client";

import Link from "next/link";

export function SearchButton() {
  return (
    <Link
      href="/search"
      className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-zinc-500 transition-colors hover:bg-brand-50 hover:text-brand-600 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white"
      aria-label="חיפוש"
    >
      <svg
        className="h-[18px] w-[18px]"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
        />
      </svg>
    </Link>
  );
}
