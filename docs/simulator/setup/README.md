# ⚙️ התקנה והגדרה - סימולטור תרגול

## 📋 דרישות מערכת

### חומרה מינימלית

- CPU: 2 ליבות
- RAM: 4GB
- דיסק: 10GB פנויים

### תוכנה

- Node.js 18.0.0 ומעלה
- npm או yarn
- PostgreSQL 14 ומעלה
- Redis (אופציונלי, לקאש)

### חשבונות נדרשים

- חשבון OpenAI עם API key
- חשבון Supabase
- חשבון GitHub (לפיתוח)

## 🔧 התקנה

### 1. הורדת הקוד

```bash
# שכפול המאגר
git clone https://github.com/your-username/haderech-next.git

# כניסה לתיקייה
cd haderech-next

# התקנת תלויות
npm install
```

### 2. הגדרת משתני סביבה

```bash
# העתקת קובץ הדוגמה
cp .env.example .env.local

# עריכת הקובץ עם הערכים הנכונים
nano .env.local
```

תוכן `.env.local`:

```env
# OpenAI
OPENAI_API_KEY=your_api_key_here

# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_key

# Redis (אופציונלי)
REDIS_URL=your_redis_url

# הגדרות סימולטור
SIMULATOR_MAX_MESSAGES=100
SIMULATOR_RATE_LIMIT=20
SIMULATOR_MESSAGE_MAX_LENGTH=1000
```

### 3. הגדרת מסד נתונים

```sql
-- הרצת סקריפט ההגדרה
psql -U postgres -d your_database -f supabase/migrations/00-init.sql

-- הרצת סקריפט הנתונים הראשוניים
psql -U postgres -d your_database -f supabase/seed.sql
```

### 4. הרצת בדיקות

```bash
# בדיקות יחידה
npm test simulator

# בדיקות אינטגרציה
npm test:integration simulator

# בדיקות E2E
npm test:e2e simulator
```

## 🚀 הפעלה

### פיתוח

```bash
# הפעלת שרת פיתוח
npm run dev

# הפעלה עם ניטור נוסף
DEBUG=simulator:* npm run dev
```

### ייצור

```bash
# בנייה
npm run build

# הפעלה
npm start
```

## 🔧 תצורה

### הגדרות סימולטור

```typescript
interface SimulatorConfig {
  maxMessages: number; // מספר הודעות מקסימלי לסימולציה
  rateLimit: number; // מספר הודעות מקסימלי לדקה
  messageMaxLength: number; // אורך מקסימלי להודעה
  defaultScenario: string; // תרחיש ברירת מחדל
  feedbackFrequency: number; // תדירות משוב (כל כמה הודעות)
}

const config: SimulatorConfig = {
  maxMessages: 100,
  rateLimit: 20,
  messageMaxLength: 1000,
  defaultScenario: "basic-communication",
  feedbackFrequency: 3,
};
```

### הגדרות OpenAI

```typescript
interface OpenAIConfig {
  model: string; // מודל לשימוש
  temperature: number; // רמת יצירתיות (0-1)
  maxTokens: number; // מספר טוקנים מקסימלי
  presence_penalty: number; // עונש על חזרות
}

const openaiConfig: OpenAIConfig = {
  model: "gpt-4",
  temperature: 0.7,
  maxTokens: 150,
  presence_penalty: 0.6,
};
```

## 🔍 ניטור

### לוגים

```typescript
// הגדרת Winston
import winston from "winston";

const logger = winston.createLogger({
  level: "info",
  format: winston.format.json(),
  defaultMeta: { service: "simulator" },
  transports: [
    new winston.transports.File({ filename: "error.log", level: "error" }),
    new winston.transports.File({ filename: "combined.log" }),
  ],
});

// שימוש
logger.info("Starting simulation", { userId, scenarioId });
logger.error("Simulation error", { error, context });
```

### מטריקות

```typescript
// הגדרת Prometheus
import { Counter, Histogram, Registry } from "prom-client";

const register = new Registry();

const simulationCounter = new Counter({
  name: "simulator_simulations_total",
  help: "Total number of simulations",
  labelNames: ["scenario", "difficulty"],
});

const responseTimeHistogram = new Histogram({
  name: "simulator_response_time_seconds",
  help: "Response time in seconds",
  buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5],
});

register.registerMetric(simulationCounter);
register.registerMetric(responseTimeHistogram);
```

## 🔒 אבטחה

### הגדרות CORS

```typescript
// next.config.js
module.exports = {
  async headers() {
    return [
      {
        source: "/api/simulator/:path*",
        headers: [
          {
            key: "Access-Control-Allow-Origin",
            value: process.env.ALLOWED_ORIGINS || "*",
          },
          {
            key: "Access-Control-Allow-Methods",
            value: "GET, POST, PUT, DELETE, OPTIONS",
          },
          {
            key: "Access-Control-Allow-Headers",
            value: "Content-Type, Authorization",
          },
        ],
      },
    ];
  },
};
```

### הגדרות אבטחה

```typescript
// middleware/security.ts
import { rateLimit } from "express-rate-limit";
import helmet from "helmet";

export const securityMiddleware = [
  helmet(),
  rateLimit({
    windowMs: 15 * 60 * 1000, // 15 דקות
    max: 100, // מספר בקשות מקסימלי
  }),
];
```

## 🔄 גיבוי ושחזור

### גיבוי נתונים

```bash
# גיבוי מסד נתונים
pg_dump -U postgres -d simulator > backup.sql

# גיבוי קבצי מדיה
rsync -av media/ backup/media/

# גיבוי לוגים
tar -czf logs.tar.gz logs/
```

### שחזור נתונים

```bash
# שחזור מסד נתונים
psql -U postgres -d simulator < backup.sql

# שחזור קבצי מדיה
rsync -av backup/media/ media/

# שחזור לוגים
tar -xzf logs.tar.gz
```

## 🐛 פתרון בעיות

### בעיות נפוצות

1. **בעיית חיבור ל-OpenAI**

   ```typescript
   // בדיקת חיבור
   async function checkOpenAIConnection() {
     try {
       await openai.chat.completions.create({
         model: "gpt-4",
         messages: [{ role: "user", content: "test" }],
       });
       console.log("OpenAI connection successful");
     } catch (error) {
       console.error("OpenAI connection failed:", error);
     }
   }
   ```

2. **בעיות זיכרון**

   ```typescript
   // ניטור זיכרון
   function monitorMemory() {
     const used = process.memoryUsage();
     console.log({
       rss: `${Math.round(used.rss / 1024 / 1024)}MB`,
       heapTotal: `${Math.round(used.heapTotal / 1024 / 1024)}MB`,
       heapUsed: `${Math.round(used.heapUsed / 1024 / 1024)}MB`,
     });
   }
   ```

3. **בעיות ביצועים**
   ```typescript
   // ניטור ביצועים
   async function checkPerformance() {
     const start = performance.now();
     // פעולה כלשהי
     const duration = performance.now() - start;
     if (duration > 500) {
       console.warn(`Performance issue: ${duration}ms`);
     }
   }
   ```

## 📚 משאבים נוספים

- [תיעוד OpenAI](https://platform.openai.com/docs)
- [תיעוד Supabase](https://supabase.io/docs)
- [מדריך פיתוח](DEVELOPMENT.md)
- [מדריך תרחישים](SCENARIOS.md)
- [מדריך משוב](FEEDBACK.md)
