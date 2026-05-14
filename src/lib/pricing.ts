/**
 * HaDerech (הדרך) by Omanut HaKesher - Monetization & Pricing Model
 *
 * Pricing architecture based on research across:
 * - EdTech (Masterclass, Coursera, Udemy)
 * - Dating apps (Tinder, Hinge, Bumble)
 * - AI SaaS (ChatGPT, Jasper AI)
 * - Premium coaching (Tony Robbins, Matthew Hussey)
 * - Israeli digital market benchmarks
 *
 * Key principles:
 * 1. 1-on-1 coaching (thousands ₪) is the ultimate price anchor - NOT part of tiers
 * 2. Free tier uses "reverse trial" psychology (taste premium, then gate)
 * 3. Annual plans at ~35% discount match Israeli preference for "deals"
 * 4. VIP delivers group coaching + exclusive content (NOT 1-on-1)
 * 5. Course one-time purchase serves ownership-preference buyers
 * 6. A la carte add-ons capture additional revenue from any tier
 *
 * 461 couples found love = powerful social proof for all tiers.
 */

// ---------------------------------------------------------------------------
// Core Types
// ---------------------------------------------------------------------------

export type TierId =
  | "free"
  | "basic"
  | "premium"
  | "vip"
  | "course"

export type BillingCycle = "monthly" | "annual" | "one_time"

export type AddOnId =
  | "ai_unlimited"
  | "simulator_advanced"
  | "photo_analysis"
  | "date_analysis"
  | "profile_builder_pro"
  | "masterclass_bundle"
  | "progress_report"
  | "priority_support"

export type FeatureId =
  | "course_access"
  | "lesson_count"
  | "ai_chat_messages"
  | "ai_chat_context"
  | "simulator_scenarios"
  | "simulator_voice"
  | "simulator_video"
  | "resource_library"
  | "community_access"
  | "community_badges"
  | "community_leaderboard"
  | "profile_builder"
  | "photo_analysis"
  | "date_analysis"
  | "group_coaching"
  | "masterclasses"
  | "progress_reports"
  | "early_access"
  | "priority_support"
  | "certificate"
  | "offline_access"

// ---------------------------------------------------------------------------
// Interfaces
// ---------------------------------------------------------------------------

export interface PricingTier {
  /** Unique tier identifier */
  id: TierId
  /** Hebrew display name */
  name: string
  /** Hebrew subtitle / tagline */
  subtitle: string
  /** Hebrew description (1-2 sentences for marketing) */
  description: string
  /** The psychological value proposition - why this tier is worth it */
  valueProp: string
  /** What makes upgrading to the next tier irresistible */
  upgradeNudge: string | null
  /** Monthly price in ₪ (null for free tier) */
  priceMonthly: number | null
  /** Annual price in ₪ per year (null for free/one-time) */
  priceAnnual: number | null
  /** One-time purchase price in ₪ (only for course tier) */
  priceOneTime: number | null
  /** Billing cycles available for this tier */
  billingCycles: BillingCycle[]
  /** Effective monthly rate when billed annually */
  effectiveMonthlyOnAnnual: number | null
  /** Percentage saved on annual vs monthly */
  annualSavingsPercent: number | null
  /** Badge/label for marketing (e.g. "הכי פופולרי") */
  badge: string | null
  /** Whether this tier is highlighted/recommended in the UI */
  isRecommended: boolean
  /** Hex color for the tier card accent */
  accentColor: string
  /** Icon name (for use with lucide-react or similar) */
  icon: string
  /** Features included, keyed by FeatureId */
  features: Record<FeatureId, FeatureValue>
  /** Maximum number of users in this tier (for future group/family plans) */
  maxUsers: number
}

export type FeatureValue =
  | boolean
  | number
  | string
  | { value: number | string; unit: string }

export interface FeatureDefinition {
  id: FeatureId
  /** Hebrew display name */
  name: string
  /** Hebrew description */
  description: string
  /** Category for grouping in comparison table */
  category: FeatureCategory
  /** Sort order within category */
  sortOrder: number
}

export type FeatureCategory =
  | "course"
  | "ai"
  | "simulator"
  | "tools"
  | "community"
  | "coaching"
  | "extras"

export interface AddOn {
  id: AddOnId
  /** Hebrew name */
  name: string
  /** Hebrew description */
  description: string
  /** Price in ₪ per month (or one-time for bundles) */
  price: number
  /** Billing model */
  billingCycle: BillingCycle
  /** Which tiers can purchase this add-on */
  availableForTiers: TierId[]
  /** Tiers where this is already included */
  includedInTiers: TierId[]
  /** Icon name */
  icon: string
}

