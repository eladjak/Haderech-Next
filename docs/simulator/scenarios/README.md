# 🎯 תרחישי סימולציה

## 📋 סקירה כללית

תרחישי הסימולציה מאפשרים למשתמשים לתרגל מיומנויות תקשורת במגוון מצבים. כל תרחיש מכיל מטרות למידה, קריטריוני הצלחה ומדדי התקדמות.

## 🏷 קטגוריות

### תקשורת בסיסית

- תרגול אמפתיה
- הקשבה פעילה
- מתן משוב

### פתרון בעיות

- זיהוי בעיות
- ניתוח מצבים
- הצעת פתרונות

### ניהול קונפליקטים

- הרגעת מצבים
- גישור
- משא ומתן

### מנהיגות

- הנחיית צוות
- קבלת החלטות
- מוטיבציה

## 📊 רמות קושי

### מתחיל (Beginner)

- משך: 5-15 דקות
- ציון מינימלי: 70
- מיקוד: מיומנויות בסיסיות

### מתקדם (Intermediate)

- משך: 10-20 דקות
- ציון מינימלי: 80
- מיקוד: מצבים מורכבים

### מומחה (Advanced)

- משך: 15-30 דקות
- ציון מינימלי: 90
- מיקוד: תרחישים מאתגרים

## 🎮 דוגמאות לתרחישים

### תרחיש בסיסי: הקשבה פעילה

```typescript
const scenario: SimulatorScenario = {
  id: "active-listening-101",
  title: "תרגול הקשבה פעילה",
  description: "למד להקשיב ולהגיב בצורה אמפתית",
  difficulty: "beginner",
  category: "תקשורת",
  tags: ["הקשבה", "אמפתיה"],
  initial_message: "היי, היה לי יום קשה בעבודה...",
  learning_objectives: ["פיתוח יכולת הקשבה", "זיהוי רגשות", "תגובה אמפתית"],
  success_criteria: {
    minScore: 70,
    requiredSkills: ["הקשבה", "אמפתיה"],
    minDuration: 300,
    maxDuration: 900,
  },
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};
```

### תרחיש מתקדם: פתרון קונפליקט

```typescript
const scenario: SimulatorScenario = {
  id: "conflict-resolution-201",
  title: "פתרון קונפליקט בצוות",
  description: "נהל שיחה עם שני עובדים בקונפליקט",
  difficulty: "intermediate",
  category: "ניהול קונפליקטים",
  tags: ["גישור", "פתרון בעיות", "תקשורת"],
  initial_message: "יש מתח בין שני חברי צוות שמקשה על העבודה...",
  learning_objectives: [
    "זיהוי מקור הקונפליקט",
    "הנחיית שיחה בונה",
    "הגעה לפתרון מוסכם",
  ],
  success_criteria: {
    minScore: 80,
    requiredSkills: ["גישור", "ניהול שיחה", "פתרון בעיות"],
    minDuration: 600,
    maxDuration: 1200,
  },
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};
```

### תרחיש מומחה: מנהיגות בזמן משבר

```typescript
const scenario: SimulatorScenario = {
  id: "crisis-leadership-301",
  title: "ניהול צוות במשבר",
  description: "הובל את הצוות דרך משבר ארגוני",
  difficulty: "advanced",
  category: "מנהיגות",
  tags: ["מנהיגות", "קבלת החלטות", "ניהול משבר"],
  initial_message: "החברה נמצאת במשבר כלכלי ועלינו לבצע שינויים משמעותיים...",
  learning_objectives: [
    "תקשורת ברורה בזמן משבר",
    "קבלת החלטות תחת לחץ",
    "שמירה על מורל הצוות",
  ],
  success_criteria: {
    minScore: 90,
    requiredSkills: ["מנהיגות", "תקשורת משברית", "קבלת החלטות"],
    minDuration: 900,
    maxDuration: 1800,
  },
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};
```

## 📈 מדדי הערכה

### אמפתיה (20%)

- זיהוי רגשות
- הבעת הבנה
- תמיכה רגשית

### בהירות (20%)

- מסרים ברורים
- שפה מובנת
- מבנה לוגי

### אפקטיביות (20%)

- השגת מטרות
- פתרון בעיות
- תוצאות מעשיות

### התאמה (15%)

- התאמה להקשר
- רגישות תרבותית
- שימוש נכון בשפה

### מקצועיות (15%)

- שמירה על גבולות
- אתיקה מקצועית
- יציבות רגשית

### פתרון בעיות (10%)

- זיהוי בעיות
- ניתוח מצבים
- הצעת פתרונות

## 🎓 התקדמות

### רמות

1. מתחיל (0-300 נקודות)
2. מתקדם (301-600 נקודות)
3. מומחה (601-1000 נקודות)
4. מאסטר (1001+ נקודות)

### הישגים

- השלמת 10 תרחישים
- ציון מושלם
- שרשרת הצלחות
- מומחיות בקטגוריה

## 🛠 יצירת תרחיש חדש

### תבנית בסיסית

```typescript
interface SimulatorScenario {
  id: string;
  title: string;
  description: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  category: string;
  tags: string[];
  initial_message: string;
  learning_objectives: string[];
  success_criteria: {
    minScore: number;
    requiredSkills: string[];
    minDuration: number;
    maxDuration: number;
  };
  created_at: string;
  updated_at: string;
}
```

### שיקולי תכנון

1. הגדר מטרות למידה ברורות
2. התאם את רמת הקושי לקהל היעד
3. צור תרחיש מציאותי ורלוונטי
4. הגדר קריטריוני הצלחה מדידים
5. תכנן מסלול התקדמות הגיוני

## 📝 תיעוד תרחישים

### מבנה תיקיות

```
scenarios/
├── beginner/
│   ├── active-listening/
│   ├── basic-communication/
│   └── empathy/
├── intermediate/
│   ├── conflict-resolution/
│   ├── problem-solving/
│   └── team-management/
└── advanced/
    ├── crisis-management/
    ├── leadership/
    └── strategic-communication/
```

### קובץ תיעוד

```markdown
# תרחיש: [שם התרחיש]

## תיאור

[תיאור מפורט של התרחיש]

## מטרות למידה

- מטרה 1
- מטרה 2
- מטרה 3

## קריטריוני הצלחה

- קריטריון 1
- קריטריון 2
- קריטריון 3

## תסריט מומלץ

1. שלב 1
2. שלב 2
3. שלב 3

## הערות נוספות

[הערות והמלצות למשתמש]
```
