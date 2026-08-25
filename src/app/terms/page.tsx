import type { Metadata } from "next";
import { LegalPage, LegalSection } from "@/components/legal/legal-page";

export const metadata: Metadata = {
  title: "תנאי שימוש — טיוטה",
  description: "טיוטת תנאי השימוש של הדרך — אומנות הקשר, לביקורת ולאישור.",
  alternates: { canonical: "/terms" },
  robots: { index: false, follow: false },
};

export default function TermsPage() {
  return (
    <LegalPage title="תנאי שימוש" updated="25 באוגוסט 2026">
      <LegalSection title="מעמד הטיוטה">
        <p>זהו שלד עבודה לביקורת אנושית ומשפטית. הוא אינו נוסח סופי ואינו מחליף תנאים מאושרים שיוצגו למשתמשים לפני פתיחת השירות המלא.</p>
      </LegalSection>
      <LegalSection title="מטרת השירות">
        <p>הדרך היא סביבת למידה ותרגול בתחום ההיכרות, התקשורת והקשר. התכנים וכלי התרגול אינם טיפול, אבחון, ייעוץ רפואי, ייעוץ משפטי או שירות חירום.</p>
      </LegalSection>
      <LegalSection title="כלי AI ותוכן אוטומטי">
        <p>תשובות אוטומטיות עלולות להיות שגויות, חלקיות או לא מתאימות למקרה מסוים. האחריות להפעיל שיקול דעת ולהימנע מהסתמכות בלעדית על תשובה אוטומטית נשארת בידי המשתמש.</p>
      </LegalSection>
      <LegalSection title="שימוש ראוי">
        <p>אין להשתמש בשירות לפגיעה, התחזות, הטרדה, איסוף מידע על אחרים ללא רשות, הפרת זכויות או ניסיון לעקוף מנגנוני אבטחה והרשאות.</p>
      </LegalSection>
      <LegalSection title="רכישה, ביטול וזכאות">
        <p>המסלולים, המחירים, תנאי הביטול והזכאות לגישה יוגדרו רק לאחר אישור חוזה המוצר ותשתית התשלום. אין לראות בטיוטה זו הצעת מכר.</p>
      </LegalSection>
    </LegalPage>
  );
}
