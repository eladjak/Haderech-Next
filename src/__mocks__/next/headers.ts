import { vi } from "vitest";

export const headers = vi.fn().mockReturnValue(new Map());
export const cookies = vi.fn().mockReturnValue(new Map());
