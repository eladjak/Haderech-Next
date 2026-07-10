# 📚 פרויקט: הדרך נקסט - מערכת לימודים

## התפקיד שלך
אתה מפתח Full-Stack ומומחה EdTech בבניית מערכות לימודים מתקדמות.

## המשימה
לבנות את מערכת הלימודים של "הדרך נקסט" - פלטפורמה ללמידה אונליין בעברית.

---

## 🎨 BRAND — חלק מאקוסיסטם אומנות הקשר

> חוק קשיח (Sprint 2026-05-15): פלטפורמת הקורס חייבת להיראות ולהתנהג כחלק
> מאותה משפחה של `omanut-hakesher-website`. לקוח שעובר בין הדומיינים צריך לחוש
> שזה אותו מותג ואותו אלעד.

**קרא לפני כל שינוי עיצוב:**
1. `~/projects/omanut-hakesher-website/.claude/BRAND.md` — מקור האמת לטוקנים, Header, Footer, מערכת מוטיב
2. `~/projects/omanut-hakesher-website/.claude/ECOSYSTEM-UNIFICATION-PLAN.md` — 7 פאזות איחוד, ~3.5h
3. `~/projects/omanut-hakesher-website/.claude/scrape/HADERECH_ALIGNMENT.md` — 8 swaps קונקרטיים

**אסור (off-brand):**
- `#2563EB` royal blue · `#14B8A6` teal · `#F7F9FC` cool-gray bg
- `rounded-xl` buttons (חייב pill `rounded-full`)
- gradient text/buttons ללא אישור
- `font-style: italic` על Hebrew serif

**מותר ולא להעביר ל-omanut:** framer-motion stagger, `card-hover`, `shimmer-effect`,
תצוגות LMS צפופות (`student/dashboard`, `admin/`), Clerk auth UI. אסור להעביר
gender-themes ל-LMS — מעבר מצבי-מגדר באמצע שיעור עוין למשתמש.

---

## 🔴 חובה בכל סשן:

### בהתחלה:
1. **קרא את `.claude/SESSION_PROGRESS.md`** - לראות איפה עצרנו
2. בדוק `git status` או קבצים שהשתנו לאחרונה
3. הצג: "סטטוס הפיתוח, באגים פתוחים, הצעד הבא"

### במהלך העבודה:
- תעד כל שינוי קוד משמעותי
- שמור התקדמות כל 10-15 הודעות
- אם הקונטקסט מתמלא - עדכן SESSION_PROGRESS.md ודחוס

### בסיום:
- עדכן `.claude/SESSION_PROGRESS.md` עם: קבצים שנערכו, פיצ'רים שהושלמו, באגים, TODO

---

## 🛠 טכנולוגיות שנבחרו:

| רכיב | טכנולוגיה | סטטוס |
|------|-----------|-------|
| Frontend | Next.js 16 + App Router | ✅ |
| Language | TypeScript | ✅ |
| Styling | Tailwind CSS 4 + Heebo font | ✅ |
| Backend | **Convex** (real-time DB) | ✅ מותקן, ⏳ צריך הגדרה |
| Auth | **Clerk** (Hebrew localization) | ✅ מותקן, ⏳ צריך הגדרה |
| Package Manager | npm (bun לא עובד במערכת זו) | ✅ |

---

## 📁 מבנה חשוב:

```
.claude/SESSION_PROGRESS.md  ← מעקב התקדמות מפורט
convex/                      ← Backend schema + functions
src/app/                     ← Next.js pages
src/components/              ← React components
.env.local.example           ← תבנית משתני סביבה
```

---

## 🎯 פיצ'רים מרכזיים (לפי עדיפות):

### Phase 1 - Core (בעבודה)
- [x] Landing page
- [x] Auth pages (Clerk)
- [x] Courses list
- [x] Dashboard
- [ ] Course detail page
- [ ] Lesson player + progress

