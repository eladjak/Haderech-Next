/**
 * @file simulator.test.ts
 * @description Unit tests for the simulator service
 * Tests cover core functionality including:
 * - Starting simulations
 * - Processing user messages
 * - Saving simulation results
 * - Error handling
 * - Rate limiting
 * - Message validation
 */

import { describe, expect, it, vi } from "vitest";

import {
  processUserMessage,
  saveSimulationResults,
  SimulatorService,
  startSimulation,
} from "@/lib/services/simulator";
import type {
  SimulationConfig,
  SimulationSession,
  SimulatorScenario,
  SimulatorSession,
  SimulatorState,
} from "@/types/simulator";

/**
 * Mock test data for simulator tests
 */

// Mock scenario with basic communication setup
const mockScenario: SimulatorScenario = {
  id: "test-scenario",
  title: "Test Scenario",
  description: "A scenario for testing the system",
  difficulty: "beginner",
  category: "communication",
  tags: ["communication", "empathy"],
  initial_message: "Hello, how can I help you?",
  learning_objectives: ["Improve communication", "Understand user needs"],
  success_criteria: {
    minScore: 70,
    requiredSkills: ["communication", "empathy"],
    minDuration: 300,
    maxDuration: 900,
  },
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

// Test user identifier
const mockUserId = "test-user";

// Simulation configuration for tests
const mockConfig: SimulationConfig = {
  maxMessages: 100,
  rateLimit: 20,
  messageMaxLength: 1000,
  defaultScenario: "basic-communication",
  feedbackFrequency: 3,
};

// Mock session data
const mockSession: SimulationSession = {
  id: "test-session",
  userId: "test-user",
  scenarioId: "test-scenario",
  status: "active" as const,
  messages: [],
  startTime: new Date(),
  lastMessageTime: new Date(),
  config: mockConfig,
};

describe("Simulator Service", () => {
  let simulatorService: SimulatorService;

  beforeEach(() => {
    simulatorService = new SimulatorService();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe("startSimulation", () => {
    it("should create a new simulation session", async () => {
      const session = await startSimulation(mockScenario, mockUserId);

      expect(session).toBeDefined();
      expect(session.id).toBeDefined();
      expect(session.user_id).toBe(mockUserId);
      expect(session.scenario_id).toBe(mockScenario.id);
      expect(session.status).toBe("active");
      expect(session.messages).toHaveLength(1);
      expect(session.messages[0].content).toBe(mockScenario.initial_message);
    });

    it("should throw error when missing parameters", async () => {
      await expect(startSimulation(null as any, mockUserId)).rejects.toThrow();
      await expect(
        startSimulation(mockScenario, null as any)
      ).rejects.toThrow();
    });
  });

  describe("processUserMessage", () => {
    let mockSession: SimulatorSession;

    beforeEach(async () => {
      mockSession = await startSimulation(mockScenario, mockUserId);
    });

    it("should process user message and return updated state", async () => {
      const message = "זו הודעת בדיקה";
      const updatedState = await processUserMessage(mockSession, message);

      expect(updatedState).toBeDefined();
      expect(updatedState.messages).toHaveLength(3); // Initial + User + Assistant
      expect(updatedState.messages[1].content).toBe(message);
      expect(updatedState.messages[1].role).toBe("user");
      expect(updatedState.messages[2].role).toBe("assistant");
    });

    it("should validate feedback metrics", async () => {
      const state = await processUserMessage(mockSession, "הודעת בדיקה");
      const feedback = state.feedback;

      expect(feedback).toBeDefined();
      expect(feedback?.metrics).toBeDefined();
      expect(feedback?.metrics.empathy).toBeGreaterThanOrEqual(0);
      expect(feedback?.metrics.empathy).toBeLessThanOrEqual(100);
      expect(feedback?.metrics.overall).toBeGreaterThanOrEqual(0);
      expect(feedback?.metrics.overall).toBeLessThanOrEqual(100);
    });

    it("should handle empty messages", async () => {
      await expect(processUserMessage(mockSession, "")).rejects.toThrow();
      await expect(processUserMessage(mockSession, "   ")).rejects.toThrow();
    });

    it("should handle invalid session", async () => {
      await expect(processUserMessage(null as any, "test")).rejects.toThrow();
      await expect(
        processUserMessage({ ...mockSession, state: null as any }, "test")
      ).rejects.toThrow();
    });
  });

  describe("saveSimulationResults", () => {
    it("should save simulation results successfully", async () => {
      const session = await startSimulation(mockScenario, mockUserId);
      const updatedState = await processUserMessage(session, "הודעת בדיקה");

      // Mock the database calls
      vi.spyOn(global, "fetch").mockImplementation(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ data: null, error: null }),
        } as Response)
      );

      await expect(saveSimulationResults(session)).resolves.not.toThrow();
    });

    it("should handle database errors", async () => {
      const session = await startSimulation(mockScenario, mockUserId);

      // Mock database error
      vi.spyOn(global, "fetch").mockImplementation(() =>
        Promise.resolve({
          ok: false,
          json: () => Promise.resolve({ data: null, error: "Database error" }),
        } as Response)
      );

      await expect(saveSimulationResults(session)).rejects.toThrow();
    });
  });

  describe("Input Validation", () => {
    it("should validate message length", async () => {
      const longMessage = "a".repeat(mockConfig.messageMaxLength + 1);
      await expect(
        simulatorService.processMessage(mockSession, longMessage)
      ).rejects.toThrow("Message exceeds maximum length");
    });

    it("should validate empty messages", async () => {
      await expect(
        simulatorService.processMessage(mockSession, "")
      ).rejects.toThrow("Message cannot be empty");
    });

    it("should validate null/undefined messages", async () => {
      await expect(
        simulatorService.processMessage(mockSession, undefined as any)
      ).rejects.toThrow("Invalid message");
    });
  });

  describe("Sanitization", () => {
    it("should sanitize HTML in messages", async () => {
      const maliciousInput = '<script>alert("xss")</script>';
      const response = await simulatorService.processMessage(
        mockSession,
        maliciousInput
      );
      expect(response.content).not.toContain("<script>");
    });

    it("should prevent SQL injection", async () => {
      const maliciousInput = "DROP TABLE users;";
      const response = await simulatorService.processMessage(
        mockSession,
        maliciousInput
      );
      expect(response.content).not.toContain("DROP TABLE");
    });
  });

  describe("Permission Validation", () => {
    it("should validate user permissions", async () => {
      const blockedSession: SimulationSession = {
        ...mockSession,
        status: "blocked" as const,
      };
      await expect(
        simulatorService.processMessage(blockedSession, "test")
      ).rejects.toThrow("User is blocked");
    });

    it("should check authorization", async () => {
      const { userId, ...sessionWithoutUser } = mockSession;
      await expect(
        simulatorService.processMessage(
          sessionWithoutUser as SimulationSession,
          "test"
        )
      ).rejects.toThrow("Unauthorized");
    });
  });

  describe("Rate Limiting", () => {
    it("should enforce rate limits", async () => {
      const promises = Array(mockConfig.rateLimit + 1)
        .fill("test message")
        .map((msg) => simulatorService.processMessage(mockSession, msg));

      const results = await Promise.allSettled(promises);
      const rejected = results.filter((r) => r.status === "rejected");
      expect(rejected.length).toBeGreaterThan(0);
    });
  });

  describe("Sensitive Data Protection", () => {
    it("should not return sensitive data", async () => {
      const response = await simulatorService.processMessage(
        mockSession,
        "test"
      );
      expect(response).not.toHaveProperty("apiKey");
      expect(response).not.toHaveProperty("internalData");
    });
  });

  describe("Session Token Validation", () => {
    it("should validate session tokens", async () => {
      const tamperedSession = {
        ...mockSession,
        id: "tampered-token",
      };
      await expect(
        simulatorService.processMessage(tamperedSession, "test")
      ).rejects.toThrow("Invalid session");
    });
  });

  describe("CSRF Prevention", () => {
    it("should validate request origin", async () => {
      const maliciousOrigin = "https://evil.com";
      await expect(
        simulatorService.processMessage(mockSession, "test", maliciousOrigin)
      ).rejects.toThrow("Invalid origin");
    });
  });

  describe("File Upload Validation", () => {
    it("should validate file uploads", async () => {
      const maliciousFile = {
        name: "malicious.exe",
        type: "application/x-msdownload",
      };
      await expect(
        simulatorService.processFileUpload(mockSession, maliciousFile)
      ).rejects.toThrow("Invalid file type");
    });
  });

  describe("Command Injection Prevention", () => {
    it("should prevent command injection", async () => {
      const maliciousCommand = "; rm -rf /";
      const response = await simulatorService.processMessage(
        mockSession,
        maliciousCommand
      );
      expect(response.content).not.toContain("rm -rf");
    });
  });

  describe("Message Integrity", () => {
    it("should validate message integrity", async () => {
      const originalMessage = "Hello";
      const response = await simulatorService.processMessage(
        mockSession,
        originalMessage
      );
      const modifiedResponse = { ...response, content: "Modified" };

      await expect(
        simulatorService.validateMessageIntegrity(modifiedResponse)
      ).rejects.toThrow("Message integrity check failed");
    });
  });
});
