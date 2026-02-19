import { describe, it, expect, vi, afterEach } from "vitest";
import {
  getNotificationIcon,
  getNotificationLabel,
  formatNotificationTime,
  groupNotificationsByDate,
  countUnreadInGroup,
  isValidNotificationType,
} from "../lib/notification-utils";

describe("getNotificationIcon", () => {
  it("returns correct icon for achievement", () => {
    expect(getNotificationIcon("achievement")).toBe("🏆");
  });

  it("returns correct icon for comment_reply", () => {
    expect(getNotificationIcon("comment_reply")).toBe("💬");
  });

  it("returns correct icon for course_update", () => {
    expect(getNotificationIcon("course_update")).toBe("📚");
  });

  it("returns correct icon for certificate", () => {
    expect(getNotificationIcon("certificate")).toBe("🎓");
  });

  it("returns correct icon for quiz_result", () => {
    expect(getNotificationIcon("quiz_result")).toBe("📝");
  });

  it("returns default bell for unknown type", () => {
    expect(getNotificationIcon("unknown")).toBe("🔔");
  });
});

describe("getNotificationLabel", () => {
  it("returns Hebrew labels for known types", () => {
    expect(getNotificationLabel("achievement")).toBe("הישג");
    expect(getNotificationLabel("comment_reply")).toBe("תגובה");
    expect(getNotificationLabel("certificate")).toBe("תעודה");
    expect(getNotificationLabel("quiz_result")).toBe("תוצאת בוחן");
    expect(getNotificationLabel("course_update")).toBe("עדכון קורס");
  });

  it("returns default label for unknown type", () => {
    expect(getNotificationLabel("something")).toBe("התראה");
  });
});

describe("formatNotificationTime", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns 'עכשיו' for less than 60 seconds ago", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-15T12:00:30Z"));
    expect(formatNotificationTime(new Date("2026-01-15T12:00:00Z").getTime())).toBe("עכשיו");
  });

  it("returns minutes for less than 60 minutes", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-15T12:05:00Z"));
    expect(formatNotificationTime(new Date("2026-01-15T12:00:00Z").getTime())).toBe("5ד");
  });

  it("returns hours for less than 24 hours", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-15T15:00:00Z"));
    expect(formatNotificationTime(new Date("2026-01-15T12:00:00Z").getTime())).toBe("3ש");
  });

  it("returns days for less than 7 days", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-18T12:00:00Z"));
    expect(formatNotificationTime(new Date("2026-01-15T12:00:00Z").getTime())).toBe("3י");
  });

  it("returns weeks for less than 4 weeks", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-29T12:00:00Z"));
    expect(formatNotificationTime(new Date("2026-01-15T12:00:00Z").getTime())).toBe("2ש");
  });

  it("returns months for 30+ days", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-03-15T12:00:00Z"));
    expect(formatNotificationTime(new Date("2026-01-15T12:00:00Z").getTime())).toBe("1ח");
  });
});

describe("groupNotificationsByDate", () => {
  it("separates today and earlier notifications", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-15T15:00:00Z"));

    const notifications = [
      { createdAt: new Date("2026-01-15T14:00:00Z").getTime(), read: false },
      { createdAt: new Date("2026-01-15T10:00:00Z").getTime(), read: true },
      { createdAt: new Date("2026-01-14T20:00:00Z").getTime(), read: true },
      { createdAt: new Date("2026-01-13T08:00:00Z").getTime(), read: false },
    ];

    const result = groupNotificationsByDate(notifications);
    expect(result.today).toHaveLength(2);
    expect(result.earlier).toHaveLength(2);

    vi.useRealTimers();
  });

  it("handles empty array", () => {
    const result = groupNotificationsByDate([]);
    expect(result.today).toHaveLength(0);
    expect(result.earlier).toHaveLength(0);
  });

  it("handles all today", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-15T15:00:00Z"));

    const notifications = [
      { createdAt: new Date("2026-01-15T14:00:00Z").getTime(), read: false },
      { createdAt: new Date("2026-01-15T10:00:00Z").getTime(), read: true },
    ];

    const result = groupNotificationsByDate(notifications);
    expect(result.today).toHaveLength(2);
    expect(result.earlier).toHaveLength(0);

    vi.useRealTimers();
  });
});

describe("countUnreadInGroup", () => {
  it("counts unread notifications", () => {
    const notifications = [
      { read: false },
      { read: true },
      { read: false },
      { read: true },
    ];
    expect(countUnreadInGroup(notifications)).toBe(2);
  });

  it("returns 0 when all read", () => {
    const notifications = [{ read: true }, { read: true }];
    expect(countUnreadInGroup(notifications)).toBe(0);
  });

  it("returns 0 for empty array", () => {
    expect(countUnreadInGroup([])).toBe(0);
  });

  it("counts all when none read", () => {
    const notifications = [{ read: false }, { read: false }];
    expect(countUnreadInGroup(notifications)).toBe(2);
  });
});

describe("isValidNotificationType", () => {
  it("returns true for valid types", () => {
    expect(isValidNotificationType("achievement")).toBe(true);
    expect(isValidNotificationType("comment_reply")).toBe(true);
    expect(isValidNotificationType("course_update")).toBe(true);
    expect(isValidNotificationType("certificate")).toBe(true);
    expect(isValidNotificationType("quiz_result")).toBe(true);
  });

  it("returns false for invalid types", () => {
    expect(isValidNotificationType("unknown")).toBe(false);
    expect(isValidNotificationType("")).toBe(false);
    expect(isValidNotificationType("Achievement")).toBe(false);
  });
});
