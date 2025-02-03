# הנחיות AI - HaDerech Next 🤖

## סקירה כללית 📋

מסמך זה מפרט את ההנחיות לשימוש ב-AI בפרויקט הדרך, כולל הגדרות, תבניות, ודוגמאות.

## הגדרות בסיסיות ⚙️

### 1. מודל
```typescript
// הגדרות OpenAI
const config = {
  model: 'gpt-4',
  temperature: 0.7,
  max_tokens: 2000,
  top_p: 1,
  frequency_penalty: 0,
  presence_penalty: 0,
};
```

### 2. הקשר
```typescript
// הגדרת הקשר
const context = {
  role: 'system',
  content: `אתה עוזר לימודי בפלטפורמת הדרך.
  תפקידך לסייע בלמידה, לענות על שאלות,
  ולתת משוב בונה. עליך להיות:
  - מקצועי אך ידידותי
  - ברור ומדויק
  - סבלני ותומך
  - מעודד חשיבה עצמאית`,
};
```

## תבניות הנחיה 📝

### 1. שאלות ותשובות
```typescript
// תבנית לשאלות ותשובות
const qaTemplate = `
שאלה: {question}

עליך לענות בפורמט הבא:
1. תשובה קצרה וברורה
2. הסבר מפורט
3. דוגמה מעשית
4. מקורות נוספים ללמידה

זכור:
- להשתמש בשפה פשוטה
- לתת דוגמאות רלוונטיות
- להפנות למקורות אמינים
`;
```

### 2. משוב על תרגילים
```typescript
// תבנית למשוב
const feedbackTemplate = `
תרגיל: {exercise}
פתרון התלמיד: {solution}

עליך לתת משוב בפורמט הבא:
1. ציון כללי (1-100)
2. נקודות חוזק
3. נקודות לשיפור
4. המלצות ספציפיות
5. משימות המשך

זכור:
- להיות בונה ומעודד
- לתת דוגמאות מעשיות
- להציע דרכי שיפור
`;
```

## דוגמאות שימוש 🎯

### 1. שאלה ותשובה
```typescript
// דוגמה לשאלה ותשובה
const question = {
  role: 'user',
  content: 'מהי תקשורת אפקטיבית בזוגיות?',
};

const answer = {
  role: 'assistant',
  content: `
תשובה קצרה:
תקשורת אפקטיבית היא היכולת להעביר ולקבל מסרים בצורה ברורה ומכבדת.

הסבר מפורט:
תקשורת אפקטיבית כוללת:
1. הקשבה פעילה
2. שיקוף רגשות
3. שימוש ב"אני" במקום "אתה"
4. זיהוי צרכים
5. פתרון קונפליקטים

דוגמה מעשית:
במקום: "אתה אף פעם לא עוזר בבית"
עדיף: "אני מרגישה עמוסה וצריכה עזרה במטלות הבית"

מקורות נוספים:
1. ספר "שפת הג'ירפה"
2. סדנאות תקשורת זוגית
3. מאמרים מקצועיים בנושא
  `,
};
```

### 2. משוב על תרגיל
```typescript
// דוגמה למשוב
const exercise = {
  role: 'user',
  content: `
תרגיל: תרגול הקשבה פעילה
פתרון: שיקפתי את דברי בן/בת הזוג והצעתי פתרון
  `,
};

const feedback = {
  role: 'assistant',
  content: `
ציון: 85

נקודות חוזק:
✅ שימוש נכון בשיקוף
✅ יוזמה בהצעת פתרון
✅ גישה חיובית

נקודות לשיפור:
📝 להוסיף זיהוי רגשות
📝 לחכות לפני הצעת פתרון
📝 לשאול שאלות מבהירות

המלצות ספציפיות:
1. התחל עם "אני שומע ש..."
2. שאל "איך אתה מרגיש עם זה?"
3. תן זמן לתגובה

משימות המשך:
1. תרגול שיקוף רגשות
2. הקשבה ללא פתרונות
3. זיהוי צרכים
  `,
};
```

## כללי שימוש 📋

### 1. הנחיות כלליות
```typescript
// כללים לשימוש ב-AI
const guidelines = {
  do: [
    'השתמש בשפה פשוטה וברורה',
    'תן דוגמאות מעשיות',
    'הצע פתרונות יישומיים',
    'עודד חשיבה עצמאית',
    'שמור על פרטיות',
  ],
  dont: [
    'אל תיתן עצות רפואיות',
    'אל תחליף ייעוץ מקצועי',
    'אל תשפוט או תבקר',
    'אל תחשוף מידע אישי',
    'אל תיצור תלות',
  ],
};
```

### 2. מגבלות
```typescript
// מגבלות השימוש
const limitations = {
  maxQuestions: 5,    // מקסימום שאלות ברצף
  maxTime: 30,        // מקסימום דקות לשיחה
  topicsToAvoid: [
    'רפואה',
    'משפטים',
    'פסיכיאטריה',
    'מצבי חירום',
  ],
};
```

## אבטחה ופרטיות 🔒

### 1. הגנה על מידע
```typescript
// הגנה על מידע
const security = {
  // הסרת מידע אישי
  sanitizeInput: (text: string) => {
    return text.replace(
      /\b[\w\.-]+@[\w\.-]+\.\w{2,4}\b/g,
      '[EMAIL]'
    );
  },
  
  // בדיקת תוכן רגיש
  checkSensitiveContent: (text: string) => {
    const sensitivePatterns = [
      /\b\d{9}\b/,          // תעודת זהות
      /\b\d{16}\b/,         // כרטיס אשראי
      /\b\d{10}\b/,         // טלפון
    ];
    
    return sensitivePatterns.some(pattern => 
      pattern.test(text)
    );
  },
};
```

### 2. הרשאות
```typescript
// ניהול הרשאות
const permissions = {
  student: {
    canAsk: true,
    canShare: false,
    maxQuestions: 10,
  },
  teacher: {
    canAsk: true,
    canShare: true,
    maxQuestions: 20,
  },
  admin: {
    canAsk: true,
    canShare: true,
    maxQuestions: -1,
  },
};
```

## ניטור ושיפור 📊

### 1. מדדי שימוש
```typescript
// מדידת שימוש
const metrics = {
  trackUsage: (interaction: Interaction) => {
    analytics.track({
      userId: interaction.userId,
      type: interaction.type,
      duration: interaction.duration,
      satisfaction: interaction.satisfaction,
      timestamp: new Date(),
    });
  },
};
```

### 2. משוב משתמשים
```typescript
// איסוף משוב
const feedback = {
  collectFeedback: async (session: Session) => {
    return {
      helpful: await askUser('האם התשובה עזרה?'),
      clear: await askUser('האם התשובה הייתה ברורה?'),
      actionable: await askUser('האם קיבלת כלים מעשיים?'),
      comments: await askUser('הערות נוספות?'),
    };
  },
};
```

## סיכום 📝

### מטרות
1. תמיכה בלמידה
2. מתן משוב בונה
3. עידוד חשיבה עצמאית
4. שמירה על פרטיות
5. שיפור מתמיד

### המלצות
1. עדכון הנחיות
2. הרחבת תבניות
3. שיפור אבטחה
4. ניטור שימוש
5. איסוף משוב 