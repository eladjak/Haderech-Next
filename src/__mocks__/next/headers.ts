import { vi } from "vitest";

export const cookies = () => ({
  get: vi.fn().mockReturnValue({ value: "mock-cookie-value" }),
  getAll: vi.fn().mockReturnValue([]),
  set: vi.fn(),
  delete: vi.fn(),
});
