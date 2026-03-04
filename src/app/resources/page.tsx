"use client";

import { useState } from "react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

const CATEGORIES = [
  { id: "all", label: "הכל" },
  { id: "books", label: "ספרים" },
  { id: "articles", label: "מאמרים" },
  { id: "podcasts", label: "פודקאסטים" },
  { id: "videos", label: "סרטונים" },
  { id: "research", label: "מחקרים" },
  { id: "tools", label: "כלים" },
];

interface Resource {
  id: string;
  title: string;
  description: string;
  category: string;
  type: "book" | "article" | "podcast" | "video" | "research" | "tool";
  url?: string;
  author?: string;
  isFree: boolean;
}

const RESOURCES: Resource[] = [
  {
    id: "1",
    title: "אומנות הקשר - הספר",
    description: "הספר המלא של אומנות הקשר. 13 פרקים, 56,000 מילים. כל מה שצריך לדעת על דייטינג, תקשורת, משיכה וזוגיות.",
    category: "books",
    type: "book",
    author: "אומנות הקשר",
    isFree: false,
  },
  {
    id: "2",
    title: "36 השאלות להתאהבות",
    description: "מחקר מפורסם של ד\"ר ארתור ארון שמראה איך 36 שאלות ספציפיות יכולות ליצור קרבה ואינטימיות בין שני אנשים.",
    category: "research",
    type: "research",
    author: "ד\"ר ארתור ארון",
    isFree: true,
  },
  {
    id: "3",
    title: "5 שפות האהבה",
    description: "גארי צ'פמן מסביר את חמש הדרכים שבהן אנשים נותנים ומקבלים אהבה. הבנת השפה של בן/בת הזוג משנה הכל.",
    category: "books",
    type: "book",
    author: "גארי צ'פמן",
    isFree: false,
  },
  {
    id: "4",
    title: "מדע המשיכה - מה באמת עובד?",
    description: "סיכום של מחקרים מובילים בנושא משיכה, כימיה בין-אישית, והגורמים שקובעים האם יש 'ניצוץ' בין שני אנשים.",
    category: "articles",
    type: "article",
    author: "אומנות הקשר",
    isFree: true,
  },
  {
    id: "5",
    title: "פודקאסט: הדרך לזוגיות",
    description: "פרקים שבועיים על דייטינג, מערכות יחסים, תקשורת זוגית וצמיחה אישית. כולל ראיונות עם מומחים.",
    category: "podcasts",
    type: "podcast",
    author: "אומנות הקשר",
    isFree: true,
  },
  {
    id: "6",
    title: "7 עקרונות לזוגיות מצליחה",
    description: "מחקר פורץ הדרך של ד\"ר ג'ון גוטמן על מה שמבדיל בין זוגות מאושרים לאומללים.",
    category: "research",
    type: "research",
    author: "ד\"ר ג'ון גוטמן",
    isFree: false,
  },
  {
    id: "7",
    title: "איך לבנות פרופיל דייטינג מנצח",
    description: "מדריך מקיף עם טיפים פרקטיים לבניית פרופיל שמושך את האנשים הנכונים. כולל דוגמאות ותמונות.",
    category: "articles",
    type: "article",
    author: "אומנות הקשר",
    isFree: true,
  },
  {
    id: "8",
    title: "TED: הכוח של פגיעות",
    description: "ברנה בראון מסבירה למה פגיעות היא לא חולשה - אלא הבסיס לאהבה, שייכות ושמחה.",
    category: "videos",
    type: "video",
    url: "https://www.ted.com/talks/brene_brown_the_power_of_vulnerability",
    author: "ברנה בראון",
    isFree: true,
  },
  {
    id: "9",
    title: "תרגיל: מפת הערכים שלי",
    description: "תרגיל מודרך שעוזר לזהות את הערכים הכי חשובים לך בזוגיות. כלי חיוני לפני שמתחילים לחפש.",
    category: "tools",
    type: "tool",
    author: "אומנות הקשר",
    isFree: true,
  },
  {
    id: "10",
    title: "התקשרות בזוגיות - מדריך מקיף",
    description: "הבנת סגנונות ההתקשרות (בטוח, חרד, נמנע) ואיך הם משפיעים על מערכות היחסים שלנו.",
    category: "articles",
    type: "article",
    author: "אומנות הקשר",
    isFree: true,
  },
];