export interface CoupleSuccessMetric {
  count: number
  label: string
  description: string
}

// ---------------------------------------------------------------------------
// Feature Definitions (for comparison table headers)
// ---------------------------------------------------------------------------

export const FEATURE_DEFINITIONS: FeatureDefinition[] = [
  // Course
  {
    id: "course_access",
    name: "גישה לקורס",
    description: "גישה לקורס 73 השיעורים המלא",
    category: "course",
    sortOrder: 1,
  },
  {
    id: "lesson_count",
    name: "מספר שיעורים",
    description: "כמות השיעורים הזמינים",
    category: "course",
    sortOrder: 2,
  },
  {
    id: "certificate",
    name: "תעודת סיום",
    description: "תעודה דיגיטלית מוכרת עם שם וציון",
    category: "course",
    sortOrder: 3,
  },
  {
    id: "offline_access",
    name: "גישה אופליין",
    description: "הורדת שיעורים לצפייה ללא אינטרנט",
    category: "course",
    sortOrder: 4,
  },

  // AI
  {
    id: "ai_chat_messages",
    name: "הודעות AI Coach",
    description: "כמות הודעות חודשיות עם מאמן ה-AI",
    category: "ai",
    sortOrder: 1,
  },
  {
    id: "ai_chat_context",
    name: "זיכרון AI",
    description: "ה-AI זוכר את ההיסטוריה שלך לייעוץ מותאם אישית",
    category: "ai",
    sortOrder: 2,
  },

  // Simulator
  {
    id: "simulator_scenarios",
    name: "תרחישי סימולטור",
    description: "כמות תרחישי דייט זמינים",
    category: "simulator",
    sortOrder: 1,
  },
  {
    id: "simulator_voice",
    name: "סימולטור קולי",
    description: "תרגול שיחה קולית עם AI",
    category: "simulator",
    sortOrder: 2,
  },
  {
    id: "simulator_video",
    name: "סימולטור וידאו",
    description: "תרגול דייט בווידאו עם AI",
    category: "simulator",
    sortOrder: 3,
  },

  // Tools
  {
    id: "profile_builder",
    name: "בונה פרופיל",
    description: "כלי לבניית פרופיל דייטינג מנצח",
    category: "tools",
    sortOrder: 1,
  },
  {
    id: "photo_analysis",
    name: "ניתוח תמונות",
    description: "AI מנתח את התמונות שלך ומציע שיפורים",
    category: "tools",
    sortOrder: 2,
  },
  {
    id: "date_analysis",
    name: "ניתוח דייטים",
    description: "ניתוח דייטים שהיו לך עם תובנות לשיפור",
    category: "tools",
    sortOrder: 3,
  },
  {
    id: "resource_library",
    name: "ספריית משאבים",
    description: "ספרים, מאמרים, פודקאסטים ומדריכים",
    category: "tools",
    sortOrder: 4,
  },

  // Community
  {
    id: "community_access",
    name: "קהילה",
    description: "גישה לקהילת הלומדים",
    category: "community",
    sortOrder: 1,
  },
  {
    id: "community_badges",
    name: "תגי הישגים",
    description: "תגים ואיקונים מיוחדים בקהילה",
    category: "community",
    sortOrder: 2,
  },
  {
    id: "community_leaderboard",
    name: "לוח מובילים",
    description: "השתתפות בלוח המובילים של הקהילה",
    category: "community",
    sortOrder: 3,
  },

  // Coaching
  {
    id: "group_coaching",
    name: "קואצ׳ינג קבוצתי",
    description: "מפגשי קואצ׳ינג קבוצתיים חיים עם אלעד",
    category: "coaching",
    sortOrder: 1,
  },
  {
    id: "masterclasses",
    name: "מאסטרקלאסים",
    description: "הרצאות בלעדיות על נושאים מתקדמים",
    category: "coaching",
    sortOrder: 2,
  },
  {
    id: "progress_reports",
    name: "דוחות התקדמות",
    description: "ניתוח AI מעמיק של ההתקדמות שלך",
    category: "coaching",
    sortOrder: 3,
  },

  // Extras
  {
    id: "early_access",
    name: "גישה מוקדמת",
    description: "גישה מוקדמת לפיצ׳רים ותכנים חדשים",
    category: "extras",
    sortOrder: 1,
  },
  {
    id: "priority_support",
    name: "תמיכה בעדיפות",
    description: "מענה מהיר ועדיפות בתמיכה",
    category: "extras",
    sortOrder: 2,
  },
]

