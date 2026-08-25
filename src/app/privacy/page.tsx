import type { Metadata } from "next";
import { LegalPage, LegalSection } from "@/components/legal/legal-page";

export const metadata: Metadata = {
  title: "מדיניות פרטיות — טיוטה",
  description: "טיוטת מדיניות הפרטיות של הדרך — אומנות הקשר, לביקורת ולאישור.",
  alternates: { canonical: "/privacy" },
  robots: { index: false, follow: false },
};

export default function PrivacyPage() {
  return (
    <LegalPage title="מדיניות פרטיות" updated="25 באוגוסט 2026">
      <LegalSection title="מהי הטיוטה הזו">
        <p>העמוד מתאר בשפה פשוטה את סוגי המידע שהמערכת עשויה לעבד. לפני פרסום סופי יש להשלים בדיקה משפטית, רשימת ספקים מדויקת ותקופות שמירה.</p>
      </LegalSection>
      <LegalSection title="מידע שנמסר למערכת">
        <p>בעת הרשמה, פנייה, למידה או שימוש בכלי תרגול, המערכת עשויה לקבל פרטי חשבון, תוכן שהוזן, נתוני התקדמות ונתונים טכניים הנדרשים להפעלת השירות ולאבטחתו.</p>
      </LegalSection>
      <LegalSection title="כלי AI">
        <p>טקסט שמוזן לכלי AI עשוי להישלח לספקי מודלים חיצוניים לצורך הפקת תשובה. אין להזין פרטים מזהים, מידע רפואי, מידע פיננסי או מידע רגיש עליכם או על אחרים.</p>
      </LegalSection>
      <LegalSection title="ספקי תשתית">
        <p>המערכת משתמשת בשירותי תשתית חיצוניים לצורכי אירוח, מסד נתונים, אימות משתמשים, אנליטיקה ושירותי AI. הרשימה, מטרות העיבוד והעברות המידע יושלמו לפני אישור הנוסח.</p>
      </LegalSection>
      <LegalSection title="בחירות ופניות">
        <p>ניתן לפנות בבקשה לעיין, לתקן או למחוק מידע, בכפוף לדין ולחובות שמירה החלות על המפעיל. תהליך הטיפול וזמני המענה יוגדרו בנוסח המאושר.</p>
      </LegalSection>
    </LegalPage>
  );
}