const TYPE_ICONS: Record<string, string> = {
  book: "📚",
  article: "📝",
  podcast: "🎙️",
  video: "🎬",
  research: "🔬",
  tool: "🛠️",
};

const TYPE_LABELS: Record<string, string> = {
  book: "ספר",
  article: "מאמר",
  podcast: "פודקאסט",
  video: "סרטון",
  research: "מחקר",
  tool: "כלי",
};

export default function ResourcesPage() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = RESOURCES.filter((r) => {
    const matchesCategory = selectedCategory === "all" || r.category === selectedCategory;
    const query = searchQuery.trim().toLowerCase();
    const matchesSearch = !query || r.title.toLowerCase().includes(query) || r.description.toLowerCase().includes(query);
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-dvh bg-white dark:bg-zinc-950">
      <Header />

      <main className="container mx-auto px-4 py-12">
        <div className="mx-auto max-w-4xl">
          <h1 className="mb-2 text-3xl font-bold text-blue-500 dark:text-white md:text-4xl">
            ספריית המשאבים
          </h1>
          <p className="mb-8 text-lg text-zinc-500 dark:text-zinc-400">
            ספרים, מאמרים, פודקאסטים, מחקרים וכלים שיעזרו לך בדרך לזוגיות
          </p>

          {/* Search */}
          <div className="mb-6">
            <input
              type="text"
              placeholder="חיפוש..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 outline-none transition-colors placeholder:text-zinc-400 focus:border-brand-300 focus:ring-2 focus:ring-brand-100 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white dark:focus:border-brand-700 dark:focus:ring-blue-500/20"
            />
          </div>

          {/* Category filters */}
          <div className="mb-8 flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                  selectedCategory === cat.id
                    ? "bg-brand-500 text-white"
                    : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Results count */}
          <p className="mb-4 text-sm text-zinc-400 dark:text-zinc-500">
            {filtered.length} תוצאות
          </p>

          {/* Resource grid */}
          <div className="grid gap-4 sm:grid-cols-2">
            {filtered.map((resource) => (
              <ResourceCard key={resource.id} resource={resource} />
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="py-16 text-center text-zinc-400">
              <p className="text-lg">לא נמצאו תוצאות</p>
              <p className="mt-1 text-sm">נסה מילות חיפוש אחרות</p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

function ResourceCard({ resource }: { resource: Resource }) {
  return (
    <div className="group flex flex-col rounded-2xl border border-zinc-100 bg-white p-5 transition-shadow hover:shadow-lg dark:border-zinc-800 dark:bg-zinc-900">
      <div className="mb-3 flex items-start justify-between">
        <span className="text-2xl">{TYPE_ICONS[resource.type]}</span>
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
            {TYPE_LABELS[resource.type]}
          </span>
          {resource.isFree && (
            <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400">
              חינם
            </span>
          )}
        </div>
      </div>

      <h3 className="mb-1.5 text-base font-semibold text-zinc-900 transition-colors group-hover:text-brand-600 dark:text-white dark:group-hover:text-brand-400">
        {resource.title}
      </h3>

      {resource.author && (
        <p className="mb-2 text-xs text-zinc-400 dark:text-zinc-500">
          מאת: {resource.author}
        </p>
      )}

      <p className="mb-4 flex-1 text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
        {resource.description}
      </p>

      {resource.url ? (
        <a
          href={resource.url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-auto inline-flex items-center gap-1 text-sm font-medium text-brand-500 transition-colors hover:text-brand-600 dark:text-brand-400 dark:hover:text-brand-300"
        >
          צפייה
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
          </svg>
        </a>
      ) : (
        <span className="mt-auto text-sm text-zinc-400 dark:text-zinc-500">
          {resource.isFree ? "גישה חופשית למנויים" : "כלול בתוכנית פרימיום"}
        </span>
      )}
    </div>
  );
}
