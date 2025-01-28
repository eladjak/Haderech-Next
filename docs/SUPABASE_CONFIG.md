# תצורת Supabase - פרויקט "הדרך" 🔌

## 📋 פרטי פרויקט
- **שם פרויקט**: Haderech-Next
- **URL**: https://rxxwoaxxydmwdhgdryea.supabase.co
- **סיסמת מסד נתונים**: h.i8HNWWJF3uCGq

## 🔑 מפתחות API
```typescript
// Anon Public API Key
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ4eHdvYXh4eWRtd2RoZ2RyeWVhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzgwOTM4MDYsImV4cCI6MjA1MzY2OTgwNn0.9P3-3QvdzBGEKWdbfHchPsaJ-pWbG2ag1xEeLd9GXcs'
```

## 🔌 קוד התחברות
```typescript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://rxxwoaxxydmwdhgdryea.supabase.co'
const supabaseKey = process.env.SUPABASE_KEY
const supabase = createClient(supabaseUrl, supabaseKey)
```

## 🔧 הגדרות סביבה
```env
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://rxxwoaxxydmwdhgdryea.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ4eHdvYXh4eWRtd2RoZ2RyeWVhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzgwOTM4MDYsImV4cCI6MjA1MzY2OTgwNn0.9P3-3QvdzBGEKWdbfHchPsaJ-pWbG2ag1xEeLd9GXcs
```

## ⚠️ אבטחה
- אין לחשוף את המפתחות בקוד
- יש להשתמש במשתני סביבה
- יש להגדיר RLS (Row Level Security)
- יש לגבות את מסד הנתונים באופן קבוע

## 📝 הערות
- יש לעדכן את המפתחות בסביבות השונות (פיתוח/ייצור)
- יש לשמור על מדיניות גיבוי סדירה
- יש להקפיד על אבטחת מידע ופרטיות 