// ---------------------------------------------------------------------------
// Pricing Tiers
// ---------------------------------------------------------------------------

/**
 * FREE TIER - "טעימה" (Taste)
 *
 * Strategy: Reverse trial psychology. Give enough to experience the methodology's
 * power, but gate the transformative features. Users should feel "I need more of this."
 *
 * Based on: ChatGPT free (limited GPT-5), Tinder free (limited swipes),
 * Coursera audit mode (content without certification).
 *
 * Goal: 100% of visitors try it. 5-10% convert to paid within 30 days.
 */
const FREE_TIER: PricingTier = {
  id: "free",
  name: "טעימה",
  subtitle: "התחל את המסע",
  description:
    "גלה את השיטה שעזרה ל-461 זוגות למצוא אהבה. קבל טעימה מהקורס, המאמן האישי והכלים.",
  valueProp:
    "אפס סיכון. תתנסה בשיטה שמשנה חיים, תרגיש את ההבדל, ותחליט אם אתה מוכן להשקיע בעצמך.",
  upgradeNudge:
    "אוהב את מה שאתה מרגיש? עם הבסיסי תפתח את כל 73 השיעורים ותקבל מאמן AI אישי שזוכר אותך.",
  priceMonthly: null,
  priceAnnual: null,
  priceOneTime: null,
  billingCycles: [],
  effectiveMonthlyOnAnnual: null,
  annualSavingsPercent: null,
  badge: null,
  isRecommended: false,
  accentColor: "#6B7280", // gray-500
  icon: "Sparkles",
  maxUsers: 1,
  features: {
    course_access: "5 שיעורים ראשונים",
    lesson_count: 5,
    ai_chat_messages: { value: 10, unit: "הודעות/חודש" },
    ai_chat_context: false,
    simulator_scenarios: 2,
    simulator_voice: false,
    simulator_video: false,
    resource_library: "מאמרים בלבד",
    community_access: "צפייה בלבד",
    community_badges: false,
    community_leaderboard: false,
    profile_builder: "בסיסי",
    photo_analysis: false,
    date_analysis: false,
    group_coaching: false,
    masterclasses: false,
    progress_reports: false,
    early_access: false,
    priority_support: false,
    certificate: false,
    offline_access: false,
  },
}

/**
 * BASIC TIER - "מגלה" (Explorer)
 *
 * Strategy: Full course access + meaningful AI assistance. This is the "I'm
 * actively learning" tier. The AI coach has limited memory, creating a natural
 * upgrade moment when users want deeper personalization.
 *
 * Based on: Coursera Plus ($59/mo), Hinge basic premium, Jasper Creator ($39/mo).
 *
 * Israeli market: ₪79/mo sits in the "reasonable monthly investment" zone,
 * comparable to a gym membership (₪99-419/mo in Israel).
 *
 * Annual: ₪599/year = ₪49.9/mo effective (37% savings) - strong conversion driver.
 */
const BASIC_TIER: PricingTier = {
  id: "basic",
  name: "מגלה",
  subtitle: "כל הקורס + מאמן AI",
  description:
    "גישה מלאה לכל 73 השיעורים, מאמן AI אישי, וכלים שיעזרו לך להתחיל לשנות את חיי הדייטינג שלך.",
  valueProp:
    "פחות ממחיר ארוחת ערב יוצאת דופן בחודש, ואתה מקבל שיטה מוכחת + מאמן AI זמין 24/7. 461 זוגות כבר הצליחו.",
  upgradeNudge:
    "רוצה שה-AI יזכור אותך לעומק, סימולטור קולי ווידאו, וקהילה פעילה? הפרימיום ייקח אותך לשלב הבא.",
  priceMonthly: 79,
  priceAnnual: 599,
  priceOneTime: null,
  billingCycles: ["monthly", "annual"],
  effectiveMonthlyOnAnnual: 49.9,
  annualSavingsPercent: 37,
  badge: null,
  isRecommended: false,
  accentColor: "#3B82F6", // blue-500
  icon: "Compass",
  maxUsers: 1,
  features: {
    course_access: "כל 73 השיעורים",
    lesson_count: 73,
    ai_chat_messages: { value: 100, unit: "הודעות/חודש" },
    ai_chat_context: "שבוע אחרון",
    simulator_scenarios: 10,
    simulator_voice: false,
    simulator_video: false,
    resource_library: "מלא",
    community_access: "קריאה + כתיבה",
    community_badges: "בסיסי",
    community_leaderboard: true,
    profile_builder: "מלא",
    photo_analysis: { value: 3, unit: "ניתוחים/חודש" },
    date_analysis: { value: 2, unit: "ניתוחים/חודש" },
    group_coaching: false,
    masterclasses: false,
    progress_reports: "חודשי בסיסי",
    early_access: false,
    priority_support: false,
    certificate: true,
    offline_access: false,
  },
}

