import type { SimulationScenario } from "@/types/simulator";

export const EXAMPLE_SCENARIOS: SimulationScenario[] = [
  {
    id: "1",
    title: "תקשורת זוגית",
    description: "תרגול תקשורת זוגית אפקטיבית",
    difficulty: "beginner",
    category: "communication",
    initialMessage:
      "שלום, אני כאן כדי לעזור לך לתרגל תקשורת זוגית. איך אוכל לעזור?",
    suggestedResponses: [
      "אני רוצה לתרגל הקשבה פעילה",
      "איך להביע רגשות בצורה בריאה?",
      "כיצד להתמודד עם קונפליקטים?",
    ],
    learningObjectives: [
      "פיתוח מיומנויות הקשבה פעילה",
      "שיפור היכולת להביע רגשות",
      "למידת טכניקות לפתרון קונפליקטים",
    ],
    successCriteria: {
      minScore: 70,
      requiredSkills: ["הקשבה פעילה", "אמפתיה", "תקשורת ברורה"],
      minDuration: 300, // 5 דקות
      maxDuration: 1800, // 30 דקות
    },
  },
  {
    id: "2",
    title: "פתרון קונפליקטים",
    description: "למידה כיצד לפתור מחלוקות בצורה בונה",
    difficulty: "intermediate",
    category: "conflict-resolution",
    initialMessage: "בואו נתרגל פתרון קונפליקטים. איזה סוג של מצב תרצו לתרגל?",
    suggestedResponses: [
      "ויכוח על כספים",
      "חילוקי דעות על חינוך ילדים",
      "קונפליקט על זמן איכות",
    ],
    learningObjectives: [
      "זיהוי מקורות הקונפליקט",
      "פיתוח אסטרטגיות לפתרון בעיות",
      "שיפור יכולת המשא ומתן",
    ],
    successCriteria: {
      minScore: 75,
      requiredSkills: ["פתרון בעיות", "משא ומתן", "ניהול כעסים"],
      minDuration: 600, // 10 דקות
      maxDuration: 2400, // 40 דקות
    },
  },
  {
    id: "3",
    title: "הבעת אמפתיה",
    description: "פיתוח יכולת אמפתית והבנה רגשית",
    difficulty: "advanced",
    category: "empathy",
    initialMessage: "בואו נעבוד על פיתוח אמפתיה. איך תרצו להתחיל?",
    suggestedResponses: [
      "כיצד להבין את נקודת המבט של בן/בת הזוג?",
      "איך להביע הבנה רגשית?",
      "תרגול הקשבה אמפתית",
    ],
    learningObjectives: [
      "פיתוח יכולת הבנה רגשית",
      "שיפור היכולת לזהות רגשות",
      "למידת טכניקות להבעת אמפתיה",
    ],
    successCriteria: {
      minScore: 80,
      requiredSkills: ["אמפתיה", "זיהוי רגשות", "תקשורת רגשית"],
      minDuration: 900, // 15 דקות
      maxDuration: 3600, // 60 דקות
    },
  },
];
