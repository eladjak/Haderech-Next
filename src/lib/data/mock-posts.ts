// Mock data for posts in the community and forum sections

export interface Post {
  id: string;
  title: string;
  content: string;
  author: {
    id: string;
    name: string;
    avatar: string;
  };
  createdAt: string;
  likes: number;
  comments: number;
  tags: string[];
}

export const mockPosts: Post[] = [
  {
    id: "1",
    title: "איך להתחיל ללמוד תכנות?",
    content: "אני רוצה להתחיל ללמוד תכנות אבל לא יודע מאיפה להתחיל. יש המלצות?",
    author: {
      id: "user1",
      name: "ישראל ישראלי",
      avatar: "/avatars/user1.jpg",
    },
    createdAt: "2024-03-15T10:00:00Z",
    likes: 15,
    comments: 8,
    tags: ["מתחילים", "תכנות", "קריירה"],
  },
  {
    id: "2",
    title: "טיפים ללימוד JavaScript",
    content: "אשמח לשמוע טיפים מניסיונכם בלימוד JavaScript. מה עזר לכם?",
    author: {
      id: "user2",
      name: "רחל כהן",
      avatar: "/avatars/user2.jpg",
    },
    createdAt: "2024-03-14T15:30:00Z",
    likes: 23,
    comments: 12,
    tags: ["JavaScript", "פיתוח-ווב", "טיפים"],
  },
  {
    id: "3",
    title: "פרויקט מעשי ראשון - רעיונות?",
    content:
      "סיימתי קורס בסיסי בפיתוח ווב ומחפש רעיונות לפרויקט ראשון. אשמח להצעות!",
    author: {
      id: "user3",
      name: "דוד לוי",
      avatar: "/avatars/user3.jpg",
    },
    createdAt: "2024-03-13T09:15:00Z",
    likes: 18,
    comments: 15,
    tags: ["פרויקטים", "מתחילים", "פיתוח-ווב"],
  },
];
