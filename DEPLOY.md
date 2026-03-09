# הדרך נקסט — מדריך פריסה לפרודקשן

## תנאים מוקדמים

- [ ] חשבון Vercel (https://vercel.com)
- [ ] חשבון Convex (https://dashboard.convex.dev)
- [ ] חשבון Clerk — Production instance (https://dashboard.clerk.com)
- [ ] דומיין: `haderech.co.il` (או אחר)

---

## שלב 1: Convex Production

```bash
# 1. Login
npx convex login

# 2. Deploy to production (creates prod deployment)
npx convex deploy

# 3. Set environment variables in Convex
npx convex env set ANTHROPIC_API_KEY sk-ant-xxxxx
npx convex env set VAPID_PUBLIC_KEY BKSeHFW4CVX6sAvImUjsMAaabOOQBCkL-GIoDqFRPso-KZR_YHN6eIyEDFEf0L7K8kk1Jw-oVdBuMgWmivP8a5Y
npx convex env set VAPID_PRIVATE_KEY XOsUbTzKoUbtdHAGV52OLSNeotppIuXQx7C9R2L-cUg

# 4. Seed production data
npx convex run seedHaderech:seedHaderechCourse
```

**חשוב:** העתיקו את ה-Production URL מ-Convex Dashboard → Settings.

---

## שלב 2: Clerk Production

1. פתחו Clerk Dashboard → Create Production Instance
2. הפעילו Sign-in methods: Email + Google
3. צרו Webhook endpoint: `https://haderech.co.il/api/webhooks/clerk`
4. Hebrew localization: כבר מוגדר בקוד (`@clerk/localizations/heIL`)
5. העתיקו Production keys: `pk_live_...` ו-`sk_live_...`

---

## שלב 3: Vercel Deployment

```bash
# 1. Install Vercel CLI
npm i -g vercel

# 2. Link project
vercel link

# 3. Set environment variables (from .env.production.example)
vercel env add NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
vercel env add CLERK_SECRET_KEY
vercel env add NEXT_PUBLIC_CONVEX_URL
vercel env add CONVEX_DEPLOY_KEY
vercel env add NEXT_PUBLIC_APP_URL
vercel env add NEXT_PUBLIC_APP_NAME
vercel env add ANTHROPIC_API_KEY
vercel env add NEXT_PUBLIC_VAPID_PUBLIC_KEY
# Optional:
vercel env add NEXT_PUBLIC_GA_ID
vercel env add RESEND_API_KEY

# 4. Deploy
vercel --prod
```

---

## שלב 4: DNS & Domain

1. ב-Vercel: Settings → Domains → Add `haderech.co.il`
2. ב-DNS provider:
   - `A` record → `76.76.21.21`
   - `CNAME` www → `cname.vercel-dns.com`
3. SSL מופעל אוטומטית

---

## שלב 5: Stripe (כשמוכנים לתשלומים)

```bash
# 1. Set Stripe env vars
vercel env add STRIPE_SECRET_KEY           # sk_live_...
vercel env add STRIPE_WEBHOOK_SECRET       # whsec_...
vercel env add NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY  # pk_live_...
vercel env add STRIPE_BASIC_PRICE_ID       # price_...
vercel env add STRIPE_PREMIUM_PRICE_ID     # price_...

# 2. Create Stripe webhook
# Endpoint: https://haderech.co.il/api/webhooks/stripe
# Events: checkout.session.completed, customer.subscription.*
```

---

## שלב 6: Analytics & Monitoring

1. **Google Analytics 4**: צרו Property → העתיקו Measurement ID → `NEXT_PUBLIC_GA_ID`
2. **Health Check**: `https://haderech.co.il/healthz` (או `/api/health`)
3. **Vercel Analytics**: מופעל אוטומטית

---

## בדיקת פרודקשן

```bash
# Health check
curl https://haderech.co.il/healthz

# Verify pages
curl -I https://haderech.co.il             # Landing page
curl -I https://haderech.co.il/courses      # Courses list
curl -I https://haderech.co.il/sign-in      # Auth
curl -I https://haderech.co.il/sitemap.xml  # SEO

# Security headers
curl -sI https://haderech.co.il | grep -iE 'x-frame|content-security|strict-transport'
```

---

## Checklist סופי

- [ ] Convex production deployed + data seeded
- [ ] Clerk production instance configured
- [ ] Vercel deployed with all env vars
- [ ] Custom domain + SSL working
- [ ] Health check returns 200
- [ ] All pages load correctly
- [ ] Auth flow works (sign-in/sign-up)
- [ ] Course content displays
- [ ] AI chat responds
- [ ] Push notifications (VAPID configured)
- [ ] Sitemap accessible
- [ ] Security headers present
- [ ] Google Analytics tracking (if enabled)
