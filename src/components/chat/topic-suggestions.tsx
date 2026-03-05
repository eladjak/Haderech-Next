"use client";

interface Topic {
  id: string;
  label: string;
  icon: string;
  prompt: string;
  color: string;
}

const TOPICS: Topic[] = [
  {
    id: "communication",
    label: "תקשורת בזוגיות",
    icon: "💬",
    prompt:
      "אני רוצה לשפר את התקשורת עם הפרטנר שלי. לפעמים אנחנו לא מצליחים להבין אחד את השני. איך אני יכול לתקשר טוב יותר?",
    color: "from-blue-400/20 to-blue-500/10 border-blue-200/60 text-blue-700 hover:border-blue-300/80 dark:border-blue-500/20 dark:text-blue-300 dark:hover:border-blue-400/40",
  },
  {
    id: "conflict",
    label: "ניהול קונפליקטים",
    icon: "⚖️",
    prompt:
      "אנחנו נכנסים לוויכוחים תכופים ולא יודע איך לצאת מהם בצורה טובה. תעזור לי להבין איך מנהלים קונפליקטים בריאים בזוגיות.",
    color: "from-orange-400/20 to-orange-500/10 border-orange-200/60 text-orange-700 hover:border-orange-300/80 dark:border-orange-500/20 dark:text-orange-300 dark:hover:border-orange-400/40",
  },
  {
    id: "first-date",
    label: "דייט ראשון",
    icon: "☕",
    prompt:
      "יש לי דייט ראשון בקרוב ואני קצת נרגש/ת. מה הדברים החשובים שצריך לזכור לדייט ראשון? איך לעשות רושם טוב אבל להיות עצמי?",
    color: "from-pink-400/20 to-pink-500/10 border-pink-200/60 text-pink-700 hover:border-pink-300/80 dark:border-pink-500/20 dark:text-pink-300 dark:hover:border-pink-400/40",
  },
  {
    id: "trust",
    label: "בניית אמון",
    icon: "🤝",
    prompt:
      "קשה לי לסמוך על אנשים ולפתוח את עצמי בזוגיות. איך בונים אמון בתוך מערכת יחסים ולמה לי קשה כל כך עם זה?",
    color: "from-green-400/20 to-green-500/10 border-green-200/60 text-green-700 hover:border-green-300/80 dark:border-green-500/20 dark:text-green-300 dark:hover:border-green-400/40",
  },
  {
    id: "love-languages",
    label: "שפות אהבה",
    icon: "❤️",
    prompt:
      "שמעתי על שפות אהבה ורוצה להבין יותר. איך אני מגלה מה שפת האהבה שלי ושל הפרטנר שלי? ואיך זה עוזר בזוגיות?",
    color: "from-red-400/20 to-red-500/10 border-red-200/60 text-red-700 hover:border-red-300/80 dark:border-red-500/20 dark:text-red-300 dark:hover:border-red-400/40",
  },
  {
    id: "breakup",
    label: "ריפוי מפרידה",
    icon: "💙",
    prompt:
      "עברתי פרידה לאחרונה ועדיין מתקשה להתקדם. המחשבות חוזרות כל הזמן. תעזור לי להבין איך מתרפאים ומתקדמים אחרי פרידה.",
    color: "from-indigo-400/20 to-indigo-500/10 border-indigo-200/60 text-indigo-700 hover:border-indigo-300/80 dark:border-indigo-500/20 dark:text-indigo-300 dark:hover:border-indigo-400/40",
  },
  {
    id: "boundaries",
    label: "הגדרת גבולות",
    icon: "🛡️",
    prompt:
      "קשה לי להגיד לא ולהציב גבולות, בעיקר במערכות יחסים. תמיד מרגיש/ת שאני מתפשר/ת יותר מדי. איך מגדירים גבולות בריאים?",
    color: "from-purple-400/20 to-purple-500/10 border-purple-200/60 text-purple-700 hover:border-purple-300/80 dark:border-purple-500/20 dark:text-purple-300 dark:hover:border-purple-400/40",
  },
  {
    id: "deepen",
    label: "העמקת קשר",
    icon: "🌱",
    prompt:
      "אני בזוגיות כבר כמה חודשים והיחסים טובים, אבל רוצה להעמיק את הקשר ולהרגיש שאנחנו באמת מחוברים. איך עושים את זה?",
    color: "from-teal-400/20 to-teal-500/10 border-teal-200/60 text-teal-700 hover:border-teal-300/80 dark:border-teal-500/20 dark:text-teal-300 dark:hover:border-teal-400/40",
  },
];

interface TopicSuggestionsProps {
  onSelectTopic: (prompt: string) => void;
  disabled?: boolean;
}

export function TopicSuggestions({
  onSelectTopic,
  disabled,
}: TopicSuggestionsProps) {
  return (
    <div className="w-full" dir="rtl">
      <p className="mb-3 text-xs font-medium text-blue-500/50 dark:text-zinc-500">
        נושאים נפוצים
      </p>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {TOPICS.map((topic) => (
          <button
            key={topic.id}
            type="button"
            onClick={() => onSelectTopic(topic.prompt)}
            disabled={disabled}
            className={`group flex flex-col items-center gap-1.5 rounded-xl border bg-gradient-to-br px-3 py-3 text-center transition-all hover:-translate-y-0.5 hover:shadow-sm disabled:cursor-not-allowed disabled:opacity-50 ${topic.color}`}
            aria-label={`בחר נושא: ${topic.label}`}
          >
            <span className="text-xl" aria-hidden="true">
              {topic.icon}
            </span>
            <span className="text-xs font-medium leading-tight">{topic.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
