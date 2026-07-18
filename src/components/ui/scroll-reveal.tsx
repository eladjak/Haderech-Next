"use client";

/**
 * ScrollReveal — wow-ui-standard principle 3 (bidirectional scroll choreography).
 *
 * Purely ADDITIVE, brand-agnostic. Wraps any block; on first paint the content is
 * fully VISIBLE (no-JS / crawler safe). Only after mount, if motion is allowed,
 * it hides the block and reveals it on scroll — fading out again when it leaves
 * through the TOP (bidirectional). Motion diet: transform + opacity only.
 *
 * Battle-tested rules (ported from ~/.claude/skills/wow-ui-standard/snippets/scroll-reveal.js):
 * - threshold:0 + rootMargin — NEVER threshold:0.15 (a tall mobile section would
 *   never reach 15% visibility and would stay stuck hidden).
 * - The base render ships VISIBLE; the hidden class is added at runtime only.
 * - Bidirectional (fade out through the top) ONLY when prefers-reduced-motion is off.
 *   Under RM nothing is armed at all — the block just stays visible.
 * - ONE module-level IntersectionObserver shared across every instance (no observer
 *   accumulation); each armed node reveals independently.
 *
 * CSS lives in globals.css (.wow-reveal / .in / .out-up + the reduced-motion belt),
 * distances/easing tuned to the HaDerekh brand.
 */

import { type ElementType, useEffect, useRef } from "react";

let sharedIO: IntersectionObserver | null = null;

function ensureObserver(): IntersectionObserver {
  if (sharedIO) return sharedIO;
  sharedIO = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        const el = entry.target;
        if (entry.isIntersecting) {
          el.classList.add("in");
          el.classList.remove("out-up");
        } else if (
          entry.boundingClientRect.top <
          (entry.rootBounds ? entry.rootBounds.top : 0)
        ) {
          // Left through the TOP -> fade upward.
          el.classList.remove("in");
          el.classList.add("out-up");
        } else {
          // Left through the BOTTOM -> reset to pre-entrance state.
          el.classList.remove("in", "out-up");
        }
      }
    },
    { threshold: 0, rootMargin: "0px 0px -10% 0px", root: null }
  );
  return sharedIO;
}

function prefersReducedMotion(): boolean {
  try {
    return !!(
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    );
  } catch {
    return false;
  }
}

type ScrollRevealProps = {
  children: React.ReactNode;
  className?: string;
  /** Optional stagger delay in ms (via inline transition-delay). */
  delay?: number;
  /** Render as a different element (default: div). */
  as?: ElementType;
};

export function ScrollReveal({
  children,
  className,
  delay,
  as,
}: ScrollRevealProps) {
  const ref = useRef<HTMLElement>(null);
  const Tag = (as ?? "div") as ElementType;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (prefersReducedMotion() || typeof IntersectionObserver === "undefined")
      return; // RM / no-IO belt: stays visible, never armed

    el.classList.add("wow-reveal");
    const io = ensureObserver();
    io.observe(el);

    return () => {
      io.unobserve(el);
      el.classList.remove("wow-reveal", "in", "out-up");
    };
  }, []);

  return (
    <Tag
      ref={ref}
      className={className}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </Tag>
  );
}
