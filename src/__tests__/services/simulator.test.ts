import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  _calculateEmpathyScore,
  _calculateClarityScore,
  _calculateEffectivenessScore,
  validateSimulationStatus,
  canUserContinueSimulation,
  validateUserInSession,
  SimulatorService,
} from '@/lib/services/simulator';
import type { SimulatorSession } from '@/types/simulator';

describe('Simulator Scoring Functions', () => {
  describe('_calculateEmpathyScore', () => {
    it('should give high score for empathetic messages', () => {
      const message = 'I understand how you feel. This sounds really difficult.';
      const score = _calculateEmpathyScore(message);
      expect(score).toBeGreaterThan(70);
    });

    it('should give low score for commanding messages', () => {
      const message = 'You must do this now. You have to stop.';
      const score = _calculateEmpathyScore(message);
      expect(score).toBeLessThan(60);
    });

    it('should give bonus for questions', () => {
      const withQuestion = 'How do you feel about this?';
      const without = 'I see.';
      expect(_calculateEmpathyScore(withQuestion)).toBeGreaterThan(_calculateEmpathyScore(without));
    });

    it('should give high score for Hebrew empathetic messages', () => {
      const message = 'אני מבין איך אתה מרגיש. זה נשמע קשה.';
      const score = _calculateEmpathyScore(message);
      expect(score).toBeGreaterThan(70);
    });

    it('should penalize command words', () => {
      const message = 'תעשה את זה עכשיו. חייב לעשות.';
      const score = _calculateEmpathyScore(message);
      expect(score).toBeLessThan(60);
    });

    it('should reward emotional awareness', () => {
      const message = 'I can see you are frustrated and worried about this situation.';
      const score = _calculateEmpathyScore(message);
      expect(score).toBeGreaterThan(60);
    });

    it('should give higher score for validation phrases', () => {
      const message = 'That makes sense. Your feelings are valid.';
      const score = _calculateEmpathyScore(message);
      expect(score).toBeGreaterThan(60);
    });

    it('should handle empty messages', () => {
      const score = _calculateEmpathyScore('');
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(100);
    });
  });

  describe('_calculateClarityScore', () => {
    it('should penalize very short messages', () => {
      const score = _calculateClarityScore('Ok');
      expect(score).toBeLessThan(50);
    });

    it('should reward well-structured messages', () => {
      const message = 'First, let me explain. Second, we can try this approach. Third, we evaluate.';
      const score = _calculateClarityScore(message);
      expect(score).toBeGreaterThan(70);
    });

    it('should penalize very long rambling messages', () => {
      const longMessage = 'word '.repeat(200); // 200 words
      const score = _calculateClarityScore(longMessage);
      expect(score).toBeLessThan(80);
    });

    it('should reward messages with good length', () => {
      const message = 'This is a well-structured message with good length and clarity.';
      const score = _calculateClarityScore(message);
      expect(score).toBeGreaterThan(50);
    });

    it('should penalize filler words', () => {
      const message = 'Like, umm, basically this is uhh what I mean, you know?';
      const score = _calculateClarityScore(message);
      expect(score).toBeLessThan(70);
    });

    it('should reward concrete language', () => {
      const message = 'Specifically, for example, this is exactly what I mean.';
      const score = _calculateClarityScore(message);
      expect(score).toBeGreaterThan(60);
    });

    it('should reward numbered lists', () => {
      const message = 'ראשית, נבחן את הנושא. שנית, נמצא פתרון. שלישית, נבצע.';
      const score = _calculateClarityScore(message);
      expect(score).toBeGreaterThan(60);
    });

    it('should handle empty messages', () => {
      const score = _calculateClarityScore('');
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(100);
    });
  });

  describe('_calculateEffectivenessScore', () => {
    it('should reward action-oriented language', () => {
      const message = "Let's start by doing this. I suggest we approach it this way.";
      const score = _calculateEffectivenessScore(message);
      expect(score).toBeGreaterThan(60);
    });

    it('should reward solution-focused language', () => {
      const message = 'Here is a solution. This approach will work. The plan is clear.';
      const score = _calculateEffectivenessScore(message);
      expect(score).toBeGreaterThan(60);
    });

    it('should penalize vague language', () => {
      const message = 'Maybe we could perhaps try something. I guess it might work.';
      const score = _calculateEffectivenessScore(message);
      expect(score).toBeLessThan(70);
    });

    it('should reward next steps language', () => {
      const message = 'Next, we will do this. Then, we move to the next phase.';
      const score = _calculateEffectivenessScore(message);
      expect(score).toBeGreaterThan(50);
    });

    it('should reward Hebrew action words', () => {
      const message = 'נעשה את זה. אציע פתרון. נתחיל עכשיו.';
      const score = _calculateEffectivenessScore(message);
      expect(score).toBeGreaterThan(60);
    });

    it('should penalize overly passive language', () => {
      const message = 'It seems like it appears that maybe it is possible that this might work.';
      const score = _calculateEffectivenessScore(message);
      expect(score).toBeLessThan(60);
    });

    it('should handle empty messages', () => {
      const score = _calculateEffectivenessScore('');
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(100);
    });
  });
});

