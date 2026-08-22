import { describe, expect, it } from "vitest";
import {
  limitSimulatorHistory,
  SIMULATOR_MAX_HISTORY_CHARS,
  SIMULATOR_MAX_HISTORY_TURNS,
} from "../../convex/lib/simulatorLimits";

describe("limitSimulatorHistory", () => {
  it("keeps only the newest bounded turns", () => {
    const messages = Array.from({ length: SIMULATOR_MAX_HISTORY_TURNS + 5 }, (_, i) => ({
      role: i % 2 === 0 ? ("user" as const) : ("assistant" as const),
      content: `turn-${i}`,
    }));
    const result = limitSimulatorHistory(messages);
    expect(result).toHaveLength(SIMULATOR_MAX_HISTORY_TURNS);
    expect(result.at(-1)?.content).toBe(`turn-${messages.length - 1}`);
    expect(result[0]?.content).toBe("turn-5");
  });

  it("stops before the configured character budget", () => {
    const messages = [
      { role: "user" as const, content: "א".repeat(7_000) },
      { role: "assistant" as const, content: "ב".repeat(6_000) },
    ];
    const result = limitSimulatorHistory(messages);
    expect(result).toEqual([messages[1]]);
    expect(result.reduce((sum, item) => sum + item.content.length, 0)).toBeLessThanOrEqual(
      SIMULATOR_MAX_HISTORY_CHARS
    );
  });
});
