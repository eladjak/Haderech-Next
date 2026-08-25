"use client";

import { useEffect, useRef, type MouseEvent } from "react";

export function SkipLink() {
  const linkRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    linkRef.current?.setAttribute("data-hydrated", "true");
  }, []);

  const focusMainContent = (event: MouseEvent<HTMLAnchorElement>) => {
    const main = document.getElementById("main-content");
    if (!main) return;

    event.preventDefault();
    if (!main.hasAttribute("tabindex")) main.setAttribute("tabindex", "-1");
    window.history.replaceState(null, "", "#main-content");
    main.scrollIntoView({ block: "start" });
    main.focus({ preventScroll: true });

    // Auth/provider hydration can briefly return focus to the document body.
    // Restore it only when focus was lost, never after the user moved to a
    // different interactive control.
    window.setTimeout(() => {
      if (
        document.activeElement === document.body ||
        document.activeElement === document.documentElement ||
        document.activeElement === linkRef.current
      ) {
        main.focus({ preventScroll: true });
      }
    }, 250);
  };

  return (
    <a
      ref={linkRef}
      href="#main-content"
      onClick={focusMainContent}
      className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:start-4 focus:z-[100] focus:inline-flex focus:min-h-11 focus:items-center focus:rounded-lg focus:bg-brand-700 focus:px-4 focus:py-2 focus:font-semibold focus:text-white focus:shadow-lg"
    >
      דלג לתוכן הראשי
    </a>
  );
}