/**
 * PREMIUM TIER - "משנה" (Transformer)
 *
 * Strategy: The "transformation" tier. Unlimited AI with deep memory, full
 * simulator (voice + video), active community participation. This is where
 * serious users commit to real change.
 *
 * Based on: Tinder Gold (~$30-45/mo), ChatGPT Plus ($20/mo), Jasper Pro ($59/mo).
 * Premium coaching membership (Matthew Hussey Love Life Club ~$40/mo).
 *
 * Israeli market: ₪149/mo is in the "premium but accessible" range.
 * Annual: ₪1,149/year = ₪95.75/mo effective (36% savings).
 *
 * This is the RECOMMENDED tier - highest margin, best value perception.
 */
const PREMIUM_TIER: PricingTier = {
  id: "premium",
  name: "משנה",
  subtitle: "שינוי אמיתי מתחיל כאן",
  description:
    "מאמן AI ללא הגבלה שזוכר הכל, סימולטור דייט מתקדם עם קול ווידאו, קהילה פעילה, וכל הכלים ללא מגבלות.",
  valueProp:
    "תחשוב על זה - מאמן אישי 24/7, סימולטור לתרגול דייטים, וקהילה תומכת. הכל במחיר של פגישה אחת עם יועץ זוגיות. זו ההשקעה הכי חכמה שתעשה בחיי האהבה שלך.",
  upgradeNudge:
    "מוכן לקואצ׳ינג קבוצתי חי עם אלעד, מאסטרקלאסים בלעדיים ודוחות התקדמות מעמיקים? ה-VIP הוא השלב הסופי.",
  priceMonthly: 149,
  priceAnnual: 1149,
  priceOneTime: null,
  billingCycles: ["monthly", "annual"],
  effectiveMonthlyOnAnnual: 95.75,
  annualSavingsPercent: 36,
  badge: "הכי פופולרי",
  isRecommended: true,
  accentColor: "#8B5CF6", // violet-500
  icon: "Zap",
  maxUsers: 1,
  features: {
    course_access: "כל 73 השיעורים",
    lesson_count: 73,
    ai_chat_messages: "ללא הגבלה",
    ai_chat_context: "כל ההיסטוריה",
    simulator_scenarios: "כל התרחישים",
    simulator_voice: true,
    simulator_video: true,
    resource_library: "מלא + בלעדי",
    community_access: "מלא + תגובות מורחבות",
    community_badges: "פרימיום",
    community_leaderboard: true,
    profile_builder: "מלא + AI מתקדם",
    photo_analysis: "ללא הגבלה",
    date_analysis: "ללא הגבלה",
    group_coaching: false,
    masterclasses: "צפייה בהקלטות",
    progress_reports: "שבועי מפורט",
    early_access: true,
    priority_support: false,
    certificate: true,
    offline_access: true,
  },
}

/**
 * VIP TIER - "מוביל" (Leader)
 *
 * Strategy: The highest subscription tier, positioned as a "leadership investment."
 * NOT 1-on-1 coaching (that costs thousands separately). Instead, delivers group
 * coaching, exclusive masterclasses, advanced reporting, and community leadership.
 *
 * Based on: Tony Robbins group coaching ($1,000-5,000 total), Matthew Hussey
 * virtual retreat ($1,697 total). Positioned as the digital equivalent of a
 * premium group program, delivered continuously for ₪299/mo.
 *
 * Key psychology: When Elad's 1-on-1 coaching costs thousands, ₪299/mo for
 * group coaching + everything else feels like extraordinary value. The anchor
 * effect is critical here.
 *
 * Annual: ₪2,299/year = ₪191.6/mo effective (36% savings).
 *
 * VIP includes EVERYTHING in Premium + group coaching, exclusive masterclasses,
 * advanced AI reports, VIP community status, and early access to beta features.
 */
