import type { Course } from "@/types/api";
import { mockAuthor } from "./forum";

export const courses: Course[] = [
  {
    id: "1",
    title: "מבוא לתכנות",
    description: "קורס מבוא לתכנות בשפת JavaScript",
    image: "/images/courses/intro-to-programming.jpg",
    price: 0,
    duration: 120,
    level: "beginner",
    category: "programming",
    tags: ["javascript", "programming", "web"],
    instructor_id: mockAuthor.id,
    instructor: mockAuthor,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    published: true,
    featured: true,
    lessons_count: 10,
    students_count: 100,
    ratings_count: 50,
    average_rating: 4.5,
    lessons: [],
    ratings: [],
    comments: [],
    sections: [
      {
        id: "1",
        title: "מבוא",
        description: "מבוא לתכנות",
        order: 1,
        lessons: [],
        course_id: "1",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ],
  },
];
