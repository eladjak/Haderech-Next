"use client";

/**
 * CountUp — wow-ui-standard principle 13 (Elad's signature "the number is the star").
 *
 * Purely ADDITIVE, brand-agnostic. Animates a number from 0 up to the value that
 * is ALREADY rendered as children, then restores the EXACT original string
 * byte-for-byte — never leaves a rounded/reformatted value behind.
 *
 * Battle-tested rules (ported from ~/.claude/skills/wow-ui-standard/snippets/count-up.js):
 * - The target is parsed from the element's OWN rendered text, so the markup
 *   stays the single source of truth (works with prefixes, "%"/"+"/" MW" suffixes,
 *   thousands separators, decimals). Non-numeric strings (e.g. "חינם") pass through
 *   untouched — the component just renders them.
 * - Under prefers-reduced-motion: skipped entirely; the original value stays.
 * - Plays once per element, on first entry to the viewport (threshold:0 + rootMargin
 *   — the mobile-safe IO settings; a tall section never gets stuck un-revealed).
 * - No IntersectionObserver support -> the value simply stays put.
 *
 * Usage:  <CountUp>1000+</CountUp>   <CountUp>95%</CountUp>   <CountUp>₪149</CountUp>
 * Numbers should sit on tabular-nums so columns don't dance while counting.
 */

import { useEffect, useRef } from "react";

const DURATION = 1200; // ms — fast, matches Elad's portfolio effect

// Grouping chars: comma, NBSP ( ), narrow NBSP ( ). Plain ASCII space is
// deliberately excluded — it would merge two adjacent numbers into one.
const NUMBER_RE = /-?[\d,  ]*\d(?:\.\d+)?/;
const GROUPING_RE = /[,  ]/g;

type ParsedValue = {
  num: number;
  decimals: number;
  prefix: string;
  suffix: string;
  grouped: boolean;
};

function parseValue(text: string): ParsedValue | null {
  const m = text.match(NUMBER_RE);
  if (!m || m.index === undefined) return null;
  const raw = m[0];
  const stripped = raw.replace(GROUPING_RE, "");
  const num = Number.parseFloat(stripped);
  if (Number.isNaN(num)) return null;
  return {
    num,
    decimals: (raw.split(".")[1] || "").length,
    prefix: text.slice(0, m.index),
    suffix: text.slice(m.index + raw.length),
    // Non-stateful grouping check (avoids the /g lastIndex pitfall of .test()).
    grouped: stripped.length !== raw.length,
  };
}

function fmt(v: number, p: ParsedValue): string {
  return v.toLocaleString("en-US", {
    minimumFractionDigits: p.decimals,
    maximumFractionDigits: p.decimals,
    useGrouping: p.grouped,
  });
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

export function CountUp({
  children,
  className,
}: {
  children: string;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (prefersReducedMotion()) return; // RM belt: value stays as server-rendered
    if (typeof IntersectionObserver === "undefined") return; // graceful: value stays

    const original = el.textContent ?? "";
    const p = parseValue(original);
    if (!p) return; // non-numeric (e.g. "חינם") — nothing to count, leave as-is

    let raf = 0;
    let done = false;

    const run = () => {
      let t0: number | null = null;
      const frame = (t: number) => {
        if (t0 === null) t0 = t;
        const k = Math.min(1, (t - t0) / DURATION);
        const e = 1 - (1 - k) ** 3; // ease-out cubic
        if (k < 1) {
          el.textContent = p.prefix + fmt(p.num * e, p) + p.suffix;
          raf = requestAnimationFrame(frame);
        } else {
          // CRITICAL: restore the exact original string byte-for-byte.
          el.textContent = original;
        }
      };
      raf = requestAnimationFrame(frame);
    };

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && !done) {
            done = true;
            io.unobserve(entry.target);
            run();
          }
        }
      },
      { threshold: 0, rootMargin: "0px 0px -5% 0px" }
    );
    io.observe(el);

    return () => {
      io.disconnect();
      if (raf) cancelAnimationFrame(raf);
      // Ensure the exact original string is present if we unmount mid-count.
      if (el.textContent !== original) el.textContent = original;
    };
  }, [children]);

  // Base render = the final visible value (no-JS / RM / crawler safe).
  return (
    <span ref={ref} className={className}>
      {children}
    </span>
  );
}