const VIP_TIER: PricingTier = {
  id: "vip",
  name: "מוביל",
  subtitle: "חווית השינוי המלאה",
  description:
    "קואצ׳ינג קבוצתי חי עם אלעד, מאסטרקלאסים בלעדיים, דוחות AI מתקדמים, סטטוס VIP בקהילה, וגישה ראשונה לכל דבר חדש.",
  valueProp:
    "קואצ׳ינג אישי עם אלעד עולה אלפי שקלים. כאן אתה מקבל אותו במפגשים קבוצתיים חיים, יחד עם כל מה שהפלטפורמה מציעה, במחיר שבריר מליווי אישי. זו ההזדמנות לקבל ערך של אלפים בכל חודש.",
  upgradeNudge: null, // Top tier - no upgrade nudge
  priceMonthly: 299,
  priceAnnual: 2299,
  priceOneTime: null,
  billingCycles: ["monthly", "annual"],
  effectiveMonthlyOnAnnual: 191.6,
  annualSavingsPercent: 36,
  badge: "VIP",
  isRecommended: false,
  accentColor: "#F59E0B", // amber-500
  icon: "Crown",
  maxUsers: 1,
  features: {
    course_access: "כל 73 השיעורים",
    lesson_count: 73,
    ai_chat_messages: "ללא הגבלה",
    ai_chat_context: "כל ההיסטוריה + ניתוח מעמיק",
    simulator_scenarios: "כל התרחישים + בלעדיים",
    simulator_voice: true,
    simulator_video: true,
    resource_library: "מלא + VIP בלעדי",
    community_access: "מלא + סטטוס VIP",
    community_badges: "VIP זהב",
    community_leaderboard: true,
    profile_builder: "מלא + AI מתקדם + ביקורת אישית",
    photo_analysis: "ללא הגבלה + ביקורת מקצועית",
    date_analysis: "ללא הגבלה + ייעוץ אסטרטגי",
    group_coaching: { value: 2, unit: "מפגשים חיים/חודש" },
    masterclasses: "חי + הקלטות + Q&A",
    progress_reports: "שבועי מתקדם + תוכנית פעולה",
    early_access: true,
    priority_support: true,
    certificate: true,
    offline_access: true,
  },
}

/**
 * COURSE PURCHASE - "הקורס המלא" (The Full Course)
 *
 * Strategy: One-time purchase for users who prefer ownership over subscription.
 * Research shows Israeli consumers are 2.5x more likely to prefer ownership.
 * This captures the "I want to buy it once" segment.
 *
 * Priced at ₪997-1,497 range per Elad's website benchmarks.
 * Includes course + basic AI + basic tools. No community/coaching.
 *
 * ₪1,197 sits perfectly in the middle of the range and creates clear
 * value comparison: 15 months of Basic (₪79 x 15 = ₪1,185) vs buying
 * forever. But the subscription has more features, creating an
 * interesting decision that often leads to subscription anyway.
 */
const COURSE_TIER: PricingTier = {
  id: "course",
  name: "הקורס המלא",
  subtitle: "רכישה חד-פעמית",
  description:
    "גישה לצמיתות לכל 73 השיעורים של הקורס, כולל תעודת סיום. מאמן AI בסיסי וכלים נלווים לשנה הראשונה.",
  valueProp:
    "שלם פעם אחת, למד לנצח. הקורס שעזר ל-461 זוגות שלך לצמיתות. מתאים למי שיודע מה הוא רוצה ומעדיף לא להתחייב למנוי.",
  upgradeNudge:
    "רוצה מאמן AI ללא הגבלה, סימולטור דייטים וקהילה? שדרג למנוי פרימיום וקבל הנחה מיוחדת כבעל הקורס.",
  priceMonthly: null,
  priceAnnual: null,
  priceOneTime: 1197,
  billingCycles: ["one_time"],
  effectiveMonthlyOnAnnual: null,
  annualSavingsPercent: null,
  badge: "לצמיתות",
  isRecommended: false,
  accentColor: "#10B981", // emerald-500
  icon: "BookOpen",
  maxUsers: 1,
  features: {
    course_access: "כל 73 השיעורים - לצמיתות",
    lesson_count: 73,
    ai_chat_messages: { value: 30, unit: "הודעות/חודש (שנה ראשונה)" },
    ai_chat_context: "שבוע אחרון (שנה ראשונה)",
    simulator_scenarios: 5,
    simulator_voice: false,
    simulator_video: false,
    resource_library: "מלא",
    community_access: "קריאה בלבד",
    community_badges: false,
    community_leaderboard: false,
    profile_builder: "בסיסי",
    photo_analysis: { value: 1, unit: "ניתוח/חודש (שנה ראשונה)" },
    date_analysis: false,
    group_coaching: false,
    masterclasses: false,
    progress_reports: false,
    early_access: false,
    priority_support: false,
    certificate: true,
    offline_access: true,
  },
}

