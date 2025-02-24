# תמיכה בדפדפנים ומכשירים - אפליקציית "הדרך"

# Browser and Device Support - "HaDerech" Application

<div dir="rtl">

## סקירה כללית

מסמך זה מפרט את הדפדפנים, מערכות ההפעלה והמכשירים שבהם תומכת אפליקציית "הדרך" באופן רשמי. מטרתו לסייע למפתחים ולמשתמשי קצה להבין את דרישות המערכת ולהבטיח חווית משתמש אופטימלית.

</div>

<div dir="ltr">

## Overview

This document details the browsers, operating systems, and devices officially supported by the "HaDerech" application. Its purpose is to help developers and end users understand the system requirements and ensure an optimal user experience.

</div>

---

<div dir="rtl">

## דפדפנים נתמכים

### תמיכה מלאה

הדפדפנים הבאים נתמכים באופן מלא, כולל כל התכונות והפונקציונליות של האפליקציה:

| דפדפן            | גרסאות נתמכות | הערות                     |
| ---------------- | ------------- | ------------------------- |
| Google Chrome    | 90+           | מומלץ לחוויה אופטימלית    |
| Mozilla Firefox  | 88+           |                           |
| Microsoft Edge   | 90+           | מבוסס Chromium            |
| Apple Safari     | 14+           | macOS ו-iOS               |
| Samsung Internet | 15+           | מכשירי Android של Samsung |

### תמיכה חלקית

הדפדפנים הבאים נתמכים באופן חלקי. רוב הפונקציונליות תעבוד, אך ייתכנו בעיות בתכונות מתקדמות:

| דפדפן                 | גרסאות נתמכות | מגבלות ידועות                                          |
| --------------------- | ------------- | ------------------------------------------------------ |
| Google Chrome         | 80-89         | בעיות בסימולטור, תצוגת וידאו מוגבלת                    |
| Mozilla Firefox       | 78-87         | בעיות ברכיבי Drag & Drop, חווית משתמש מוגבלת בפורום    |
| Microsoft Edge Legacy | 18+           | אין תמיכה בתכונות WebRTC, מגבלות בעורך הטקסט המתקדם    |
| Apple Safari          | 12-13         | בעיות בתצוגה מותאמת, מגבלות בפונקציונליות של הבוט החכם |
| Opera                 | 70+           | בעיות עם התראות Push                                   |

### ללא תמיכה

הדפדפנים הבאים אינם נתמכים באופן רשמי. האפליקציה עשויה לעבוד, אך לא מובטחת חוויה אופטימלית:

- Internet Explorer (כל הגרסאות)
- דפדפנים בגרסאות נמוכות יותר מהמצוינות לעיל
- דפדפנים מרוחקים/שרתיים (למשל PhantomJS)

</div>

<div dir="ltr">

## Supported Browsers

### Full Support

The following browsers are fully supported, including all features and functionality of the application:

| Browser          | Supported Versions | Notes                              |
| ---------------- | ------------------ | ---------------------------------- |
| Google Chrome    | 90+                | Recommended for optimal experience |
| Mozilla Firefox  | 88+                |                                    |
| Microsoft Edge   | 90+                | Chromium-based                     |
| Apple Safari     | 14+                | macOS and iOS                      |
| Samsung Internet | 15+                | Samsung Android devices            |

### Partial Support

The following browsers are partially supported. Most functionality will work, but there may be issues with advanced features:

| Browser               | Supported Versions | Known Limitations                                                      |
| --------------------- | ------------------ | ---------------------------------------------------------------------- |
| Google Chrome         | 80-89              | Issues with simulator, limited video display                           |
| Mozilla Firefox       | 78-87              | Issues with Drag & Drop components, limited forum user experience      |
| Microsoft Edge Legacy | 18+                | No support for WebRTC features, limitations in advanced text editor    |
| Apple Safari          | 12-13              | Issues with responsive display, limitations in smart bot functionality |
| Opera                 | 70+                | Issues with Push notifications                                         |

### No Support

The following browsers are not officially supported. The application may work, but an optimal experience is not guaranteed:

- Internet Explorer (all versions)
- Browsers in versions lower than those specified above
- Headless/server browsers (e.g., PhantomJS)

</div>

---

<div dir="rtl">

## מערכות הפעלה נתמכות

### שולחן עבודה (Desktop)

| מערכת הפעלה  | גרסאות נתמכות      | הערות                            |
| ------------ | ------------------ | -------------------------------- |
| Windows      | 10+, 11            | מומלץ Windows 10 גרסה 20H2 ומעלה |
| macOS        | 10.15+ (Catalina+) | מומלץ macOS 12 (Monterey) ומעלה  |
| Ubuntu Linux | 20.04 LTS+         | נבדק על Ubuntu Desktop           |
| Fedora Linux | 34+                | תמיכה בסיסית                     |
| Debian/Mint  | 11+ / 20+          | תמיכה בסיסית                     |

