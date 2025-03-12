"use client";

import { Container } from "@/components/ui/container";
import { Typography } from "@/components/ui/typography";

/**
 * Privacy Policy Page
 *
 * Basic privacy policy page for HaDerech application.
 * This page is required for Facebook OAuth authentication.
 */
export default function PrivacyPage() {
  return (
    <Container className="py-12">
      <div className="mx-auto max-w-3xl">
        <Typography variant="h1" className="mb-8 text-center">
          מדיניות פרטיות
        </Typography>

        <Typography variant="h2" className="mb-4 mt-8">
          מבוא
        </Typography>
        <Typography className="mb-6">
          ברוכים הבאים למדיניות הפרטיות של &quot;הדרך&quot;. אנו מכבדים את
          פרטיותך ומחויבים להגן על המידע האישי שלך. מדיניות פרטיות זו מסבירה
          כיצד אנו אוספים, משתמשים ומגנים על המידע שלך כאשר אתה משתמש באפליקציה
          שלנו.
        </Typography>

        <Typography variant="h2" className="mb-4 mt-8">
          איסוף מידע
        </Typography>
        <Typography className="mb-6">
          אנו אוספים מידע אישי שאתה מספק לנו כאשר אתה נרשם לאפליקציה, כולל שם,
          כתובת אימייל, ופרטי חשבון. כאשר אתה משתמש באימות חברתי (גוגל, פייסבוק,
          מייקרוסופט), אנו מקבלים גישה למידע בסיסי מהחשבון החברתי שלך בהתאם
          להרשאות שאתה מאשר.
        </Typography>

        <Typography variant="h2" className="mb-4 mt-8">
          שימוש במידע
        </Typography>
        <Typography className="mb-6">
          אנו משתמשים במידע שנאסף כדי:
          <ul className="my-2 list-inside list-disc">
            <li>לספק, לתחזק ולשפר את השירותים שלנו</li>
            <li>לזהות אותך ולאפשר לך להתחבר לחשבון שלך</li>
            <li>לשלוח לך עדכונים ומידע הקשורים לשירות</li>
            <li>להגיב לבקשות שירות לקוחות או תמיכה טכנית</li>
          </ul>
        </Typography>

        <Typography variant="h2" className="mb-4 mt-8">
          שיתוף מידע
        </Typography>
        <Typography className="mb-6">
          אנו לא מוכרים או משכירים את המידע האישי שלך לצדדים שלישיים למטרות
          שיווק. אנו עשויים לשתף מידע עם ספקי שירות צד שלישי שעוזרים לנו בתפעול
          האפליקציה ובאספקת השירותים שלנו.
        </Typography>

        <Typography variant="h2" className="mb-4 mt-8">
          אבטחת מידע
        </Typography>
        <Typography className="mb-6">
          אנו נוקטים באמצעים סבירים כדי להגן על המידע האישי שלך מפני אובדן,
          גניבה, שימוש לרעה, גישה לא מורשית, חשיפה, שינוי והשמדה. אנו משתמשים
          בטכנולוגיית הצפנה כדי להגן על רגישות המידע שלך.
        </Typography>

        <Typography variant="h2" className="mb-4 mt-8">
          עדכון ומחיקת מידע
        </Typography>
        <Typography className="mb-6">
          אתה יכול לעדכן, לתקן או למחוק את המידע האישי שלך בכל עת באמצעות הגדרות
          החשבון שלך באפליקציה. אתה גם יכול לבקש מאיתנו למחוק את החשבון שלך ואת
          כל המידע הקשור אליו.
        </Typography>

        <Typography variant="h2" className="mb-4 mt-8">
          שינויים במדיניות הפרטיות
        </Typography>
        <Typography className="mb-6">
          אנו עשויים לעדכן את מדיניות הפרטיות שלנו מעת לעת. אנו נודיע לך על
          שינויים משמעותיים באמצעות הודעה בולטת באפליקציה או באמצעות כתובת
          האימייל הרשומה בחשבונך.
        </Typography>

        <Typography variant="h2" className="mb-4 mt-8">
          יצירת קשר
        </Typography>
        <Typography className="mb-6">
          אם יש לך שאלות או חששות לגבי מדיניות הפרטיות שלנו, אנא צור קשר בכתובת:
          support@haderech.app
        </Typography>

        <div className="mt-8 text-center text-gray-500">
          <Typography variant="small">
            עודכן לאחרונה: {new Date().toLocaleDateString("he-IL")}
          </Typography>
        </div>
      </div>
    </Container>
  );
}