// ---------------------------------------------------------------------------
// All Tiers (ordered for display)
// ---------------------------------------------------------------------------

export const PRICING_TIERS: PricingTier[] = [
  FREE_TIER,
  BASIC_TIER,
  PREMIUM_TIER,
  VIP_TIER,
  COURSE_TIER,
]

export const SUBSCRIPTION_TIERS: PricingTier[] = [
  FREE_TIER,
  BASIC_TIER,
  PREMIUM_TIER,
  VIP_TIER,
]

// ---------------------------------------------------------------------------
// Premium Add-Ons (A La Carte)
// ---------------------------------------------------------------------------

/**
 * Add-ons let any user (including free) purchase specific capabilities
 * without committing to a full tier upgrade. This captures "feature-specific"
 * demand and provides a low-friction upgrade path.
 *
 * Based on: Tinder's microtransaction model (Boosts, Super Likes),
 * dating app a la carte features, SaaS usage-based add-ons.
 */
export const ADD_ONS: AddOn[] = [
  {
    id: "ai_unlimited",
    name: "AI ללא הגבלה",
    description: "הודעות ללא הגבלה למאמן ה-AI + זיכרון מלא",
    price: 49,
    billingCycle: "monthly",
    availableForTiers: ["free", "basic"],
    includedInTiers: ["premium", "vip"],
    icon: "Bot",
  },
  {
    id: "simulator_advanced",
    name: "סימולטור מתקדם",
    description: "כל התרחישים + סימולטור קולי ווידאו",
    price: 39,
    billingCycle: "monthly",
    availableForTiers: ["free", "basic"],
    includedInTiers: ["premium", "vip"],
    icon: "Video",
  },
  {
    id: "photo_analysis",
    name: "חבילת ניתוח תמונות",
    description: "10 ניתוחי תמונות עם המלצות AI מפורטות",
    price: 29,
    billingCycle: "one_time",
    availableForTiers: ["free", "basic", "course"],
    includedInTiers: ["premium", "vip"],
    icon: "Camera",
  },
  {
    id: "date_analysis",
    name: "חבילת ניתוח דייטים",
    description: "5 ניתוחי דייט מעמיקים עם תובנות ותוכנית שיפור",
    price: 39,
    billingCycle: "one_time",
    availableForTiers: ["free", "basic", "course"],
    includedInTiers: ["premium", "vip"],
    icon: "HeartHandshake",
  },
  {
    id: "profile_builder_pro",
    name: "בונה פרופיל PRO",
    description: "בניית פרופיל דייטינג מושלם עם AI מתקדם + ביקורת מקצועית",
    price: 69,
    billingCycle: "one_time",
    availableForTiers: ["free", "basic", "course"],
    includedInTiers: ["vip"],
    icon: "UserCheck",
  },
  {
    id: "masterclass_bundle",
    name: "חבילת מאסטרקלאסים",
    description: "גישה ל-6 מאסטרקלאסים מוקלטים על נושאים מתקדמים",
    price: 149,
    billingCycle: "one_time",
    availableForTiers: ["free", "basic", "premium", "course"],
    includedInTiers: ["vip"],
    icon: "GraduationCap",
  },
  {
    id: "progress_report",
    name: "דוח התקדמות מעמיק",
    description: "ניתוח AI מקיף של כל ההתקדמות שלך עם תוכנית פעולה מותאמת",
    price: 49,
    billingCycle: "one_time",
    availableForTiers: ["free", "basic", "course"],
    includedInTiers: ["premium", "vip"],
    icon: "BarChart3",
  },
  {
    id: "priority_support",
    name: "תמיכה בעדיפות",
    description: "מענה תוך 4 שעות, צ׳אט ישיר עם צוות התמיכה",
    price: 19,
    billingCycle: "monthly",
    availableForTiers: ["free", "basic", "premium", "course"],
    includedInTiers: ["vip"],
    icon: "Headphones",
  },
]

// ---------------------------------------------------------------------------
// Feature Comparison Matrix (for pricing page tables)
// ---------------------------------------------------------------------------

