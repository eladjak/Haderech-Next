import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ChatSimulator } from "@/components/simulator/ChatSimulator";
import type {
  Message,
  SimulatorScenario,
  SimulatorState,
} from "@/types/simulator";

const mockScenario: SimulatorScenario = {
  id: "1",
  title: "תרחיש בדיקה",
  description: "תרחיש לבדיקת ביצועים",
  difficulty: "beginner",
  category: "תקשורת",
  tags: ["תקשורת", "אמפתיה"],
  initial_message: "שלום, איך אני יכול לעזור?",
  learning_objectives: ["שיפור תקשורת", "הבנת צרכי המשתמש"],
  success_criteria: {
    minScore: 70,
    requiredSkills: ["תקשורת", "אמפתיה"],
    minDuration: 300,
    maxDuration: 900,
  },
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

const mockMessage: Message = {
  id: "1",
  role: "assistant",
  content: mockScenario.initial_message,
  timestamp: new Date().toISOString(),
  sender: {
    id: "system",
    name: "המערכת",
    role: "assistant",
  },
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

const mockState: SimulatorState = {
  id: "1",
  user_id: "1",
  scenario_id: "1",
  scenario: mockScenario,
  status: "running",
  state: "initial",
  messages: [mockMessage],
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

const noop = vi.fn();

describe("UI Performance Tests", () => {
  let mockState: SimulatorState;
  const mockHandleMessage = async (message: string) => {
    console.log("Message sent:", message);
  };

  beforeEach(() => {
    mockState = {
      id: "perf-test",
      user_id: "test-user",
      scenario_id: "test-scenario",
      scenario: {
        id: "test-scenario",
        title: "תרחיש בדיקת ביצועים",
        description: "תרחיש לבדיקת ביצועי ממשק המשתמש",
        difficulty: "beginner",
        category: "ביצועים",
        tags: ["ביצועים", "UI"],
        initial_message: "בדיקת ביצועים",
        learning_objectives: ["בדיקת ביצועים"],
        success_criteria: {
          minScore: 70,
          requiredSkills: ["ביצועים"],
          minDuration: 300,
          maxDuration: 900,
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      status: "running",
      state: "initial",
      messages: Array(50).fill({
        id: "test-message",
        role: "user",
        content: "הודעת בדיקה",
        timestamp: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        sender: {
          id: "test-user",
          role: "user",
          name: "משתמש בדיקה",
        },
      }),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  });

  it("should render quickly with many messages", () => {
    const start = performance.now();
    render(
      <ChatSimulator
        state={mockState}
        onSendMessage={mockHandleMessage}
        onReset={noop}
        isLoading={false}
        showFeedback={true}
      />
    );
    const duration = performance.now() - start;
    expect(duration).toBeLessThan(100); // פחות מ-100ms
  });

  it("should scroll smoothly with many messages", () => {
    render(
      <ChatSimulator
        state={mockState}
        onSendMessage={mockHandleMessage}
        onReset={noop}
        isLoading={false}
        showFeedback={true}
      />
    );

    const chatContainer = screen.getByRole("log");
    const start = performance.now();
    chatContainer.scrollTop = chatContainer.scrollHeight;
    const duration = performance.now() - start;
    expect(duration).toBeLessThan(16); // פחות מפריים אחד (60fps)
  });

  it("should handle rapid message sending", async () => {
    render(
      <ChatSimulator
        state={mockState}
        onSendMessage={mockHandleMessage}
        onReset={noop}
        isLoading={false}
        showFeedback={true}
      />
    );

    const input = screen.getByRole("textbox");
    const sendButton = screen.getByRole("button", { name: /שלח/i });

    const start = performance.now();
    for (let i = 0; i < 10; i++) {
      fireEvent.change(input, { target: { value: `הודעה מהירה ${i}` } });
      fireEvent.click(sendButton);
    }
    const duration = performance.now() - start;
    expect(duration).toBeLessThan(100); // פחות מ-100ms
  });

  it("should maintain FPS during animations", () => {
    const fps: number[] = [];
    let lastTime = performance.now();

    const measureFPS = () => {
      const now = performance.now();
      const delta = now - lastTime;
      fps.push(1000 / delta);
      lastTime = now;
    };

    render(
      <ChatSimulator
        state={mockState}
        onSendMessage={mockHandleMessage}
        onReset={noop}
        isLoading={false}
        showFeedback={true}
      />
    );

    // מדידת FPS במשך שנייה
    const interval = setInterval(measureFPS, 16);
    setTimeout(() => {
      clearInterval(interval);
      const avgFPS = fps.reduce((a, b) => a + b) / fps.length;
      expect(avgFPS).toBeGreaterThan(30); // לפחות 30fps
    }, 1000);
  });

  it("should handle window resizing efficiently", () => {
    render(
      <ChatSimulator
        state={mockState}
        onSendMessage={mockHandleMessage}
        onReset={noop}
        isLoading={false}
        showFeedback={true}
      />
    );

    const start = performance.now();
    for (let i = 0; i < 10; i++) {
      window.dispatchEvent(new Event("resize"));
    }
    const duration = performance.now() - start;
    expect(duration).toBeLessThan(100); // פחות מ-100ms
  });

  it("should handle concurrent user interactions", async () => {
    render(
      <ChatSimulator
        state={mockState}
        onSendMessage={mockHandleMessage}
        onReset={noop}
        isLoading={false}
        showFeedback={true}
      />
    );

    const input = screen.getByRole("textbox");
    const sendButton = screen.getByRole("button", { name: /שלח/i });
    const chatContainer = screen.getByRole("log");

    const start = performance.now();
    await Promise.all([
      fireEvent.change(input, { target: { value: "הודעה 1" } }),
      fireEvent.click(sendButton),
      fireEvent.scroll(chatContainer, { target: { scrollTop: 100 } }),
      fireEvent.change(input, { target: { value: "הודעה 2" } }),
    ]);
    const duration = performance.now() - start;
    expect(duration).toBeLessThan(100); // פחות מ-100ms
  });

  it("should maintain performance with large message history", () => {
    // הוספת 1000 הודעות למצב
    mockState.messages = Array(1000).fill({
      id: "test-message",
      role: "user",
      content: "הודעת בדיקה",
      timestamp: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      sender: {
        id: "test-user",
        role: "user",
        name: "משתמש בדיקה",
      },
    });

    const start = performance.now();
    render(
      <ChatSimulator
        state={mockState}
        onSendMessage={mockHandleMessage}
        onReset={noop}
        isLoading={false}
        showFeedback={true}
      />
    );
    const duration = performance.now() - start;
    expect(duration).toBeLessThan(200); // פחות מ-200ms
  });

  it("should handle rapid feedback updates", () => {
    const { rerender } = render(
      <ChatSimulator
        state={mockState}
        onSendMessage={mockHandleMessage}
        onReset={noop}
        isLoading={false}
        showFeedback={true}
      />
    );

    const start = performance.now();
    for (let i = 0; i < 10; i++) {
      mockState.messages[0].content = `הודעה מעודכנת ${i}`;
      rerender(
        <ChatSimulator
          state={mockState}
          onSendMessage={mockHandleMessage}
          onReset={noop}
          isLoading={false}
          showFeedback={true}
        />
      );
    }
    const duration = performance.now() - start;
    expect(duration).toBeLessThan(100); // פחות מ-100ms
  });

  it("should maintain memory usage", () => {
    const initialMemory = process.memoryUsage().heapUsed;

    // רינדור מרובה של הקומפוננטה
    for (let i = 0; i < 100; i++) {
      render(
        <ChatSimulator
          state={mockState}
          onSendMessage={mockHandleMessage}
          onReset={noop}
          isLoading={false}
          showFeedback={true}
        />
      );
    }

    const finalMemory = process.memoryUsage().heapUsed;
    const memoryIncrease = (finalMemory - initialMemory) / 1024 / 1024; // MB
    expect(memoryIncrease).toBeLessThan(50); // פחות מ-50MB
  });

  it("should render ChatSimulator quickly", () => {
    const start = performance.now();
    render(
      <ChatSimulator
        state={mockState}
        onSendMessage={noop}
        onReset={noop}
        isLoading={false}
        showFeedback={true}
      />
    );
    const duration = performance.now() - start;
    expect(duration).toBeLessThan(100); // פחות מ-100ms
  });

  it("should handle message input efficiently", () => {
    const start = performance.now();
    render(
      <ChatSimulator
        state={mockState}
        onSendMessage={noop}
        onReset={noop}
        isLoading={false}
        showFeedback={true}
      />
    );
    const input = screen.getByRole("textbox");
    const duration = performance.now() - start;
    expect(duration).toBeLessThan(50); // פחות מ-50ms
    expect(input).toBeInTheDocument();
  });

  it("should maintain performance with many messages", () => {
    const manyMessages = Array(100)
      .fill(null)
      .map((_, i) => ({
        ...mockMessage,
        id: `msg-${i}`,
        content: `הודעה ${i}`,
      }));

    const stateWithManyMessages = {
      ...mockState,
      messages: manyMessages,
    };

    const start = performance.now();
    render(
      <ChatSimulator
        state={stateWithManyMessages}
        onSendMessage={noop}
        onReset={noop}
        isLoading={false}
        showFeedback={true}
      />
    );
    const duration = performance.now() - start;
    expect(duration).toBeLessThan(200); // פחות מ-200ms
  });
});
