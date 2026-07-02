# הדרך נקסט - מערכת לימודים - התקדמות

## 2026-07-02 — Phase 19: FREE-tier live AI (Gemini) for Advisor+Simulator + symmetric lesson↔simulator sync ✅ (autonomous, branch feat/advanced-course-experience)

**מטרה:** להביא את שני הבידולים המרכזיים (הסימולטור + היועץ החכם בכל שיעור) למצב השלם ביותר האפשרי בלי אלעד (בלי מפתחות/צילומים/סליקה). בנוי על Phase 18, לא שכתוב.

### 1. שכבת AI חינמית משותפת (`convex/lib/llm.ts`) — NEW
- `generateChat` — נקודת כניסה אחת עם סולם ספקים + degradation חינני: **Gemini 3.5 Flash (free-tier) מועדף → Claude Haiku 4.5 (בתשלום) → null** (ואז כל קורא נופל לתבנית/היוריסטיקה שלו). מדגים בדיוק את דפוס ה-FAQ המוכח (`thinkingBudget:0`).
- פונקציות טהורות ונבדקות: `selectLlmProvider`, `hasLlmKey`, `buildGeminiPrompt`, `readLlmKeys`.
- **🔑 איפה המפתח נכנס (Convex env — Gemini חינם):** `npx convex env set GEMINI_API_KEY ...` (או `ANTHROPIC_API_KEY`). ללא מפתח — הכל עובד בתבניות (זה נתיב ה-prod היום). זה סוגר את פריט ה-backlog של Phase 18 ("Gemini free-tier path").

### 2. חיווט השכבה לכל שלושת משטחי ה-AI
- **`convex/advisor.ts`** (`ask`) — הוחלף בלוק ה-Anthropic-בלבד ב-`generateChat`. `usedAi` נגזר מ-provider.
- **`convex/aiSimulator.ts`** — persona + analysis עוברים דרך `generateChat`, מקבלים שני מפתחות, ומחזירים `null` בכשל/היעדר-ספק (הקורא נופל להיוריסטיקה).
- **`convex/simulator.ts`** — persona ב-`sendMessage` וניתוח ב-`endSession` דרך `hasLlmKey` + `generateChat`; הניתוח נשען על scorer היוריסטי חדש.
- **`convex/chat.ts`** (מאמן /chat) — גם הוא הועבר ל-`generateChat` לעקביות.
- **`convex/lib/simulatorScoring.ts`** (NEW) — חילוץ ה-scorer ההיוריסטי לפונקציה טהורה נבדקת (`scoreConversationHeuristic`).

### 3. סנכרון שיעור↔סימולטור סימטרי + לולאת משוב
- **סכימה:** `dialogueSessions.lessonId` (optional) — סימטרי ל-`simulatorSessions.lessonId` (הדיאלוג המובנה איבד את ה-lessonId עד עכשיו).
- **`startSimulation`** מקבל+שומר `lessonId`; דף הדיאלוג מעביר `lessonId` מה-URL.
- **`getLessonPracticeStats`** (query) — כמה תרגולים (2 סוגי סימולטור) רץ המשתמש מהשיעור + הציון הכי טוב.
- **`LessonAdvisor`** מציג "תרגלת X פעמים מהשיעור הזה · הציון הכי טוב שלך: Y" — סוגר ויזואלית את לולאת שיעור→תרגול.

### 4. היועץ בכל משטח שיעור (כיסוי מלא)
- אומת: `/courses/[courseId]/learn` + `/courses/[courseId]/lessons/[lessonId]` כבר נשאו את היועץ (Phase 18).
- **תוקן:** משטח השיעור הישן `/course/[id]/lesson/[lessonId]` (viewer מ-Phase 4) **חסר** את היועץ → נוסף. עכשיו כל שלושת משטחי-השיעור נושאים את היועץ.

### שערים ואימות (verbatim)
- `npx tsc --noEmit` → **0 שגיאות**.
- `npx vitest run` → **174 עוברים** (9 קבצים; +16 חדשים: 11 ב-llm.test + 5 ב-simulator-scoring.test).
- `npm run build:local` → **✓ Compiled successfully**, 73 עמודים סטטיים, כל מסלולי הסימולטור + `/course/[id]/lesson/[lessonId]` נבנים.
- לא נפרס, לא commit ל-master, לא נגעתי ב-Clerk-prod/סליקה. commit מקומי לענף feat/advanced-course-experience בלבד.

### מה עדיין דורש אלעד
- **AI חי:** `npx convex env set GEMINI_API_KEY <free-key>` (או ANTHROPIC) → היועץ+הסימולטור עוברים מתבנית לחי. (בלי זה — עובד בתבניות, מדגים מלא.)
- **סכימת Convex:** `dialogueSessions.lessonId` היא תוספת (additive) — דורשת `npx convex deploy` כדי לעלות לפרוד (בטוח, ללא מחיקת אינדקסים).
- ללא שינוי: Clerk-prod, Sumit credentials, סרטונים.

---

## 2026-06-13 — Phase 18: Smart Advisor (lesson-context-aware) + synced Dating Simulator ✅ (autonomous)