export type ComparisonRow = {
  feature: FeatureDefinition
  values: Record<TierId, FeatureValue>
}

/**
 * Generates a comparison matrix for the pricing page.
 * Groups features by category for organized display.
 */
export function generateComparisonMatrix(): {
  category: FeatureCategory
  categoryName: string
  rows: ComparisonRow[]
}[] {
  const categoryNames: Record<FeatureCategory, string> = {
    course: "קורס",
    ai: "מאמן AI",
    simulator: "סימולטור דייטים",
    tools: "כלים",
    community: "קהילה",
    coaching: "קואצ׳ינג ותוכן",
    extras: "תוספות",
  }

  const categoryOrder: FeatureCategory[] = [
    "course",
    "ai",
    "simulator",
    "tools",
    "community",
    "coaching",
    "extras",
  ]

  return categoryOrder.map((category) => {
    const features = FEATURE_DEFINITIONS.filter(
      (f) => f.category === category
    ).sort((a, b) => a.sortOrder - b.sortOrder)

    const rows: ComparisonRow[] = features.map((feature) => ({
      feature,
      values: {
        free: FREE_TIER.features[feature.id],
        basic: BASIC_TIER.features[feature.id],
        premium: PREMIUM_TIER.features[feature.id],
        vip: VIP_TIER.features[feature.id],
        course: COURSE_TIER.features[feature.id],
      },
    }))

    return {
      category,
      categoryName: categoryNames[category],
      rows,
    }
  })
}

// ---------------------------------------------------------------------------
// Pricing Utilities
// ---------------------------------------------------------------------------

/**
 * Calculate the annual savings amount in ₪.
 */
export function calculateAnnualSavings(tier: PricingTier): number | null {
  if (tier.priceMonthly === null || tier.priceAnnual === null) {
    return null
  }
  return tier.priceMonthly * 12 - tier.priceAnnual
}

/**
 * Calculate annual savings as a percentage.
 */
export function calculateAnnualSavingsPercent(tier: PricingTier): number | null {
  if (tier.priceMonthly === null || tier.priceAnnual === null) {
    return null
  }
  const fullYearPrice = tier.priceMonthly * 12
  const savings = fullYearPrice - tier.priceAnnual
  return Math.round((savings / fullYearPrice) * 100)
}

/**
 * Format price for display in Hebrew locale.
 * Examples: "₪79", "₪49.90", "חינם"
 */
export function formatPrice(amount: number | null): string {
  if (amount === null) return "חינם"
  if (amount === 0) return "חינם"

  // Format with Hebrew locale; drop decimals if whole number
  const hasDecimals = amount % 1 !== 0
  return `₪${amount.toLocaleString("he-IL", {
    minimumFractionDigits: hasDecimals ? 2 : 0,
    maximumFractionDigits: 2,
  })}`
}

/**
 * Get the display billing label in Hebrew.
 */
export function getBillingLabel(cycle: BillingCycle): string {
  switch (cycle) {
    case "monthly":
      return "לחודש"
    case "annual":
      return "לשנה"
    case "one_time":
      return "תשלום חד-פעמי"
  }
}

/**
 * Determine the best tier for a given feature need.
 * Returns the cheapest tier that includes the feature.
 */
export function cheapestTierForFeature(featureId: FeatureId): PricingTier | null {
  for (const tier of SUBSCRIPTION_TIERS) {
    const value = tier.features[featureId]
    if (value !== false && value !== 0) {
      return tier
    }
  }
  return null
}

/**
 * Check if a specific add-on is available for a given tier.
 */
export function isAddOnAvailable(addOnId: AddOnId, tierId: TierId): boolean {
  const addOn = ADD_ONS.find((a) => a.id === addOnId)
  if (!addOn) return false
  return addOn.availableForTiers.includes(tierId)
}

/**
 * Check if a specific add-on is already included in a given tier.
 */
export function isAddOnIncluded(addOnId: AddOnId, tierId: TierId): boolean {
  const addOn = ADD_ONS.find((a) => a.id === addOnId)
  if (!addOn) return false
  return addOn.includedInTiers.includes(tierId)
}

/**
 * Get the tier object by ID.
 */
export function getTierById(tierId: TierId): PricingTier | undefined {
  return PRICING_TIERS.find((t) => t.id === tierId)
}

/**
 * Get all add-ons available for a specific tier (excluding already included).
 */
