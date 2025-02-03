import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface ContentItem {
  id: string;
  title: string;
  type: "article" | "video" | "podcast";
  description: string;
  duration: string;
  thumbnail: string;
}

const EXAMPLE_CONTENT: ContentItem[] = [
  {
    id: "1",
    title: "איך לבנות תקשורת פתוחה בזוגיות",
    type: "article",
    description: "מדריך מעשי לבניית תקשורת פתוחה וכנה עם בן/בת הזוג",
    duration: "10 דקות קריאה",
    thumbnail: "/images/content/communication.jpg",
  },
  {
    id: "2",
    title: "הרצאה: סודות האינטימיות הזוגית",
    type: "video",
    description: "הרצאה מרתקת על בניית אינטימיות עמוקה בזוגיות",
    duration: "45 דקות צפייה",
    thumbnail: "/images/content/intimacy.jpg",
  },
  {
    id: "3",
    title: "פודקאסט: שיחות על זוגיות",
    type: "podcast",
    description: "שיחה מעמיקה על האתגרים והפתרונות בזוגיות המודרנית",
    duration: "30 דקות האזנה",
    thumbnail: "/images/content/podcast.jpg",
  },
];

const typeIcons = {
  article: (
    <svg
      className="h-4 w-4"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9.5a2.5 2.5 0 00-2.5-2.5H15"
      />
    </svg>
  ),
  video: (
    <svg
      className="h-4 w-4"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  ),
  podcast: (
    <svg
      className="h-4 w-4"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
      />
    </svg>
  ),
};

export function RecommendedContent() {
  return (
    <section className="py-12">
      <div className="container">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold">תוכן מומלץ</h2>
          <Link href="/content">
            <Button variant="outline">לכל התכנים</Button>
          </Link>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {EXAMPLE_CONTENT.map((item) => (
            <Card key={item.id} className="overflow-hidden">
              <div
                className="h-48 bg-cover bg-center"
                style={{ backgroundImage: `url(${item.thumbnail})` }}
              />
              <CardHeader>
                <div className="flex items-center gap-2">
                  {typeIcons[item.type]}
                  <CardTitle className="text-xl">{item.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">{item.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    {item.duration}
                  </span>
                  <Link href={`/content/${item.id}`}>
                    <Button variant="link">קרא עוד</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