### מובייל (Mobile)

| מערכת הפעלה | גרסאות נתמכות | הערות                      |
| ----------- | ------------- | -------------------------- |
| iOS         | 13+           | מומלץ iOS 15+ לכל התכונות  |
| Android     | 9+ (Pie+)     | מומלץ Android 11+          |
| iPadOS      | 13+           | מותאם במיוחד לחוויית טאבלט |

### מערכות אחרות

| מערכת הפעלה    | גרסאות נתמכות      | הערות                 |
| -------------- | ------------------ | --------------------- |
| Chrome OS      | 89+                | נתמך דרך דפדפן Chrome |
| Windows on ARM | Windows 10+ on ARM | דרך דפדפנים מתאימים   |
| Linux on ARM   | תלוי בהפצה         | תמיכה מוגבלת          |

</div>

<div dir="ltr">

## Supported Operating Systems

### Desktop

| Operating System | Supported Versions | Notes                                         |
| ---------------- | ------------------ | --------------------------------------------- |
| Windows          | 10+, 11            | Windows 10 version 20H2 and above recommended |
| macOS            | 10.15+ (Catalina+) | macOS 12 (Monterey) and above recommended     |
| Ubuntu Linux     | 20.04 LTS+         | Tested on Ubuntu Desktop                      |
| Fedora Linux     | 34+                | Basic support                                 |
| Debian/Mint      | 11+ / 20+          | Basic support                                 |

### Mobile

| Operating System | Supported Versions | Notes                                   |
| ---------------- | ------------------ | --------------------------------------- |
| iOS              | 13+                | iOS 15+ recommended for all features    |
| Android          | 9+ (Pie+)          | Android 11+ recommended                 |
| iPadOS           | 13+                | Specially adapted for tablet experience |

### Other Systems

| Operating System | Supported Versions     | Notes                        |
| ---------------- | ---------------------- | ---------------------------- |
| Chrome OS        | 89+                    | Supported via Chrome browser |
| Windows on ARM   | Windows 10+ on ARM     | Via compatible browsers      |
| Linux on ARM     | Distribution dependent | Limited support              |

</div>

---

<div dir="rtl">

## מכשירים נתמכים

### מחשבים (Computers)

- מחשבי Desktop ו-Laptop עם Windows, macOS או Linux
- מסך ברזולוציה מינימלית של 1280×720 (HD)
- מומלץ מסך 1920×1080 (Full HD) ומעלה
- מינימום 4GB RAM (מומלץ 8GB+)
- חיבור אינטרנט יציב (מינימום 5Mbps)

### מכשירים ניידים (Mobile)

- iPhone 8 ומעלה (iOS 13+)
- iPad מדור 6 ומעלה (iPadOS 13+)
- מכשירי Android עם גרסה 9 ומעלה
- מינימום 2GB RAM (מומלץ 4GB+)
- מסך ברזולוציה מינימלית של 720×1280
- רצוי מסך 5.5 אינץ' ומעלה

### מכשירים אחרים