export function getAvailableAddOns(tierId: TierId): AddOn[] {
  return ADD_ONS.filter(
    (a) =>
      a.availableForTiers.includes(tierId) &&
      !a.includedInTiers.includes(tierId)
  )
}

/**
 * Calculate total monthly cost including add-ons.
 */
export function calculateTotalMonthlyCost(
  tierId: TierId,
  billingCycle: BillingCycle,
  addOnIds: AddOnId[] = []
): number {
  const tier = getTierById(tierId)
  if (!tier) return 0

  let baseCost = 0
  if (billingCycle === "annual" && tier.effectiveMonthlyOnAnnual !== null) {
    baseCost = tier.effectiveMonthlyOnAnnual
  } else if (billingCycle === "monthly" && tier.priceMonthly !== null) {
    baseCost = tier.priceMonthly
  } else if (billingCycle === "one_time" && tier.priceOneTime !== null) {
    baseCost = tier.priceOneTime // Not truly "monthly" but total cost
  }

  const addOnCost = addOnIds.reduce((sum, addOnId) => {
    const addOn = ADD_ONS.find((a) => a.id === addOnId)
    if (!addOn) return sum
    if (addOn.includedInTiers.includes(tierId)) return sum // Already included
    if (addOn.billingCycle === "monthly") return sum + addOn.price
    return sum // One-time add-ons don't contribute to monthly cost
  }, 0)

  return baseCost + addOnCost
}

// ---------------------------------------------------------------------------
// Social Proof / Metrics
// ---------------------------------------------------------------------------

export const SOCIAL_PROOF: CoupleSuccessMetric = {
  count: 461,
  label: "זוגות מצאו אהבה",
  description: "461 זוגות כבר מצאו אהבה דרך השיטה של אומנות הקשר",
}

// ---------------------------------------------------------------------------
// Pricing Page Content
// ---------------------------------------------------------------------------

export const PRICING_PAGE_CONTENT = {
  headline: "השקעה בחיי האהבה שלך",
  subheadline: "השיטה שעזרה ל-461 זוגות למצוא אהבה - עכשיו זמינה לך",
  guaranteeText: "30 יום אחריות החזר כספי מלא. בלי שאלות.",
  guaranteeDays: 30,
  faqTitle: "שאלות נפוצות",
  annualToggleLabel: "שנתי (חסכון של עד 37%)",
  monthlyToggleLabel: "חודשי",
  courseCtaText: "מעדיף רכישה חד-פעמית?",
  enterpriseCtaText: "מחפש ליווי אישי? קואצ׳ינג 1-על-1 עם אלעד",
  enterpriseCtaLink: "/contact",
  /** The 1-on-1 coaching CTA serves as the price anchor */
  coachingAnchorText: "ליווי אישי 1-על-1 עם אלעד מתחיל מאלפי שקלים",
} as const

// ---------------------------------------------------------------------------
// Revenue Projections (internal reference, not displayed)
// ---------------------------------------------------------------------------

/**
 * Conservative revenue projections based on research benchmarks.
 *
 * Assumptions:
 * - 5% free-to-paid conversion (industry avg 3-5%, top: 5-10%)
 * - Tier distribution: 40% Basic, 40% Premium, 15% VIP, 5% Course
 * - Annual:Monthly ratio: 60:40 (Israeli ownership preference)
 * - Add-on attach rate: 15% of subscribers
 *
 * These are internal planning numbers, NOT displayed to users.
 */
export const REVENUE_MODEL = {
  conversionRate: 0.05,
  tierDistribution: {
    basic: 0.4,
    premium: 0.4,
    vip: 0.15,
    course: 0.05,
  },
  annualToMonthlyRatio: 0.6,
  addOnAttachRate: 0.15,
  /**
   * Weighted Average Revenue Per User (monthly equivalent).
   *
   * Calculation:
   * Basic annual:  40% x 60% x ₪49.9  = ₪11.98
   * Basic monthly: 40% x 40% x ₪79    = ₪12.64
   * Premium annual:  40% x 60% x ₪95.75 = ₪22.98
   * Premium monthly: 40% x 40% x ₪149   = ₪23.84
   * VIP annual:  15% x 60% x ₪191.6 = ₪17.24
   * VIP monthly: 15% x 40% x ₪299   = ₪17.94
   * Course:      5% x ₪1197 / 12    = ₪4.99
   * Add-ons:     15% x ~₪39 avg     = ₪5.85
   *
   * Total WARPU = ~₪117.46/mo
   */
  estimatedWARPU: 117.46,
} as const
