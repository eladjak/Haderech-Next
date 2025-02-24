# 📊 מערכת המשוב

## 🎯 סקירה כללית

מערכת המשוב מספקת ניתוח מעמיק של ביצועי המשתמש בסימולציה, כולל מדדים כמותיים ואיכותיים, הצעות לשיפור ומעקב אחר התקדמות.

## 📈 מדדי הערכה

### מדדים כמותיים

```typescript
interface FeedbackMetrics {
  empathy: number; // 0-100
  clarity: number; // 0-100
  effectiveness: number; // 0-100
  appropriateness: number; // 0-100
  professionalism: number; // 0-100
  problem_solving: number; // 0-100
  overall: number; // 0-100
}
```

### משקולות הערכה

```typescript
const SCORE_WEIGHTS = {
  empathy: 0.2, // 20%
  clarity: 0.2, // 20%
  effectiveness: 0.2, // 20%
  appropriateness: 0.15, // 15%
  professionalism: 0.15, // 15%
  problem_solving: 0.1, // 10%
};
```

## 🔍 קריטריוני הערכה

### אמפתיה (20%)

- **זיהוי רגשות**: היכולת לזהות ולהבין רגשות של אחרים
- **הבעת הבנה**: שימוש במשפטים המביעים הבנה והזדהות
- **תמיכה רגשית**: מתן תמיכה ועידוד מתאימים

### בהירות (20%)

- **מבנה**: סדר לוגי וזרימה של המסר
- **שפה**: שימוש בשפה ברורה ומובנת
- **תמציתיות**: העברת המסר בצורה יעילה

### אפקטיביות (20%)

- **השגת מטרות**: מידת ההצלחה בהשגת מטרות השיחה
- **פתרון בעיות**: יכולת להציע ולממש פתרונות
- **תוצאות**: השפעה חיובית על המצב

### התאמה (15%)

- **הקשר**: התאמה למצב ולנסיבות
- **תרבות**: רגישות תרבותית ושפתית
- **פורמליות**: רמת פורמליות מתאימה

### מקצועיות (15%)

- **אתיקה**: שמירה על כללי אתיקה מקצועית
- **גבולות**: שמירה על גבולות מקצועיים
- **יציבות**: שמירה על יציבות רגשית

### פתרון בעיות (10%)

- **ניתוח**: יכולת ניתוח מצבים
- **יצירתיות**: חשיבה יצירתית בפתרון בעיות
- **יישום**: יכולת ליישם פתרונות

## 🎯 חישוב ציונים

### ציון כולל

```typescript
function calculateOverallScore(metrics: FeedbackMetrics): number {
  return Object.entries(SCORE_WEIGHTS).reduce(
    (sum, [key, weight]) =>
      sum + weight * metrics[key as keyof FeedbackMetrics],
    0
  );
}
```

### ציוני משנה

```typescript
function calculateSubScores(content: string): FeedbackMetrics {
  return {
    empathy: calculateEmpathyScore(content),
    clarity: calculateClarityScore(content),
    effectiveness: calculateEffectivenessScore(content),
    appropriateness: calculateAppropriatenessScore(content),
    professionalism: calculateProfessionalismScore(content),
    problem_solving: calculateProblemSolvingScore(content),
  };
}
```

## 💡 הצעות לשיפור

### זיהוי חוזקות

```typescript
function identifyStrengths(metrics: FeedbackMetrics): string[] {
  const strengths = [];
  if (metrics.empathy > 80) strengths.push("אמפתיה גבוהה");
  if (metrics.clarity > 80) strengths.push("תקשורת ברורה");
  // ...
  return strengths;
}
```

### זיהוי נקודות לשיפור

```typescript
function identifyAreasForImprovement(metrics: FeedbackMetrics): string[] {
  const improvements = [];
  if (metrics.empathy < 60) improvements.push("שיפור אמפתיה");
  if (metrics.clarity < 60) improvements.push("שיפור בהירות");
  // ...
  return improvements;
}
```

## 📝 פורמט המשוב

### מבנה המשוב

```typescript
interface FeedbackDetails {
  metrics: FeedbackMetrics;
  strengths: string[];
  improvements: string[];
  tips: string[];
  comments: string;
  suggestions: string[];
  overallProgress: {
    score: number;
    level: string;
    nextLevel: string;
    requiredScore: number;
  };
}
```

### דוגמה למשוב

```typescript
const feedback: FeedbackDetails = {
  metrics: {
    empathy: 85,
    clarity: 75,
    effectiveness: 80,
    appropriateness: 90,
    professionalism: 85,
    problem_solving: 70,
    overall: 82,
  },
  strengths: ["אמפתיה גבוהה", "התאמה מצוינת להקשר"],
  improvements: ["שיפור יכולת פתרון בעיות"],
  tips: ["נסה להציע יותר פתרונות מעשיים"],
  comments: "ביצוע טוב מאוד עם דגש על אמפתיה והתאמה",
  suggestions: ["תרגל תרחישי פתרון בעיות"],
  overallProgress: {
    score: 82,
    level: "מתקדם",
    nextLevel: "מומחה",
    requiredScore: 90,
  },
};
```

## 📊 ויזואליזציה

### תצוגת מדדים

```typescript
interface MetricDisplay {
  label: string;
  value: number;
  color: string;
  icon: string;
}

const metricDisplays: MetricDisplay[] = [
  {
    label: "אמפתיה",
    value: feedback.metrics.empathy,
    color: "green",
    icon: "heart",
  },
  // ...
];
```

### גרפים

```typescript
interface ProgressChart {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor: string[];
  }[];
}

const progressChart: ProgressChart = {
  labels: ["אמפתיה", "בהירות", "אפקטיביות"],
  datasets: [
    {
      label: "ציונים",
      data: [85, 75, 80],
      backgroundColor: ["#4CAF50", "#2196F3", "#FFC107"],
    },
  ],
};
```

## 🔄 התקדמות

### חישוב רמה

```typescript
function calculateLevel(totalScore: number): string {
  if (totalScore >= 90) return "מומחה";
  if (totalScore >= 80) return "מתקדם";
  return "מתחיל";
}
```

### מעקב התקדמות

```typescript
interface ProgressTracking {
  historicalScores: number[];
  averageScore: number;
  improvement: number;
  trend: "up" | "down" | "stable";
}
```

## 🎓 המלצות למידה

### זיהוי תחומי התמקדות

```typescript
function identifyFocusAreas(metrics: FeedbackMetrics): string[] {
  return Object.entries(metrics)
    .filter(([_, value]) => value < 70)
    .map(([key, _]) => `שיפור ${key}`);
}
```

### המלצות לתרחישים

```typescript
function recommendScenarios(
  metrics: FeedbackMetrics,
  currentLevel: string
): SimulatorScenario[] {
  // בחירת תרחישים מתאימים לפי המדדים והרמה
  return scenarios.filter(
    (scenario) =>
      scenario.difficulty === currentLevel &&
      scenario.tags.some((tag) => metrics[tag as keyof FeedbackMetrics] < 70)
  );
}
```

## 📈 ניתוח מגמות

### מעקב לאורך זמן

```typescript
interface TrendAnalysis {
  period: "day" | "week" | "month";
  metrics: {
    date: string;
    score: number;
  }[];
  average: number;
  trend: number;
}
```

### זיהוי דפוסים

```typescript
function identifyPatterns(
  historicalFeedback: FeedbackDetails[]
): Record<string, number> {
  return historicalFeedback.reduce((patterns, feedback) => {
    // ניתוח דפוסים בביצועים
    return patterns;
  }, {});
}
```