- טאבלטים מבוססי Windows (Surface וכו')
- Chromebook (Chrome OS)
- מכשירי קריאה מסוג Kindle Fire HD (דרך דפדפן)

</div>

<div dir="ltr">

## Supported Devices

### Computers

- Desktop and Laptop computers with Windows, macOS, or Linux
- Screen with minimum resolution of 1280×720 (HD)
- Recommended screen resolution 1920×1080 (Full HD) or higher
- Minimum 4GB RAM (8GB+ recommended)
- Stable internet connection (minimum 5Mbps)

### Mobile Devices

- iPhone 8 and above (iOS 13+)
- iPad 6th generation and above (iPadOS 13+)
- Android devices with version 9 and above
- Minimum 2GB RAM (4GB+ recommended)
- Screen with minimum resolution of 720×1280
- Preferably 5.5-inch screen or larger

### Other Devices

- Windows-based tablets (Surface, etc.)
- Chromebook (Chrome OS)
- Kindle Fire HD reading devices (via browser)

</div>

---

<div dir="rtl">

## דרישות אחרות

### חיבור אינטרנט

- **מינימום מומלץ**: 5Mbps הורדה / 1Mbps העלאה
- **אופטימלי**: 10Mbps+ הורדה / 3Mbps+ העלאה
- **עבור צפייה בווידאו HD**: 10Mbps+ הורדה
- **עבור שיתוף מסך והשתתפות בכיתות וירטואליות**: 15Mbps+ הורדה / 5Mbps+ העלאה

### אחסון

- **אפליקציית ווב**: 50MB פנויים בדפדפן
- **אפליקציית מובייל**: 150MB התקנה ראשונית + עד 500MB לתוכן מוריד
- **תוכן לצפייה לא מקוונת**: בהתאם לכמות התוכן שיורד (בין 50MB לקורס קטן ועד 5GB לקורס מלא)

### הגדרות דפדפן נדרשות

- JavaScript מופעל
- Cookies מופעל (הכרחי לשמירת התחברות)
- localStorage מופעל (לחוויה אופטימלית)
- הרשאות push notifications (אופציונלי אך מומלץ)
- הרשאות מיקרופון (נדרש לחלק מתכונות הסימולטור)

</div>

<div dir="ltr">

## Other Requirements

### Internet Connection

- **Minimum Recommended**: 5Mbps download / 1Mbps upload
- **Optimal**: 10Mbps+ download / 3Mbps+ upload
- **For HD video viewing**: 10Mbps+ download
- **For screen sharing and virtual classroom participation**: 15Mbps+ download / 5Mbps+ upload

### Storage

- **Web Application**: 50MB free space in browser
- **Mobile Application**: 150MB initial installation + up to 500MB for downloaded content
- **Offline viewing content**: Depends on amount of content downloaded (from 50MB for a small course to 5GB for a full course)

### Required Browser Settings

- JavaScript enabled
- Cookies enabled (essential for login persistence)
- localStorage enabled (for optimal experience)
- Push notifications permissions (optional but recommended)
- Microphone permissions (required for some simulator features)

</div>

---

<div dir="rtl">

## בדיקת תאימות

ניתן לבדוק את תאימות המערכת שלכם בכתובת:

```
https://www.haderech.co.il/system-check
```

כלי בדיקת התאימות יאמת:

1. תאימות הדפדפן
2. רזולוציית מסך
3. מהירות אינטרנט
4. זמינות JavaScript וטכנולוגיות נדרשות אחרות
5. יכולת צפייה בווידאו HD

## הערות למפתחים

### בדיקות צולבות (Cross-Browser Testing)

בפיתוח תכונות חדשות, יש לבדוק בלפחות:

- שני דפדפנים שולחניים (Chrome + Firefox/Safari)
- דפדפן מובייל אחד (Chrome for Android/Safari for iOS)

### עיצוב רספונסיבי

- יש להשתמש ב-CSS Media Queries להתאמה לכל גודל מסך
- יש לבדוק נקודות שבירה (breakpoints) ב:
  - 1920px (מסכים גדולים)
  - 1366px (לפטופים)
  - 768px (טאבלטים)
  - 425px (מובייל - מסך גדול)
  - 375px (מובייל - מסך בינוני)
  - 320px (מובייל - מסך קטן)

### דפדפנים לגאסי

אין פיתוח פעיל עבור דפדפנים שאינם נתמכים, אך יש להקפיד על graceful degradation כאשר ניתן. המשתמש צריך לקבל הודעה ברורה אם הדפדפן שלו אינו נתמך.

</div>

<div dir="ltr">

## Compatibility Check

You can check your system compatibility at:

```
https://www.haderech.co.il/system-check
```

The compatibility check tool will verify:

1. Browser compatibility
2. Screen resolution
3. Internet speed
4. Availability of JavaScript and other required technologies
5. Ability to view HD video

## Notes for Developers

### Cross-Browser Testing

When developing new features, test on at least:

- Two desktop browsers (Chrome + Firefox/Safari)
- One mobile browser (Chrome for Android/Safari for iOS)

### Responsive Design

- Use CSS Media Queries for adaptation to all screen sizes
- Check breakpoints at:
  - 1920px (large screens)
  - 1366px (laptops)
  - 768px (tablets)
  - 425px (mobile - large screen)
  - 375px (mobile - medium screen)
  - 320px (mobile - small screen)

### Legacy Browsers

There is no active development for unsupported browsers, but ensure graceful degradation when possible. The user should receive a clear message if their browser is not supported.

</div>

---

<div dir="rtl">

## עדכוני תמיכה

מסמך זה יעודכן כאשר:

- תתווסף תמיכה בדפדפנים/מכשירים/מערכות הפעלה חדשים
- תופסק תמיכה בדפדפנים/מכשירים/מערכות הפעלה ישנים
- ישתנו דרישות המערכת המינימליות

**תאריך עדכון אחרון:** 1.3.2023

</div>

<div dir="ltr">

## Support Updates

This document will be updated when:

- Support for new browsers/devices/operating systems is added
- Support for old browsers/devices/operating systems is discontinued
- Minimum system requirements change

**Last update date:** March 1, 2023

</div>