describe('Simulator Validation Functions', () => {
  describe('validateSimulationStatus', () => {
    it('should validate correct status values', () => {
      expect(validateSimulationStatus('idle')).toBe(true);
      expect(validateSimulationStatus('running')).toBe(true);
      expect(validateSimulationStatus('completed')).toBe(true);
      expect(validateSimulationStatus('error')).toBe(true);
      expect(validateSimulationStatus('blocked')).toBe(true);
    });

    it('should reject invalid status values', () => {
      expect(validateSimulationStatus('invalid')).toBe(false);
      expect(validateSimulationStatus('pending')).toBe(false);
      expect(validateSimulationStatus('')).toBe(false);
    });
  });

  describe('canUserContinueSimulation', () => {
    it('should allow continuation for idle sessions', () => {
      const session: Partial<SimulatorSession> = {
        status: 'idle',
      } as SimulatorSession;
      expect(canUserContinueSimulation(session as SimulatorSession)).toBe(true);
    });

    it('should prevent continuation for error sessions', () => {
      const session: Partial<SimulatorSession> = {
        status: 'error',
      } as SimulatorSession;
      expect(canUserContinueSimulation(session as SimulatorSession)).toBe(false);
    });

    it('should allow continuation for running sessions', () => {
      const session: Partial<SimulatorSession> = {
        status: 'running',
      } as SimulatorSession;
      expect(canUserContinueSimulation(session as SimulatorSession)).toBe(true);
    });
  });

  describe('validateUserInSession', () => {
    it('should validate matching user IDs', () => {
      const session: Partial<SimulatorSession> = {
        user_id: 'user-123',
      } as SimulatorSession;
      expect(validateUserInSession(session as SimulatorSession, 'user-123')).toBe(true);
    });

    it('should reject non-matching user IDs', () => {
      const session: Partial<SimulatorSession> = {
        user_id: 'user-123',
      } as SimulatorSession;
      expect(validateUserInSession(session as SimulatorSession, 'user-456')).toBe(false);
    });
  });
});

describe('SimulatorService', () => {
  let service: SimulatorService;
  let mockSession: SimulatorSession;

  beforeEach(() => {
    service = new SimulatorService();
    mockSession = {
      id: 'session-123',
      user_id: 'user-123',
      scenario_id: 'scenario-123',
      status: 'idle',
      messages: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    } as SimulatorSession;
  });

  describe('processMessage', () => {
    it('should reject empty messages', async () => {
      await expect(service.processMessage(mockSession, '')).rejects.toThrow('Message cannot be empty');
    });

    it('should reject messages that are too long', async () => {
      const longMessage = 'a'.repeat(1001);
      await expect(service.processMessage(mockSession, longMessage)).rejects.toThrow('Message exceeds maximum length');
    });

    it('should reject sessions in error state', async () => {
      mockSession.status = 'error';
      await expect(service.processMessage(mockSession, 'Hello')).rejects.toThrow('Session is in error state');
    });

    it('should reject sessions without user_id', async () => {
      const invalidSession = { ...mockSession, user_id: '' };
      await expect(service.processMessage(invalidSession as SimulatorSession, 'Hello')).rejects.toThrow('Unauthorized');
    });

    it('should reject invalid origins', async () => {
      await expect(service.processMessage(mockSession, 'Hello', 'https://evil.com')).rejects.toThrow('Invalid origin');
    });

    it('should accept valid origins', async () => {
      const result = await service.processMessage(mockSession, 'Hello', 'http://localhost:3000');
      expect(result).toBeDefined();
      expect(result.content).toBeDefined();
      expect(result.role).toBe('assistant');
    });

    it('should sanitize HTML from messages', async () => {
      const result = await service.processMessage(mockSession, '<script>alert("xss")</script>Hello');
      expect(result.content).not.toContain('<script>');
      expect(result.content).toContain('Hello');
    });

    it('should sanitize SQL injection attempts', async () => {
      const result = await service.processMessage(mockSession, 'Hello; DROP TABLE users;');
      expect(result.content).not.toContain('DROP TABLE');
      expect(result.content).toContain('Hello');
    });

    it('should process valid messages', async () => {
      const result = await service.processMessage(mockSession, 'Hello, how are you?');
      expect(result).toBeDefined();
      expect(result.content).toBeDefined();
      expect(result.timestamp).toBeDefined();
      expect(result.role).toBe('assistant');
    });
  });

  describe('processFileUpload', () => {
    it('should accept valid file types', async () => {
      const validFile = { name: 'test.jpg', type: 'image/jpeg' };
      await expect(service.processFileUpload(mockSession, validFile)).resolves.not.toThrow();
    });

    it('should accept PNG files', async () => {
      const validFile = { name: 'test.png', type: 'image/png' };
      await expect(service.processFileUpload(mockSession, validFile)).resolves.not.toThrow();
    });

    it('should accept PDF files', async () => {
      const validFile = { name: 'test.pdf', type: 'application/pdf' };
      await expect(service.processFileUpload(mockSession, validFile)).resolves.not.toThrow();
    });

    it('should reject invalid file types', async () => {
      const invalidFile = { name: 'test.exe', type: 'application/x-executable' };
      await expect(service.processFileUpload(mockSession, invalidFile)).rejects.toThrow('Invalid file type');
    });

    it('should reject JavaScript files', async () => {
      const invalidFile = { name: 'test.js', type: 'application/javascript' };
      await expect(service.processFileUpload(mockSession, invalidFile)).rejects.toThrow('Invalid file type');
    });
  });

  describe('validateMessageIntegrity', () => {
    it('should pass for valid messages', async () => {
      const validMessage = {
        content: 'Hello',
        originalContent: 'Hello',
      };
      await expect(service.validateMessageIntegrity(validMessage)).resolves.not.toThrow();
    });

    it('should fail for tampered messages', async () => {
      const tamperedMessage = {
        content: 'Hello World',
        originalContent: 'Hello',
      };
      await expect(service.validateMessageIntegrity(tamperedMessage)).rejects.toThrow('Message integrity check failed');
    });
  });
});