**Vision shipped (per Elad's plan):** an in-course **Smart Advisor** that adapts to the exact lesson the user is on, the built-in **Dating Simulator**, and the **sync** between them — all referencing one shared lesson/phase context. Built on the existing 75-lesson/12-quiz Convex+Clerk base; auth-gating on the 49 mutations preserved.

### 1. Smart Advisor — context-aware + FREE-DEGRADATION
- **`convex/lib/advisorTemplates.ts`** (NEW) — the free-degradation "brain". A 6-phase map of "הדרך" (גישה→תקשורת→משיכה ומעבר→חיבור וכימיה→מחויבות), each with core concepts, the trained skill, Elad-voice opener, "apply-it" prompts, and a simulator category. Two builders: `buildAdvisorSystemPrompt` (lesson-aware system prompt, used as the live-AI scaffold) and `buildTemplateReply` (deterministic intent-routed reply in Elad's voice — greeting/rejection/stuck/how-to/summary/practice). **Works with NO API key.**
- **`convex/advisor.ts`** (NEW) — `getLessonContext` (shared lesson+phase+progress context; the single source of truth), `getRecommendedScenario` (sync bridge: lesson phase → best simulator scenario), and `ask` (free-degrading turn returning `{reply, usedAi, suggestSimulator}`; Claude when `ANTHROPIC_API_KEY` present, template otherwise; graceful degradation on any AI failure).
- **`convex/chat.ts`** — coach sessions now carry `lessonId/courseId` and build a lesson-aware system prompt; `sendMessage` **free-degrades instead of throwing** when no key (was a hard `throw`).
- **`src/components/lesson/lesson-advisor.tsx`** (NEW) — collapsible advisor panel embedded in the lesson player. Shows the phase badge + trained skill, quick prompts, a simulator CTA, RTL, a11y (aria-expanded/live, labeled controls), transform/opacity-only animation.

### 2. Dating Simulator — completed + free-degradation
- **`convex/aiSimulator.ts`** — **fixed 404 model** (`claude-3-5-haiku-20241022` → `claude-haiku-4-5-20251001`) + sonnet fallback on 429/5xx.
- **`convex/simulator.ts`** — persona/turn-aware no-key fallback for `sendMessage`; **heuristic scoring fallback** for `endSession` (rewards engagement/questions/depth) so the feedback loop works without a key; `simulatorSessions.lessonId` links practice back to the lesson.
- **Seeded prod content** (was EMPTY): 4 structured-dialogue scenarios + 6 free-chat scenarios → simulator now runs end-to-end.

### 3. Sync
- advisor ↔ simulator ↔ lesson all read the same `getLessonContext`. Lesson → simulator deep-link carries `lessonId`/`from=lesson` with a "sent here to practice" banner on BOTH simulator flows. `getRecommendedScenario` maps phase→scenario (verified: lesson phase-1 → "דייט ראשון בבית קפה", skill "מודעות עצמית והצבת גבולות").

### Gates & verification
- `npx tsc --noEmit` → 0 errors · `npm run build:local` → ✅ (Compiled successfully) · `npx vitest run` → **158 pass** (+11 new advisor-template tests).
- **Convex deployed** to prod (`npx convex deploy` — schema validation OK, no index deletions).
- **Free-degradation proven LIVE on prod** (no AI key set in Convex env, so this IS the prod path): `advisor:ask` returned a reply naming the exact live lesson "פתיחת המסע..." + phase "גישה" + concepts, with `usedAi:false`, `suggestSimulator` correct. Rejection/summary intents verified too.
- Commit `9477f5a` pushed to master (auto-deploys). Only the 12 Phase-18 files staged — Phase-14 uncommitted files left untouched.

### ⚠️ KNOWN BLOCKER (needs Elad — pre-existing, NOT from this work)
- **Clerk DEV-instance on prod:** the live lesson/course-detail pages (any `useUser()` page) stall on a loading skeleton because **`Clerk: Failed to load Clerk (failed_to_load_clerk_js_timeout)`** in crawlers/headless. `ConvexProviderWithClerk` blocks ALL Convex queries until Clerk auth resolves → skeleton never clears. The public `/courses` catalog (no `useUser()`) renders fine. The advisor frontend is correctly wired and will render for real signed-in users; verified the backend independently via CLI. **Fix = Elad re-flags Clerk to a PRODUCTION instance** (credential action, can't be done autonomously).
- **Full-AI advisor** = add `ANTHROPIC_API_KEY` (or wire Gemini) to Convex env (`npx convex env set ANTHROPIC_API_KEY ...`). Until then the (good) template advisor runs.

### Phased backlog (not in this pass)
- Persist the inline lesson-advisor turns to a `chatSessions` thread (currently stateless per lesson visit; the full `/chat` history flow already persists).
- Wire a Gemini free-tier path into `advisor.ask` (mirror the Pollr pattern) for a free live-AI upgrade without Anthropic spend.
- Add lessonId to `dialogueSessions` for symmetric sync analytics; surface "practiced X scenarios from this lesson" on the lesson page.
- Per-phase dedicated simulator scenarios (currently maps to nearest by category/difficulty).

---

## 2026-06-12 — Vercel productionBranch switched main→master (Shabbat autonomous, Fable-5) ✅
- **Done via undocumented-but-staff-sanctioned API:** `PATCH https://api.vercel.com/v9/projects/prj_xSpLffGWUveGwS6TQFVkumZX26jg/branch?teamId=team_T6dJ4LNsyZ8LDt9uU9Po1exz` body `{"branch":"master"}` (Vercel CLI token). Verified by GET: `link.productionBranch` was `main` → now `master`.
- **Auto-deploy proven:** pushed empty commit `829ab97` to `origin/master` → Vercel auto-built it as PRODUCTION (QUEUED→BUILDING→READY, ~7 min) → prod target now serves `829ab97 (master)`. Live `haderech-next.vercel.app` = 200, title intact. Pushes to master now deploy automatically; the abandoned `main` (next 14 history) no longer controls prod.
- Note: working tree still carries uncommitted Phase-14 session changes (13 files) — untouched, not swept into any commit.

---

## 2026-05-28 — entry from deep-work session
**FAQ chat widget shipped.** New `/api/chat-faq/route.ts` (gemini-3.5-flash + thinkingBudget:0 + 600 tokens, same proven config). New `<FAQChat>` client component on `/faq` page. Pending Elad: GEMINI_API_KEY in Vercel env (graceful fallback without it). CV file refreshed with Workshops & Education variant.

---


## סטטוס: in_progress
## עדכון אחרון: 2026-05-14

## מצב נוכחי
Phase 1-14 הושלמו. Convex + Clerk מחוברים. **Phase 14 (2026-05-14):** Hardening + AI Coach model upgrade + Sumit migration + מספרים אמיתיים בלבד. TypeScript עובר 0 שגיאות, 147 בדיקות עוברות (+16 חדשים), build נקי, 30 עמודים (+1 sumit webhook).

## מה בוצע - Phase 14 Hardening + AI Coach + Sumit + Real Numbers (סשן 2026-05-14)

### מספרים אמיתיים (URGENT — Elad asked "להחזיר!")
- [x] **`src/app/admin/page.tsx`** - הוסר `mockStats` + `mockRecentActivity` fallback. במקום מספרים מפוברקים, מציג zeros + "טוען נתונים אמיתיים..." בזמן טעינה. `convexStats ?? mockStats` → `convexStats ?? EMPTY_STATS` (zeros).
- [x] **`src/app/admin/students/page.tsx`** - `convexStudents ?? mockStudents` → `convexStudents ?? []` עם state `isLoading`. הקיפוץ ל-mockStudents יצא, רק real Convex.
- [x] **`src/app/admin/courses/page.tsx`** - `convexCourses ?? mockCourses` → `convexCourses ?? []` עם `isLoadingCourses`.
- [x] **`src/app/admin/courses/[courseId]/lessons/page.tsx`** - `convexLessons ?? mockLessons` → `convexLessons ?? []` עם `isLoadingLessons`.
- [x] **`src/app/admin/courses/[courseId]/quizzes/page.tsx`** - אותו תיקון, real-data-only.
- [x] בכל הדפים: title bar מציג "טוען..." בזמן טעינה במקום ספירה מזויפת.
- [x] עמוד `/student/analytics` כבר היה real (Convex queries לכל מקום). אומת.
- [x] עמוד `/dashboard` כבר היה real. אומת.

### AI Coach
- [x] **`convex/chat.ts`** - מודל שודרג מ-`claude-3-5-haiku-20241022` (returns 404 per ~/.claude memory) ל-`claude-haiku-4-5-20251001` (זמין).
- [x] **Fallback** - על 429 או 5xx נסיון חוזר עם `claude-sonnet-4-6-20251022`.
- [x] תשתית קיימת: `/chat` page + 3 modes (coach/practice/analysis) + Convex chatSessions+chatMessages + sendMessage action — הכל פעיל.
- [x] System prompts בעברית עם persona "אומנות הקשר".

### Sumit migration (Stripe → Sumit, Israeli payment + invoice)
- [x] **`src/lib/sumit.ts`** (NEW) - מודול לקוח Sumit: `SUMIT_PLANS` (basic ₪149 / premium ₪299 / VIP ₪599), `createSumitCheckout` (hosted-tashlumim), `isSumitConfigured`, `verifySumitWebhook` (HMAC-SHA256 via Web Crypto). מודע ל-recurring 12 חודשים + `autoIssueInvoice:true` (חשבונית מס אוטומטית).
- [x] **`convex/sumit.ts`** (NEW) - Convex action `createCheckoutSession` (החליף את stripe), internal mutation `handleSubscriptionUpdate`. ללא credentials → returns `{status:"credentials_pending"}` עם הודעה ברורה במקום לכשל.
- [x] **`convex/_generated/api.d.ts`** - רישום מודול sumit.
- [x] **`src/app/api/sumit/webhook/route.ts`** (NEW) - webhook handler עם signature verification + rate limit. החזרת 401 לחתימה לא תקפה, 429 ל-rate limit, 200 לאישור.
- [x] **`src/app/pricing/page.tsx`** - הפנייה מ-`api.stripe.createCheckoutSession` ל-`api.sumit.createCheckoutSession`. הוסף `checkoutNotice` UI להציג "מערכת תשלומים בהקמה" כשאין credentials.
- [x] **`convex/stripe.ts`** - סומן @deprecated, כפי שמופיע ב-comment header. מחזיר notice "מערכת התשלומים בתהליך החלפה ל-Sumit".
- [x] **BLOCKED ON CREDENTIALS** - הקוד מוכן 100% אבל מחכה ל-`SUMIT_API_TOKEN` + `SUMIT_ORG_ID` + `SUMIT_WEBHOOK_SECRET` + `SUMIT_MODE` (sandbox/production) מ-Sumit. נדרשת התקנה ידנית כש-Elad מקבל credentials (ראה reference_sumit_pending.md).

### Hardening
- [x] **`src/lib/rate-limit.ts`** (NEW) - rate limiter שיתופי לכל route. sliding window per-IP, default 20/60s, cleanup אוטומטי במאגר. `getClientIp` helper (x-forwarded-for → x-real-ip → unknown).
- [x] **`src/app/api/contact/route.ts`** - rate limit 5 הודעות/דקה לכל IP. החזרת 429 + `Retry-After: 60`.
- [x] **`src/app/api/sumit/webhook/route.ts`** - rate limit 100/דקה לכל IP. signature verification חובה. webhook לא חשוף לקריאות לא חתומות.
- [x] **CSP/security headers** (`next.config.ts`) - אומתו: X-Frame-Options:DENY, X-Content-Type-Options:nosniff, Strict-Transport-Security, Permissions-Policy, X-XSS-Protection, CSP מפורט (script-src + connect-src + frame-src + img-src + media-src). כבר היו מהPhase 13, לא שונו.
- [x] **`vitest.config.ts`** - תיקון bug pre-existing: vitest היה אוסף קבצי Playwright (e2e) ופייל אותם. הוסף `include: ["src/**/*.{test,spec}.{ts,tsx}"]` + `exclude: ["e2e/**", "tests/**", ...]`. 10 test files failed → 0 failed.
- [x] **Convex auth** - `deleteSession` ב-chat.ts כבר בודק ownership (`session.userId !== identity.subject`). admin queries (`requireAdmin(ctx)`) מוודאים role=admin.

### Tests
- [x] **`src/__tests__/rate-limit.test.ts`** (NEW) - 7 בדיקות: under limit, over limit, isolated buckets, default max=20, getClientIp from x-forwarded-for/x-real-ip/unknown.
- [x] **`src/__tests__/sumit.test.ts`** (NEW) - 9 בדיקות: isSumitConfigured (3), SUMIT_PLANS (3: ILS pricing, Hebrew names, recurring), verifySumitWebhook (3: no secret, wrong sig, valid sig with computed HMAC).

### Verification
- [x] `npx tsc --noEmit` → exit 0, 0 errors
- [x] `npx vitest run` → 6 files passed, **147 tests passed** (+16 from rate-limit+sumit)
- [x] `npm run build:local` → exit 0, 30 pages (+1 sumit webhook). אין placeholder images. CSP intact.

### קבצים שנערכו/נוצרו (Phase 14)
**NEW:**
- `src/lib/sumit.ts` - Sumit client utilities
- `src/lib/rate-limit.ts` - shared rate limiter
- `convex/sumit.ts` - Convex Sumit action + webhook mutation
- `src/app/api/sumit/webhook/route.ts` - webhook receiver
- `src/__tests__/rate-limit.test.ts` - 7 tests
- `src/__tests__/sumit.test.ts` - 9 tests

**MODIFIED:**
- `src/app/admin/page.tsx` - removed mockStats/mockRecentActivity fallback
- `src/app/admin/students/page.tsx` - removed mockStudents fallback
- `src/app/admin/courses/page.tsx` - removed mockCourses fallback
- `src/app/admin/courses/[courseId]/lessons/page.tsx` - removed mockLessons fallback
- `src/app/admin/courses/[courseId]/quizzes/page.tsx` - removed mockQuizzes fallback
- `convex/chat.ts` - model upgrade + fallback
- `convex/stripe.ts` - marked @deprecated
- `convex/_generated/api.d.ts` - register sumit module
- `src/app/pricing/page.tsx` - stripe → sumit + checkoutNotice
- `src/app/api/contact/route.ts` - rate limit added
- `vitest.config.ts` - exclude e2e from vitest

### מה נשאר פתוח לסשן הבא
1. **Sumit credentials** - מחכה ל-Elad לקבל token+orgId מ-Sumit, אז `.env.local` add: `SUMIT_API_TOKEN`, `SUMIT_ORG_ID`, `SUMIT_WEBHOOK_SECRET`, `SUMIT_MODE=sandbox`. אחרי זה לבדוק checkout flow end-to-end.
2. **Sumit webhook → Convex dispatch** - הקובץ כרגע מאשר webhook אבל לא קורא ל-`internal.sumit.handleSubscriptionUpdate`. צריך להוסיף `ConvexHttpClient` או להעביר ל-Node runtime + standard Convex client.
3. **`src/app/admin/billing/page.tsx`** - עדיין מתייחס ל-Stripe types, צריך migration נוסף.
4. **mock data remnants** - אחרי שיש נתונים אמיתיים ב-Convex, להסיר את הגוש `mockStudents`, `mockCourses` וכו' לחלוטין מהקבצים (כרגע מוגדרים אבל לא משומשים).
5. **FAQ + pricing copy** - מזכיר "Stripe" 2 פעמים, להחליף ל-"Sumit" אחרי שה-credentials פעילים.



## מה בוצע - Phase 13 Watch Time, Admin Setup, Deploy (סשן 2026-02-19)
- [x] **Schema Update** (`convex/schema.ts`) - Added `watchTimeSeconds` optional field to progress table
- [x] **Progress Tracking** (`convex/progress.ts`) - `updateProgress` now accepts `watchTimeSeconds` and accumulates it
- [x] **YouTube Player Enhanced** (`src/components/video/youtube-player.tsx`) - Tracks actual seconds watched using timestamp-based counting, sends accumulated time with each progress update, restores seconds on failed saves
- [x] **Analytics Backend** (`convex/analytics.ts`) - `getStudentOverview` returns `totalWatchTimeSeconds` aggregated from all progress entries
- [x] **Analytics UI** (`src/app/student/analytics/page.tsx`) - New watch time card showing total watch time in hours/minutes format
- [x] **Admin Setup Page** (`src/app/admin/setup/page.tsx`) - NEW: First admin setup flow - allows first logged-in user to become admin when no admins exist, shows "admin exists" page otherwise
- [x] **User Functions** (`convex/users.ts`) - Added `hasAnyAdmin` query and `promoteSelfToAdmin` mutation for admin setup flow
- [x] **Deploy Config** (`next.config.ts`) - Added image remotePatterns (Clerk, Convex), security headers (X-Frame-Options, X-Content-Type-Options, Referrer-Policy)
- [x] **Build Scripts** (`package.json`) - Updated build to `npx convex deploy --cmd 'next build'` (official Convex pattern), added `build:local` for local-only builds
- [x] **Shared Utils** (`src/lib/progress-utils.ts`) - Added `formatWatchTime()` function for Hebrew watch time formatting
- [x] **Tests** (`src/__tests__/progress-utils.test.ts`) - 7 new tests for formatWatchTime (total: 39 in file, 131 overall)
- [x] **TypeScript** - עובר ללא שגיאות
- [x] **Build** - `next build` עובר בהצלחה (29 עמודים, +1 admin/setup)
- [x] **Tests** - 131 בדיקות עוברות

## מה בוצע - Phase 12 Platform Completeness (סשן 2026-02-19)
- [x] **Schema Update** (`convex/schema.ts`) - Added `category`, `level`, `estimatedHours` fields to courses table + `by_category` index
- [x] **Courses Backend** (`convex/courses.ts`) - Added `listCategories` query, updated `create` + `update` mutations with new fields
- [x] **Seed Data** (`convex/seed.ts`) - Added category/level/estimatedHours to all 3 courses (תקשורת/זוגיות, beginner/intermediate/advanced)
- [x] **Courses Page Filters** (`src/app/courses/page.tsx`) - Added category dropdown, level dropdown, "clear filters" button, active filter count
- [x] **CourseCard Enhanced** (`src/components/course/course-card.tsx`) - Added category tag, colored level badge (green/amber/red), estimated hours display
- [x] **About Page** (`src/app/about/page.tsx`) - NEW: Mission, values (4 cards), stats, CTA
- [x] **Help/FAQ Page** (`src/app/help/page.tsx`) - NEW: 15 FAQ items, 5 categories, search, accordion UI
- [x] **Contact Page** (`src/app/contact/page.tsx`) - NEW: Contact form with name/email/subject/message + success state
- [x] **Settings Page** (`src/app/settings/page.tsx`) - NEW: Profile info, notification toggles (4), learning preferences (reminder/goal)
- [x] **Footer Redesigned** (`src/components/layout/footer.tsx`) - 3-column grid: brand, navigation links, info links (about/help/contact)
- [x] **TypeScript** - עובר ללא שגיאות
- [x] **Build** - `next build` עובר בהצלחה (28 עמודים, +6 חדשים)
- [x] **Tests** - 124 בדיקות עוברות

## מה בוצע - Phase 9 Admin Lesson & Quiz Management (סשן 2026-02-18)
- [x] **Admin Lessons Page** (`src/app/admin/courses/[courseId]/lessons/page.tsx`) - NEW: Full lesson management
  - Table with: order number, title, content preview, video indicator, duration, status, reorder, actions
  - Create modal: title, content (Markdown textarea), video URL, duration (seconds with preview), published checkbox
  - Edit modal: pre-filled with existing lesson data
  - Delete confirmation dialog with cascading delete warning
  - Reorder via up/down arrow buttons (calls adminLessons.reorder)
  - Mock data fallback when Convex is not connected
  - Breadcrumb navigation back to courses list
- [x] **Admin Quizzes Page** (`src/app/admin/courses/[courseId]/quizzes/page.tsx`) - NEW: Full quiz management
  - Table with: quiz title, associated lesson, question count, passing score, actions
  - Create modal: title, lesson selector (dropdown), passing score, multi-question editor
  - Question editor: question text, 4 radio options with correct answer selector, explanation field
  - Add/remove questions dynamically
  - Edit modal: update title and passing score
  - Delete confirmation dialog
  - Mock data fallback
- [x] **Courses Table Enhanced** (`src/app/admin/courses/page.tsx`) - UPDATED
  - Added "שיעורים" icon link to lesson management per course
  - Added "בחנים" icon link to quiz management per course
  - Now has 4 action buttons: lessons, quizzes, edit, delete
- [x] **Convex adminLessons Module** (`convex/adminLessons.ts`) - FIXED: Bug in remove function (duplicate quizAttempts query)
- [x] **Convex adminQuizzes Module** (`convex/adminQuizzes.ts`) - Already existed, registered in api.d.ts
- [x] **API Types** (`convex/_generated/api.d.ts`) - UPDATED: Added adminLessons + adminQuizzes modules
- [x] **Admin Utils** (`src/lib/admin-utils.ts`) - UPDATED: Added formatDuration, truncateText, countLessonsByStatus, LessonRecord type
- [x] **Admin Tests** (`src/__tests__/admin-utils.test.ts`) - UPDATED: Added 13 new tests (formatDuration: 6, truncateText: 4, countLessonsByStatus: 3)
- [x] **TypeScript** - עובר ללא שגיאות
- [x] **Build** - `next build` עובר בהצלחה (22 עמודים)
- [x] **Tests** - 81 בדיקות עוברות (49 admin + 32 progress)

## מה בוצע - Phase 8 Admin Panel Enhancement (סשן 2026-02-18)
- [x] **AdminSidebar Component** (`src/components/admin/AdminSidebar.tsx`) - NEW: Extracted sidebar navigation
  - Reusable component with isOpen/onClose props
  - 4 navigation items: דשבורד, קורסים, סטודנטים, אנליטיקס (new)
  - Mobile drawer with overlay + desktop fixed sidebar
  - Active state highlighting based on pathname
  - "חזרה לאתר" link in footer
- [x] **Admin Layout Refactored** (`src/app/admin/layout.tsx`) - UPDATED: Uses extracted AdminSidebar
  - Replaced inline 200+ line sidebar with AdminSidebar component import
  - Same functionality, cleaner architecture
- [x] **Admin Analytics Page** (`src/app/admin/analytics/page.tsx`) - NEW: Analytics dashboard
  - 4 KPI cards: enrollment ratio, certificate rate, average score, completion rate
  - Weekly activity bar chart (SVG/CSS, no external libraries)
  - Course breakdown with progress bars and stats
  - Top students table with ranking, progress bars, last active times
  - Uses admin-utils functions (enrollmentRatio, certificateRate, formatRelativeTime)
  - Mock data with Convex fallback
- [x] **Admin Utils Module** (`src/lib/admin-utils.ts`) - NEW: Pure testable utility functions
  - Time formatting: formatRelativeTime, formatShortRelativeTime, formatDate
  - Student operations: filterStudents, sortStudentsByProgress, findAtRiskStudents
  - Stats calculations: enrollmentRatio, certificateRate, countCoursesByStatus, countActivitiesByType
  - Display helpers: getStudentInitial
  - TypeScript interfaces: AdminStats, StudentRecord, CourseRecord, ActivityRecord
- [x] **Admin Tests** (`src/__tests__/admin-utils.test.ts`) - NEW: 36 tests across 11 test suites
  - formatRelativeTime: 5 tests (now, minutes, hours, days, exact)
  - formatShortRelativeTime: 5 tests (short notation, week fallback)
  - filterStudents: 6 tests (empty, name, email, case-insensitive, no match, null name)
  - sortStudentsByProgress: 3 tests (order, immutability, empty)
  - findAtRiskStudents: 3 tests (below threshold, none, all)
  - enrollmentRatio: 3 tests (normal, zero students, equal)
  - certificateRate: 3 tests (normal, zero enrollments, 100%)
  - countCoursesByStatus: 3 tests (mixed, empty, all published)
  - countActivitiesByType: 2 tests (mixed, empty)
  - getStudentInitial: 3 tests (Hebrew name, null name fallback, latin uppercase)
- [x] **TypeScript** - עובר ללא שגיאות
- [x] **Build** - `next build` עובר בהצלחה (20 עמודים)
- [x] **Tests** - 68 בדיקות עוברות (32 existing + 36 new)

## מה בוצע - Phase 7 Student Progress Dashboard (סשן 2026-02-18)
- [x] **Student Progress Dashboard** (`src/app/student/dashboard/page.tsx`) - דף מעקב התקדמות מקיף
  - 4 כרטיסי סטטיסטיקות: קורסים רשומים, שיעורים הושלמו, ציון ממוצע, תעודות
  - Continue Learning section - מציג את השיעור הבא הספציפי שלא הושלם
  - Progress bars לכל קורס עם ציוני בוחן (מיטבי וממוצע)
  - Achievements section - כל 12 ההישגים (earned/locked) עם progress bar כולל
  - Certificates section - תצוגת כל התעודות עם תאריך ומספר
  - StreakDisplay - רצף למידה יומי עם ויזואליזציה שבועית
  - Quiz scores table - 5 ציונים אחרונים עם עיצוב passed/failed
  - Quick nav links - אנליטיקס, לוח מובילים, פרופיל, קטלוג קורסים
  - Empty state + Loading skeleton
  - Breadcrumb navigation
  - XP level badge בכותרת
- [x] **Convex Analytics - New Queries** (`convex/analytics.ts`)
  - `getNextLesson` - מציאת השיעור הבא שלא הושלם בקורס ספציפי
  - `getContinueLearningData` - נתוני "המשך ללמוד" לכל הקורסים הרשומים עם זיהוי שיעור הבא
    - מחזיר primary course (in-progress > not-started, sorted by last activity) + other courses
    - כולל: nextLessonId, nextLessonTitle, nextLessonNumber
- [x] **Enhanced Main Dashboard** (`src/app/dashboard/page.tsx`)
  - ContinueLearningCardEnhanced - כרטיס "המשך מאיפה שעצרת" עם שם השיעור הבא הספציפי
  - לינק ישיר לשיעור הבא (לא רק לקורס)
  - כפתור prominent "מעקב התקדמות מלא" שמקשר לדשבורד החדש
  - Fallback ל-ContinueLearningCard הישן אם אין נתונים מורחבים
- [x] **Header Navigation** (`src/components/layout/header.tsx`)
  - הוספת לינק "מעקב התקדמות" בניווט desktop ו-mobile
- [x] **Progress Utils - New Functions** (`src/lib/progress-utils.ts`)
  - `sortByCompletion` - מיון קורסים לפי אחוז השלמה (ascending)
  - `averageScore` - חישוב ממוצע ציונים מעוגל
  - `computeLevel` - חישוב רמה מ-XP עם progress percent
- [x] **New Tests** (`src/__tests__/progress-utils.test.ts`)
  - 11 בדיקות חדשות (סה"כ 32): sortByCompletion, averageScore, computeLevel
  - כיסוי מלא של כל הפונקציות החדשות
- [x] **TypeScript** - עובר ללא שגיאות
- [x] **Build** - `next build` עובר בהצלחה (19 עמודים)
- [x] **Tests** - 32 בדיקות עוברות

## מה בוצע - Phase 6 Progress Tracker + Dashboard (סשן 2026-02-18)
- [x] **CourseProgressTracker component** (`src/components/course/course-progress-tracker.tsx`)
  - SVG progress ring לאחוז השלמה כולל
  - פירוט שיעורים per-section עם progress bars אופקיים
  - כוכב זהב לקורסים עם תעודה
  - קישור לכל קורס
  - תמיכה במצב ריק (אין קורסים)
- [x] **Enhanced Student Dashboard** (`src/app/dashboard/page.tsx`)
  - 4 כרטיסי Quick Stats: קורסים רשומים, שיעורים הושלמו, ציון ממוצע, תעודות
  - "המשך מאיפה שעצרת" - ContinueLearningCard עם progress bar וכפתור המשך
  - StreakCard - מונה streak יומי עם הודעת מוטיבציה ולינק לאנליטיקס
  - AchievementsSummaryCard - תצוגת אימוג'י של הישגים שהושגו
  - CourseProgressTracker מוטמע ישירות בדשבורד
  - CourseCards מוצגים עם progressPercent מעודכן
- [x] **Progress Utils** (`src/lib/progress-utils.ts`)
  - פונקציות לוגיקה טהורות: calcOverallPercent, countCertificates, streakMessage, pickContinueCourse, clampPercent, totalCompletedLessons
- [x] **Vitest Test Suite** (`src/__tests__/progress-utils.test.ts`)
  - 21 בדיקות יחידה ב-6 test suites
  - כיסוי מלא של כל פונקציות ה-utils
  - TypeScript + jsdom environment
- [x] **Vitest Configuration** (`vitest.config.ts`) - הגדרת Vitest עם React plugin
- [x] **package.json** - הוספת scripts: test, test:watch + devDependencies: vitest, @testing-library/react, @testing-library/jest-dom, @vitejs/plugin-react, jsdom

## מה בוצע - Phase 1 Core (הושלם)
- [x] Landing page (דף נחיתה עם Hero, features, stats, steps, CTA, footer)
- [x] Auth pages - Clerk sign-in / sign-up
- [x] Courses list page - רשימת קורסים מ-Convex + חיפוש
- [x] Dashboard - אזור אישי עם סטטיסטיקות, קורסים רשומים, תעודות
- [x] Header component עם ניווט desktop + mobile + תעודות
- [x] Middleware - הגנה על נתיבים פרטיים (כולל /certificates, /admin)
- [x] Convex schema (courses, lessons, users, enrollments, progress, quizzes, quizQuestions, quizAttempts, certificates)
- [x] Convex functions: courses, lessons, users, progress, enrollments, quizzes, certificates
- [x] Convex _generated stubs (לאפשר compilation ללא Convex backend)
- [x] Course detail page (`/courses/[courseId]`) - עם enrollment, progress tracking, certificates
- [x] Lesson learning page (`/courses/[courseId]/learn`) - sidebar עם progress, mark complete, quiz integration
- [x] Enrollments module (convex/enrollments.ts) - הרשמה/ביטול הרשמה לקורסים
- [x] Mobile responsive header עם hamburger menu
- [x] TypeScript compiles with zero errors
- [x] ESLint passes (2 non-critical img warnings)
- [x] Convex + Clerk auth integration (ConvexProviderWithClerk)
- [x] Seed data module - 3 קורסי דוגמה עם 16 שיעורים + בחנים

## מה בוצע - Phase 2 Features (סשן 2026-02-15)
- [x] **הרשמה לקורסים (Enrollment)** - כפתור הרשמה/ביטול בדף הקורס
- [x] **מעקב התקדמות** - סימון שיעורים כהושלמו + progress bar בסיידבר ובדף הקורס
- [x] **מערכת בחנים (Quizzes)** - Schema + Convex functions + QuizPlayer UI component
  - בוחן עם שאלות רב-ברירה
  - מעבר בין שאלות, ניווט חופשי
  - תצוגת תוצאות עם הסברים
  - ניסיונות חוזרים
  - seed data עם 3 בחנים (אחד לכל קורס)
- [x] **תעודות סיום (Certificates)** - Schema + Convex functions + CertificateCard UI
  - הנפקת תעודה אוטומטית ב-80%+ השלמה
  - מספר תעודה ייחודי
  - דף תעודות (/certificates) עם רשימת כל התעודות
  - תצוגת תעודה בדשבורד
  - אימות תעודה לפי מספר
- [x] **UI Components חדשים:**
  - `ProgressBar` - סרגל התקדמות עם sizes ו-labels
  - `Badge` - תגיות סטטוס (default, success, warning, info)
  - `CourseCard` - כרטיס קורס משופר עם metadata ו-progress
  - `EnrollButton` - כפתור הרשמה עם אישור ביטול
  - `LessonCompleteButton` - כפתור סימון שיעור כהושלם
  - `QuizPlayer` - נגן בחנים מלא (intro, playing, review)
  - `CertificateCard` - תצוגת תעודה מעוצבת
- [x] **דף קורסים משופר** - חיפוש, תוצאות ריקות, CourseCard component
- [x] **דשבורד משופר** - קורסים רשומים, תעודות, קישורים
- [x] **דף נחיתה משופר** - Stats section, How it works, CTA section, footer עם ניווט
- [x] **Mobile UX** - sidebar ניידת (drawer) בדף הלימוד, נגישות משופרת
- [x] **נגישות** - aria-labels, roles, aria-current, aria-expanded, navigation landmarks

## מה בוצע - Phase 3 Admin Panel (סשן 2026-02-17)
- [x] **Admin Layout** (`app/admin/layout.tsx`) - Sidebar navigation עם 3 עמודים
  - Sidebar קבועה (desktop) / drawer (mobile) עם hamburger menu
  - ניווט: דשבורד, קורסים, סטודנטים
  - Top bar עם UserButton של Clerk
  - קישור "חזרה לאתר" בתחתית ה-sidebar
  - Active state מודגש בניווט
- [x] **Admin Dashboard** (`app/admin/page.tsx`) - סקירה כללית
  - 4 כרטיסי סטטיסטיקות: סטודנטים, קורסים, ציון ממוצע, אחוז השלמה
  - 2 כרטיסי משנה: סך הרשמות, תעודות שהונפקו
  - רשימת פעילות אחרונה (10 אירועים) - הרשמות ותעודות
  - Mock data + fallback מנתוני Convex אמיתיים
- [x] **Admin Courses** (`app/admin/courses/page.tsx`) - ניהול קורסים
  - טבלת קורסים: שם, תיאור, סטודנטים, ציון ממוצע, סטטוס (מפורסם/טיוטה)
  - כפתור "הוסף קורס" → מודאל יצירה
  - כפתור עריכה → מודאל עריכה (pre-filled)
  - כפתור מחיקה → דיאלוג אישור עם אזהרה
  - טפסים עם: שם, תיאור, URL תמונה, checkbox פרסום
  - Badge component לסטטוס
- [x] **Admin Students** (`app/admin/students/page.tsx`) - ניהול סטודנטים
  - טבלת סטודנטים: שם, אימייל, קורסים רשומים, התקדמות, פעילות אחרונה
  - חיפוש לפי שם או אימייל
  - לחיצה על שורה → פאנל פרטים בצד (detail panel)
  - פאנל פרטים: אווטאר, סטטיסטיקות, תאריך הצטרפות, קורסים עם progress
  - ProgressBar ו-Badge components
- [x] **Convex Admin Module** (`convex/admin.ts`) - Backend functions
  - `listAllCourses` - כל הקורסים (כולל לא מפורסמים)
  - `getEnrollmentCount` - ספירת רשומים לקורס
  - `getStats` - סטטיסטיקות כלליות (סטודנטים, קורסים, הרשמות, תעודות, ממוצעים)
  - `getRecentActivity` - 10 פעילויות אחרונות (הרשמות + תעודות)
  - `listStudents` - סטודנטים עם נתוני הרשמות והתקדמות
  - `createCourse` - יצירת קורס חדש
  - `updateCourse` - עדכון קורס קיים
  - `deleteCourse` - מחיקת קורס + כל הנתונים הקשורים (cascading delete)
- [x] **Updated `_generated/api.d.ts`** - הוספת admin module ל-API types

## מה בוצע - Phase 4 Quiz Enhancement + Analytics (סשן 2026-02-18)
- [x] **Enhanced Quiz System** (`app/quiz/[id]/page.tsx`) - חוויית בוחן משופרת
  - טיימר לכל שאלה (60 שניות ברירת מחדל) עם שעון ויזואלי
  - סרגל התקדמות (progress bar) עם מספר שאלה
  - פידבק מיידי אחרי כל תשובה (נכון/שגוי + הסבר)
  - מעבר אוטומטי כשנגמר הזמן
  - דף תוצאות מסכם עם:
    - עיגול ציון SVG מונפש
    - תשובות נכונות/שגויות
    - זמן כולל שנדרש
    - מספר ניסיון
    - סקירת כל השאלות עם הסברים
  - תמיכה בניסיון חוזר
  - תמיכה בציון הכי טוב / ציון אחרון
- [x] **Convex quizResults Module** (`convex/quizResults.ts`) - Backend מורחב לבחנים
  - `getAttemptsByUserAndQuiz` - כל הניסיונות של משתמש בבוחן
  - `getAttemptsByUserAndCourse` - ניסיונות לפי קורס
  - `getAllAttemptsByUser` - כל הניסיונות של משתמש
  - `getBestScore` - ציון הכי טוב בבוחן
  - `submitEnhancedAttempt` - הגשה עם מדידת זמן
  - `getUserQuizSummary` - סיכום ביצועי בחנים
- [x] **Student Analytics Dashboard** (`app/student/analytics/page.tsx`) - דשבורד אנליטיקס
  - 4 כרטיסי סטטיסטיקות: קורסים, שיעורים, תעודות, ציון ממוצע
  - מעקב Streak (ימים רצופים) - נוכחי, שיא, סך ימים
  - התקדמות בקורסים - progress bar + mini bar chart לכל קורס
  - היסטוריית ציוני בחנים - SVG bar chart + רשימת ניסיונות אחרונים
  - מערכת הישגים (8 תגים): צעד ראשון, תלמיד חרוץ, מצטיין, בוגר, מתמיד, מעמיק, כל הכבוד, חובב למידה
  - כל הגרפים ב-SVG/CSS בלבד (ללא ספריות חיצוניות)
- [x] **Convex Analytics Module** (`convex/analytics.ts`) - Backend לאנליטיקס
  - `getStudentOverview` - סטטיסטיקות כלליות
  - `getCourseProgress` - התקדמות מפורטת בכל קורס
  - `getQuizScoreHistory` - היסטוריית ציונים עם שמות בחנים/קורסים
  - `getLearningStreak` - חישוב streak (ימים רצופים, שיא, סך ימים)
  - `getAchievements` - חישוב הישגים/תגים (8 סוגים)
- [x] **Course Content Viewer** (`app/course/[id]/lesson/[lessonId]/page.tsx`) - צפייה בתוכן שיעור
  - Markdown renderer מובנה (כותרות, bold, italic, code, blockquotes, lists, links)
  - תמיכה ב-YouTube iframe embed (זיהוי אוטומטי של URL)
  - תמיכה בוידאו ישיר (video tag)
  - ניווט prev/next lesson עם שמות
  - כפתור "סימון כהושלם"
  - progress bar של הקורס
  - רשימת שיעורים מתקפלת (collapsible)
  - Breadcrumb ניווט
- [x] **Updated middleware** - הגנה על נתיבים חדשים (/quiz, /student, /course)
- [x] **Updated `_generated/api.d.ts`** - הוספת analytics + quizResults modules

## מה בוצע - Phase 5 Gamification & Social (סשן 2026-02-18)
- [x] **Convex Gamification Module** (`convex/gamification.ts`) - Backend לגיימיפיקציה
  - `getUserXP` - חישוב XP מצטבר (שיעורים, בחנים, תעודות, ימים פעילים)
  - `getLeaderboard` - לוח מובילים (טופ 50 סטודנטים לפי XP)
  - `getUserBadges` - 12 סוגי תגי הישגים עם בדיקת threshold
  - `getDailyStreak` - מעקב streak יומי עם פעילות שבועית
  - `getStudentProfile` - פרופיל סטודנט מלא עם כל הנתונים
  - `getCertificateForSharing` - נתוני תעודה לשיתוף
- [x] **Leaderboard Page** (`app/student/leaderboard/page.tsx`) - לוח מובילים
  - טבלת דירוג עם: מיקום, שם, XP, רמה, שיעורים, תגים
  - מדליות זהב/כסף/ארד ל-3 הראשונים
  - כרטיס "הסטטוס שלי" עם XP progress bar
  - הסבר "איך צוברים XP" עם כל סוגי הניקוד
  - הדגשה של המשתמש הנוכחי בטבלה
- [x] **Achievement Badges System** - 12 סוגי תגים
  - צעד ראשון (הרשמה ראשונה), חוקר (3 הרשמות)
  - תלמיד חרוץ (5 שיעורים), אלוף השיעורים (15 שיעורים)
  - מצטיין (ציון 100), לוחם הבחנים (5 בחנים), אלוף הבחנים (5 מעברים)
  - בוגר (תעודה ראשונה), מלומד (3 תעודות)
  - מתמיד (3 ימים רצופים), שבוע למידה (7 ימים), מסור (30 ימים)
  - כל תג עם SVG icon ייחודי, מצב locked/earned, תאריך השגה
- [x] **Badge Icon Component** (`components/gamification/badge-icon.tsx`)
  - 12 SVG icons ייחודיים: rocket, book, bookOpen, star, sword, trophy, medal, fire, flame, crown, compass, shield
  - BadgeCard component - כרטיס הישג מעוצב
  - StreakDisplay component - ויזואליזציה שבועית של streak
- [x] **Daily Streak System** - מעקב ימי למידה רצופים
  - חישוב streak נוכחי ושיא
  - ויזואליזציה שבועית (7 ימים אחרונים)
  - הודעת מוטיבציה אם לא למדת היום
  - ספירת סך ימי למידה
- [x] **Social Sharing** - שיתוף תעודות
  - כפתור "שתף תעודה" עם dropdown menu
  - שיתוף ב-WhatsApp, Twitter/X, LinkedIn
  - העתקת קישור
  - OG Image generation API route (`app/api/og/route.tsx`)
  - תמונת שיתוף מעוצבת עם שם הסטודנט, קורס, מספר תעודה ותאריך
- [x] **Student Profile Page** (`app/student/profile/page.tsx`)
  - כרטיס פרופיל עם אווטאר, שם, אימייל, תאריך הצטרפות
  - רמה ו-XP עם progress bar לרמה הבאה
  - 4 כרטיסי סטטיסטיקות: קורסים, שיעורים, תעודות, ציון ממוצע
  - תצוגת streak יומי עם ויזואליזציה שבועית
  - כל 12 ההישגים עם progress bar כולל
  - רשימת קורסים עם progress ולינק להמשך
  - רשימת תעודות עם שיתוף חברתי
- [x] **XP & Level System**
  - חישוב XP: שיעור=10, ניסיון בוחן=5, מעבר=15, ציון מושלם=25, תעודה=50, יום פעיל=3
  - נוסחת רמה: level = floor(sqrt(XP/25)) + 1
  - Progress bar לרמה הבאה
- [x] **Updated `_generated/api.d.ts`** - הוספת gamification module

## מה בוצע - Convex + Clerk Integration (סשן 2026-02-18)
- [x] **Clerk project created** - `becoming-skunk-9` (pk_test_YmVjb21pbmctc2t1bmstOS5jbGVyay5hY2NvdW50cy5kZXYk)
- [x] **Convex project created** - `haderech-next` (colorless-guanaco-894.convex.cloud)
- [x] **convex/auth.config.ts** - NEW: Clerk JWT auth provider configuration
- [x] **.env.local** - NEW: All keys configured (Clerk + Convex)
- [x] **CLERK_JWT_ISSUER_DOMAIN** - Set in Convex environment variables
- [x] **Schema deployed** - 9 tables + 21 indexes pushed to Convex
- [x] **_generated types** - Real types generated (replaced stubs)
- [x] **TypeScript** - Compiles with zero errors
- [x] **Build** - `next build` passes successfully (17 pages)
- [x] **Dev server** - Starts in 3.5s on port 3000

### Convex Dashboard:
- URL: https://dashboard.convex.dev/d/colorless-guanaco-894
- Project: https://dashboard.convex.dev/t/elad-ya-akobovitch/haderech-next

### Clerk Dashboard:
- Issuer: https://becoming-skunk-9.clerk.accounts.dev

## צעדים הבאים
1. ~~**הגדרת Environment Variables**~~ ✅ הושלם
2. ~~**הפעלת `npx convex dev`**~~ ✅ הושלם
3. **הרצת seed** - להפעיל seed data דרך הדשבורד או `npx convex run seed:seedAll`
4. **Phase 2 Remaining:** Video player עם מעקב זמן צפייה
5. ~~**Phase 3 Remaining:** ניהול שיעורים (CRUD) בתוך כל קורס~~ ✅ Phase 9
6. ~~**Phase 3 Remaining:** ניהול בחנים (CRUD) - יצירת/עריכת בחנים ושאלות~~ ✅ Phase 9
7. **Phase 3 Remaining:** Role-based access - בדיקת role=admin לפני גישה לפאנל
8. **Phase Next:** Discussion forum / comments on lessons
9. **Phase Next:** Study groups
10. **Next.js 16 middleware deprecation** - מיגרציה מ-middleware.ts ל-proxy.ts

## החלטות שהתקבלו
- npm (לא bun) - כמתועד ב-CLAUDE.md, bun לא עובד במערכת זו
- Convex _generated stubs - נוצרו ידנית כי אין Convex deployment מוגדר
- `<img>` במקום `next/image` - כי תמונות קורסים מ-URLs חיצוניים שדורשים הגדרת domains
- RTL + Hebrew (Heebo font) מוגדר ב-layout.tsx
- Clerk localization to Hebrew via heIL
- Seed data כ-public mutation (לא internalMutation) כדי שיהיה ניתן להפעיל מהדשבורד
- clearAll כ-internalMutation (בטיחות - רק מקוד שרת)
- Quiz passing score: 60% (ניתן לשינוי per-quiz)
- Certificate threshold: 80% השלמת קורס
- Certificate number format: HD-{timestamp_base36}-{random_4chars}
- SVG icons inline (ללא תלות חיצונית ב-icon library)
- Admin pages use mock data with Convex fallback (no env vars required for development)
- Admin sidebar: fixed on desktop, drawer with overlay on mobile
- deleteCourse performs cascading delete (enrollments, progress, quizzes, questions, attempts, lessons, certificates)
- Enhanced quiz: טיימר 60 שניות ברירת מחדל, פידבק מיידי, auto-advance on timeout
- Analytics charts: SVG/CSS only, no external chart libraries
- Markdown renderer: built-in, supports headings, bold, italic, code, blockquotes, lists, links
- YouTube detection: automatic from URL patterns (youtube.com, youtu.be)
- Achievements: 8 types with earned/locked states
- Streak: counts both lesson progress and quiz attempts as activity
- XP system: calculated from activity (not stored), no schema change needed
- Level formula: level = floor(sqrt(XP/25)) + 1, gives smooth progression
- Badge system: 12 types (enrollment, lessons, quiz, certificate, streak categories)
- OG Image: Next.js Edge runtime, SVG-based, no external font loading
- Social sharing: WhatsApp, Twitter/X, LinkedIn, copy link
- Leaderboard: top 50 users by XP, real-time calculation
- Did NOT modify existing Phase 1-4 files (except api.d.ts stub)

## קבצים שנערכו/נוצרו (סשן 2026-02-18 - Phase 5)

### Convex Backend (חדש):
- `convex/gamification.ts` - NEW: gamification module (6 functions: getUserXP, getLeaderboard, getUserBadges, getDailyStreak, getStudentProfile, getCertificateForSharing)
- `convex/_generated/api.d.ts` - UPDATED: added gamification module

### Pages (חדש):
- `src/app/student/leaderboard/page.tsx` - NEW: leaderboard page with ranking table
- `src/app/student/profile/page.tsx` - NEW: student profile page with badges, streak, courses, certificates
- `src/app/api/og/route.tsx` - NEW: OG image generation API for certificate sharing

### Components (חדש):
- `src/components/gamification/badge-icon.tsx` - NEW: BadgeIcon (12 SVG icons), BadgeCard, StreakDisplay components

## קבצים שנערכו/נוצרו (סשן 2026-02-18 - Phase 4)

### Convex Backend (חדש):
- `convex/quizResults.ts` - NEW: enhanced quiz results module (6 functions)
- `convex/analytics.ts` - NEW: student analytics module (5 functions)
- `convex/_generated/api.d.ts` - UPDATED: added analytics + quizResults modules

### Pages (חדש):
- `src/app/quiz/[id]/page.tsx` - NEW: enhanced quiz taking experience
- `src/app/student/analytics/page.tsx` - NEW: student analytics dashboard
- `src/app/course/[id]/lesson/[lessonId]/page.tsx` - NEW: course content viewer

### Other:
- `src/middleware.ts` - UPDATED: added /quiz, /student, /course to protected routes
- `PROGRESS.md` - UPDATED

## קבצים שנערכו/נוצרו (סשן 2026-02-15)

### Convex Backend (חדש):
- `convex/schema.ts` - UPDATED: added quizzes, quizQuestions, quizAttempts, certificates tables
- `convex/quizzes.ts` - NEW: getByLesson, getQuestions, getLastAttempt, submitAttempt, create
- `convex/certificates.ts` - NEW: getByUserAndCourse, listByUser, verifyByCertificateNumber, issue
- `convex/seed.ts` - UPDATED: added quiz seed data (3 quizzes with 9 questions), updated clearAll
- `convex/_generated/api.d.ts` - UPDATED: added quizzes and certificates modules

### UI Components (חדש):
- `src/components/ui/progress-bar.tsx` - NEW: accessible progress bar component
- `src/components/ui/badge.tsx` - NEW: status badge component
- `src/components/course/course-card.tsx` - NEW: reusable course card with metadata
- `src/components/course/enroll-button.tsx` - NEW: enrollment button with confirm
- `src/components/course/lesson-complete-button.tsx` - NEW: mark lesson complete
- `src/components/quiz/quiz-player.tsx` - NEW: full quiz player (intro, playing, review)
- `src/components/certificate/certificate-card.tsx` - NEW: certificate display card

### Pages (עדכון):
- `src/app/page.tsx` - UPDATED: added stats, how-it-works, CTA sections, improved footer
- `src/app/courses/page.tsx` - UPDATED: search, CourseCard component, improved empty states
- `src/app/courses/[courseId]/page.tsx` - REWRITTEN: enrollment, progress, certificates, badges
- `src/app/courses/[courseId]/learn/page.tsx` - REWRITTEN: progress tracking, mark complete, quiz, mobile sidebar
- `src/app/dashboard/page.tsx` - REWRITTEN: enrolled courses, certificates, improved stats
- `src/app/certificates/page.tsx` - NEW: user certificates page

### Other:
- `src/components/layout/header.tsx` - UPDATED: added certificates link, aria-label
- `src/middleware.ts` - UPDATED: added /certificates to protected routes
- `PROGRESS.md` - UPDATED

## קבצים שנערכו/נוצרו (סשן 2026-02-17 - Phase 3 Admin)

### Convex Backend:
- `convex/admin.ts` - NEW: Admin queries + mutations (listAllCourses, getStats, getRecentActivity, listStudents, createCourse, updateCourse, deleteCourse)
- `convex/_generated/api.d.ts` - UPDATED: added admin module import + type

### Admin Pages (חדש):
- `src/app/admin/layout.tsx` - NEW: Admin layout with sidebar navigation (desktop fixed + mobile drawer)
- `src/app/admin/page.tsx` - NEW: Admin dashboard with stats cards + recent activity list
- `src/app/admin/courses/page.tsx` - NEW: Courses table with create/edit modal + delete confirmation
- `src/app/admin/students/page.tsx` - NEW: Students table with search + detail panel

### Other:
- `PROGRESS.md` - UPDATED

## קורסי דוגמה (Seed Data)
### קורס 1: אומנות ההקשבה (6 שיעורים + בוחן)
### קורס 2: תקשורת זוגית מתקדמת (5 שיעורים + בוחן)
### קורס 3: מפתחות לאינטימיות (6 שיעורים + בוחן)

כל בוחן מכיל 3 שאלות רב-ברירה עם הסברים, ציון מעבר 60%.

## Git History
- `b6f1404` - feat: add quizzes, certificates, progress tracking, and enrollment system
- `1bfdf14` - feat: add seed data with 3 Hebrew courses and improve dashboard UI
- `3136da2` - fix: configure Convex + Clerk auth integration and project setup
- `ef57d26` - feat: add complete learning platform foundation with courses, lessons, auth, and dashboard
- `34694ea` - Initial commit from Create Next App

## Remote
- No remote configured yet. To push: create a GitHub repo and run `git remote add origin <url> && git push -u origin master`

## הערות לסשן הבא
- קרא CLAUDE.md לפני התחלה
- נדרש לחבר Clerk ו-Convex (ראה .env.local.example)
- Next.js 16 מזהיר על middleware deprecation - לשקול מיגרציה ל-proxy
- _generated files הם stubs - `npx convex dev` יחליף אותם באמיתיים
- כלי ה-seed זמין בדשבורד רק במצב פיתוח (NODE_ENV=development)
- לאחר `npx convex dev` - ניתן להפעיל seed מהדשבורד
- בחנים נוצרים רק לשיעור הראשון של כל קורס (ניתן להוסיף עוד דרך admin panel)
- `next build` דורש .env.local עם Clerk keys תקינים (pre-existing issue)
- Admin pages עובדים עם mock data כשאין Convex backend
- Admin panel נגיש רק למשתמשים מחוברים (middleware)
- בעתיד: יש להוסיף בדיקת role=admin בכל עמודי ה-admin

### 11.6.2026 — מעבר שיפורים רוחבי (Fable-5 sweep)
- branch `chore/security-deps-2026-06-11` (54ac155): next 16.1.6→16.2.9 + clerk lock refresh + audit fix — npm audit CRITICAL×2/HIGH×13 → 0/0 · build:local ירוק · קומט קבצי-חבילות בלבד (33 קבצים מלוכלכים לא עורבבו). merge אחרי Vercel preview.
