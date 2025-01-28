import { ForumPost, ForumCategory } from "@/types/forum"

export const EXAMPLE_POSTS: ForumPost[] = [
  {
    id: "1",
    title: "איך להתמודד עם חוסר הסכמה בנושאים חשובים?",
    content:
      "אני ובן הזוג שלי מתקשים להגיע להסכמות בנושאים חשובים. איך אפשר לנהל שיחה פורה ולהגיע לפתרונות?",
    author: {
      id: "1",
      name: "שירה כהן",
      avatar: "/avatars/1.jpg",
    },
    createdAt: "2024-01-20T10:00:00.000Z",
    commentsCount: 12,
    tags: ["תקשורת", "קונפליקטים", "זוגיות"],
    likes: 24,
    views: 156,
  },
  {
    id: "2",
    title: "טיפים לשיפור התקשורת היומיומית",
    content:
      "אשמח לשמוע טיפים מניסיונכם לשיפור התקשורת היומיומית בזוגיות. מה עובד בשבילכם?",
    author: {
      id: "2",
      name: "יוסי לוי",
      avatar: "/avatars/2.jpg",
    },
    createdAt: "2024-01-19T15:30:00.000Z",
    commentsCount: 8,
    tags: ["תקשורת", "טיפים", "זוגיות"],
    likes: 18,
    views: 98,
  },
  {
    id: "3",
    title: "איך לשמור על הרומנטיקה לאורך זמן?",
    content:
      "אחרי כמה שנים ביחד, הרומנטיקה נשחקת. איך אתם מצליחים לשמור על הניצוץ?",
    author: {
      id: "3",
      name: "מיכל ברק",
      avatar: "/avatars/3.jpg",
    },
    createdAt: "2024-01-18T09:15:00.000Z",
    commentsCount: 15,
    tags: ["רומנטיקה", "זוגיות", "טיפים"],
    likes: 32,
    views: 203,
  },
]

export const EXAMPLE_CATEGORIES: ForumCategory[] = [
  {
    id: "1",
    name: "תקשורת בזוגיות",
    description: "דיונים על תקשורת אפקטיבית ופתרון קונפליקטים",
    postsCount: 156,
    lastPost: EXAMPLE_POSTS[0],
  },
  {
    id: "2",
    name: "אינטימיות ורומנטיקה",
    description: "שיתוף וייעוץ בנושאי אינטימיות ורומנטיקה במערכת היחסים",
    postsCount: 98,
    lastPost: EXAMPLE_POSTS[2],
  },
  {
    id: "3",
    name: "התמודדות עם משברים",
    description: "תמיכה והכוונה בהתמודדות עם אתגרים ומשברים בזוגיות",
    postsCount: 124,
    lastPost: EXAMPLE_POSTS[1],
  },
] 