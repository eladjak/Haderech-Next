import type { SimulatorScenario } from "@/types/simulator";

export const DEFAULT_STRENGTHS = ["אין חוזקות מיוחדות שזוהו"] as const;
export const DEFAULT_IMPROVEMENTS = [
  "אין נקודות לשיפור מיוחדות שזוהו",
] as const;
export const DEFAULT_TIPS = [
  "המשך לתרגל ולשפר את המיומנויות הבסיסיות",
] as const;
export const DEFAULT_SUGGESTIONS = [
  "המשך לתרגל ולשפר את המיומנויות הבסיסיות",
] as const;

export const MOCK_SCENARIOS: SimulatorScenario[] = [
  {
    id: "1",
    title: "התמודדות עם לקוח כועס",
    description: "תרחיש שבו עליך להתמודד עם לקוח שאינו מרוצה מהשירות",
    difficulty: "beginner",
    category: "שירות לקוחות",
    initial_message: "אני מאוד מאוכזב מהשירות שקיבלתי!",
    learning_objectives: ["הקשבה פעילה", "פתרון בעיות", "אמפתיה"],
    success_criteria: {
      minScore: 80,
      requiredSkills: ["אמפתיה", "פתרון בעיות", "תקשורת"],
      minDuration: 300,
      maxDuration: 900,
    },
  },
  {
    id: "2",
    title: "ניהול משא ומתן על מחיר",
    description: "תרחיש שבו עליך לנהל משא ומתן עם לקוח על מחיר המוצר",
    difficulty: "intermediate",
    category: "מכירות",
    initial_message: "המחיר שלכם גבוה מדי בהשוואה למתחרים",
    learning_objectives: ["משא ומתן", "הצגת ערך", "שכנוע"],
    success_criteria: {
      minScore: 85,
      requiredSkills: ["משא ומתן", "מכירות", "תקשורת"],
      minDuration: 400,
      maxDuration: 1200,
    },
  },
  {
    id: "3",
    title: "טיפול בתלונה טכנית",
    description: "תרחיש שבו עליך לסייע ללקוח עם בעיה טכנית במוצר",
    difficulty: "advanced",
    category: "תמיכה טכנית",
    initial_message: "המוצר שלכם לא עובד כמו שצריך",
    learning_objectives: ["פתרון בעיות טכניות", "הסברה", "סבלנות"],
    success_criteria: {
      minScore: 90,
      requiredSkills: ["ידע טכני", "פתרון בעיות", "תקשורת"],
      minDuration: 500,
      maxDuration: 1500,
    },
  },
];

export const EXAMPLE_SCENARIOS: SimulatorScenario[] = [
  {
    id: "1",
    title: "התמודדות עם תלמיד מתוסכל",
    description: "תרחיש שבו תלמיד מביע תסכול מקושי בהבנת החומר",
    difficulty: "beginner",
    category: "classroom-management",
    initial_message: "אני לא מבין כלום! זה קשה מדי בשבילי...",
    learning_objectives: [
      "פיתוח אמפתיה",
      "זיהוי מקור התסכול",
      "מתן כלים להתמודדות",
    ],
    success_criteria: {
      minScore: 70,
      requiredSkills: ["אמפתיה", "הקשבה פעילה", "פתרון בעיות"],
      minDuration: 300,
      maxDuration: 900,
    },
  },
  {
    id: "2",
    title: "ניהול דיון כיתתי",
    description: "תרחיש המדמה ניהול דיון בכיתה על נושא מורכב",
    difficulty: "intermediate",
    category: "discussion-facilitation",
    initial_message: "איך נוכל לדון בנושא הזה בצורה מכבדת?",
    learning_objectives: [
      "ניהול זמן אפקטיבי",
      "עידוד השתתפות",
      "שמירה על פוקוס",
    ],
    success_criteria: {
      minScore: 75,
      requiredSkills: ["ניהול דיון", "הנחיית קבוצות", "תקשורת ברורה"],
      minDuration: 600,
      maxDuration: 1200,
    },
  },
  {
    id: "3",
    title: "התמודדות עם התנהגות מפריעה",
    description: "תרחיש המדמה התמודדות עם התנהגות מפריעה בכיתה",
    difficulty: "advanced",
    category: "behavior-management",
    initial_message: "התלמידים לא מקשיבים ומפריעים למהלך השיעור",
    learning_objectives: [
      "שמירה על סמכות",
      "הצבת גבולות",
      "יצירת אווירה חיובית",
    ],
    success_criteria: {
      minScore: 80,
      requiredSkills: ["ניהול כיתה", "תקשורת אסרטיבית", "פתרון קונפליקטים"],
      minDuration: 450,
      maxDuration: 900,
    },
  },
];
