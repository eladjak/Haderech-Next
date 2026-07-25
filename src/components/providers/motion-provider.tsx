"use client";

import { MotionConfig } from "framer-motion";

/**
 * framer-motion writes transforms inline via rAF, so the CSS reduced-motion
 * belt in globals.css cannot reach them. There are ~27 Motion components in
 * this app and none of them honoured the OS "reduce motion" setting.
 *
 * `reducedMotion="user"` makes every Motion component respect it: transform
 * and layout animations are skipped, only opacity is animated.
 */
export function MotionProvider({ children }: { children: React.ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
