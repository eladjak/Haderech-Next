import { v4 as uuidv4 } from "uuid";
import { FEEDBACK_CRITERIA, SCENARIO_TYPES } from "@/constants/simulator";
import { config } from "@/lib/config";
import type {
  APIResponse,
  Message,
  SimulatorScenario,
  SimulatorSession,
  SimulatorState,
} from "@/types/simulator";

// קובץ זה הוא הפניה לקובץ העיקרי ב-src/lib/services/simulator.ts
// נוצר כפתרון זמני לבעיות בבנייה

/**
 * מייצא את כל הפונקציות והטיפוסים מהקובץ העיקרי
 * פתרון זמני לבעיות בבנייה
 */
export * from "@/lib/services/simulator";
