import type { Metadata } from "next";
import { LegalPage, LegalSection } from "@/components/legal/legal-page";

export const metadata: Metadata = {
  title: "הצהרת נגישות — טיוטה",
  description: "טיוטת הצהרת הנגישות של הדרך — אומנות הקשר, לביקורת ולאישור.",
  alternates: { canonical: "/accessibility" },
  robots: { index: false, follow: false },
};

export default function AccessibilityPage() {
  return (
    <LegalPage title="הצהרת נגישות" updated="25 באוגוסט 2026">
      <LegalSection title="המחויבות שלנו">
        <p>אנו פועלים כדי שהמערכת תהיה שימושית לאנשים עם מגוון יכולות, מכשירים וטכנולוגיות מסייעות. העבודה כוללת ניווט במקלדת, מבנה כותרות, ניגודיות, טקסט חלופי ותצוגה מותאמת לנייד.</p>
      </LegalSection>
      <LegalSection title="מצב הבדיקה">
        <p>נכון למועד הטיוטה מתבצעות בדיקות אוטומטיות וידניות לפי עקרונות WCAG 2.1 ברמת AA. לפני פרסום הצהרה סופית יש להשלים סבב בדיקות מלא, לתעד חריגים ולציין התאמות שבוצעו.</p>
      </LegalSection>
      <LegalSection title="פנייה בנושא נגישות">
        <p>אם נתקלתם במחסום, ציינו בפנייה את כתובת העמוד, הפעולה שניסיתם לבצע, המכשיר והדפדפן או הטכנולוגיה המסייעת. הפרטים יעזרו לנו לשחזר את הבעיה ולטפל בה.</p>
      </LegalSection>
      <LegalSection title="מידע שיש להשלים">
        <p>לפני אישור סופי יתווספו שם רכז או רכזת הנגישות, דרכי קשר ישירות, תאריך בדיקה, שיטת הבדיקה והסדרי נגישות פיזיים ככל שהם רלוונטיים.</p>
      </LegalSection>
    </LegalPage>
  );
}
