import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";
import { POST } from "../route";

// Mock next/headers
vi.mock("next/headers", () => ({
  cookies: vi.fn(() => ({
    get: vi.fn().mockReturnValue({ value: "test-cookie" }),
  })),
}));

// Mock Supabase client
const mockSupabaseClient = () =>
  ({
    auth: {
      getSession: vi.fn().mockResolvedValue({
        data: {
          session: {
            user: { id: "test-user" },
          },
        },
        error: null,
      }),
    },
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: {
          id: "test-scenario",
          title: "Test Scenario",
          description: "Test Description",
          difficulty: "beginner",
        },
        error: null,
      }),
    })),
  }) as any;

vi.mock("@supabase/auth-helpers-nextjs", () => ({
  createRouteHandlerClient: vi.fn(() => mockSupabaseClient()),
}));

describe("POST /api/simulator/chat", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("מטפל בהודעה תקינה", async () => {
    const request = new NextRequest(
      "http://localhost:3000/api/simulator/chat",
      {
        method: "POST",
        body: JSON.stringify({
          scenarioId: "test-scenario",
          message: "Test message",
        }),
      }
    );

    const response = await POST(request);
    expect(response.status).toBe(200);

    const data = await response.json();
    expect(data).toHaveProperty("response");
    expect(data).toHaveProperty("feedback");
  });

  it("מחזיר שגיאה כשחסר scenarioId", async () => {
    const request = new NextRequest(
      "http://localhost:3000/api/simulator/chat",
      {
        method: "POST",
        body: JSON.stringify({
          message: "Test message",
        }),
      }
    );

    const response = await POST(request);
    expect(response.status).toBe(400);

    const data = await response.json();
    expect(data.error).toBe("Required");
  });

  it("מחזיר שגיאה כשחסרה הודעה", async () => {
    const request = new NextRequest(
      "http://localhost:3000/api/simulator/chat",
      {
        method: "POST",
        body: JSON.stringify({
          scenarioId: "test-scenario",
        }),
      }
    );

    const response = await POST(request);
    expect(response.status).toBe(400);

    const data = await response.json();
    expect(data.error).toBe("Required");
  });

  it("מחזיר שגיאה כשההודעה ריקה", async () => {
    const request = new NextRequest(
      "http://localhost:3000/api/simulator/chat",
      {
        method: "POST",
        body: JSON.stringify({
          scenarioId: "test-scenario",
          message: "",
        }),
      }
    );

    const response = await POST(request);
    expect(response.status).toBe(400);

    const data = await response.json();
    expect(data.error).toBe("ההודעה לא יכולה להיות ריקה");
  });

  it("מחזיר שגיאה כשההודעה ארוכה מדי", async () => {
    const request = new NextRequest(
      "http://localhost:3000/api/simulator/chat",
      {
        method: "POST",
        body: JSON.stringify({
          scenarioId: "test-scenario",
          message: "a".repeat(1001),
        }),
      }
    );

    const response = await POST(request);
    expect(response.status).toBe(400);

    const data = await response.json();
    expect(data.error).toBe("ההודעה ארוכה מדי");
  });

  it("מחזיר שגיאה כשהתרחיש לא קיים", async () => {
    const mockClient = mockSupabaseClient();
    mockClient.from = vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: null,
        error: null,
      }),
    }));

    vi.mocked(createRouteHandlerClient).mockImplementationOnce(
      () => mockClient
    );

    const request = new NextRequest(
      "http://localhost:3000/api/simulator/chat",
      {
        method: "POST",
        body: JSON.stringify({
          scenarioId: "non-existent",
          message: "Test message",
        }),
      }
    );

    const response = await POST(request);
    expect(response.status).toBe(404);

    const data = await response.json();
    expect(data.error).toBe("שגיאה בבדיקת הרשאות");
  });

  it("מחזיר שגיאה כשאין הרשאות", async () => {
    let scenarioChecked = false;
    const mockClient = mockSupabaseClient();
    mockClient.from = vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockImplementation(() => {
        if (!scenarioChecked) {
          scenarioChecked = true;
          return Promise.resolve({
            data: { id: "test-scenario" },
            error: null,
          });
        }
        return Promise.resolve({
          data: null,
          error: null,
        });
      }),
    }));

    vi.mocked(createRouteHandlerClient).mockImplementationOnce(
      () => mockClient
    );

    const request = new NextRequest(
      "http://localhost:3000/api/simulator/chat",
      {
        method: "POST",
        body: JSON.stringify({
          scenarioId: "test-scenario",
          message: "Test message",
        }),
      }
    );

    const response = await POST(request);
    expect(response.status).toBe(403);

    const data = await response.json();
    expect(data.error).toBe("אין לך הרשאות לתרחיש זה");
  });
});
