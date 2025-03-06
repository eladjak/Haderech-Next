import { v4 as uuidv4 } from "uuid";
import { FEEDBACK_CRITERIA, SCENARIO_TYPES } from "@/constants/simulator";
import { config } from "@/lib/config";
import type {
  APIResponse,
  Message,
  SimulatorResponse,
  SimulatorScenario,
  SimulatorSession,
  SimulatorState,
} from "@/types/simulator";

// קובץ זה הוא הפניה לקובץ העיקרי ב-src/lib/services/simulator.ts
// נוצר כפתרון זמני לבעיות בבנייה

/**
 * ייבוא של הפונקציות מהקובץ העיקרי
 */
export * from "@/lib/services/simulator";