### Phase 2 - UX
- [ ] Video player with tracking
- [ ] Continue where left off
- [ ] Completion certificates

### Phase 3 - Admin
- [ ] Course management
- [ ] Content upload
- [ ] User management

---

## ⚠️ הערות חשובות:

1. **bun לא עובד** - השתמש ב-`npm` במערכת זו
2. **Convex types** - יווצרו רק אחרי `npx convex dev`
3. **RTL** - כבר מוגדר ב-layout.tsx
4. **Hebrew font** - Heebo מוגדר ועובד

---

## 🔗 יכולות מ-~/.claude/:

- **Agents:** planner, code-reviewer, tdd-guide
- **Skills:** convex, ui-skills, better-auth
- **MCPs:** Context7, Octocode, Convex MCP
- **Rules:** codebase-exploration, error-handling, self-check

---

## UI/Design Tools (MANDATORY - Feb 2026)

### Google Stitch MCP (USE FOR ALL UI WORK)
Before designing ANY UI component, page, or layout:
1. Use Stitch MCP tools: `build_site`, `get_screen_code`, `get_screen_image`
2. Generate designs in stitch.withgoogle.com first, then pull code via MCP
3. Use `/enhance-prompt` skill to optimize prompts for Stitch
4. Use `/design-md` skill to document design decisions
5. Use `/react-components` skill to convert Stitch designs to React

### Available Design Skills
- `/stitch-loop` - Generate multi-page sites from a single prompt
- `/enhance-prompt` - Refine UI ideas into Stitch-optimized prompts
- `/design-md` - Create design documentation from Stitch projects
- `/react-components` - Convert Stitch screens to React components
- `/shadcn-ui` - shadcn/ui component integration guidance
- `/remotion` - Create walkthrough videos from designs
- `/omc-frontend-ui-ux` - Designer-developer UI/UX agent

### Rule: NEVER design UI from scratch with Claude tokens. Always use Stitch MCP or v0.dev first!

## Design & Quality Stack (Feb 2026)

### Mandatory Design Workflow
1. **Stitch MCP** - Design screens BEFORE coding UI
2. **ReactBits** (reactbits.dev) - Animated interactive components
3. **shadcn/ui** - Base UI primitives

### Quality Gates (run before completing ANY UI task)
- React Doctor: `npx -y react-doctor@latest .` (security, perf, correctness, architecture)
- TypeScript: `bunx tsc --noEmit`
- Accessibility: check aria-labels, keyboard nav, focus states

### Animation Rules
- Framer Motion or CSS transforms only
- Max 200ms for feedback animations
- No width/height/top/left animations - use transform/opacity


---

## Iteration Protocol (MANDATORY)

This project follows the global iteration protocol:
- Reference: `~/.claude/rules/iteration-protocol.md`
- Update `PROGRESS.md` every 10-15 exchanges
- End every session with verification + HTML review
- Non-negotiable: PROGRESS.md must be updated before session ends


---

## 🏭 AI Factory / Agent Network (Sprint 5, Apr 2026)

See `~/.claude/AI_FACTORY_ARCHITECTURE.md` for full details.

**Delegator API** (http://37.27.31.1:3900) — single entry point for content/research/messaging:
- `/pipeline/full` — research + landing page + email + social post in 78s
- `/content-studio/generate` — AI content pipeline (Sanity + 10 brands)
- `/sms/send` — Rav Messer Israeli SMS
- `/postiz/post` — multi-platform social publish
- `/drive/search`, `/calendar/check` — Google (OAuth configured)

**10 agents**: Kami (WA :3001), Kaylee (infra :18789), Claude Code, CrewAI (:8001), Dashboard, + Hermes / n8n / Ollama / Uptime Kuma / Coolify

**Public URLs**: kami.eladjak.com · content-social.eladjak.com · pages.fullstack-eladjak.co.il · studio.fullstack-eladjak.co.il

When building features that need content, publishing, messaging, or research — call the delegator instead of reimplementing.

