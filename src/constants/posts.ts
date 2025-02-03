import type { ForumPost } from '@/types/api'
import { users } from './users'

export const posts: ForumPost[] = [
  {
    id: '1',
    title: 'איך להתחיל ללמוד תכנות?',
    content: 'אני רוצה להתחיל ללמוד תכנות אבל לא יודע מאיפה להתחיל. יש המלצות?',
    author_id: users[0].id,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    tags: ['תכנות', 'מתחילים', 'המלצות'],
    status: 'published',
    likes: 5,
    views: 120,
    author: users[0],
    comments: [
      {
        id: '1',
        post_id: '1',
        author_id: users[1].id,
        content: 'אני ממליץ להתחיל עם JavaScript, זו שפה מעולה למתחילים',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        likes: 2,
        author: users[1]
      }
    ]
  },
  {
    id: '2',
    title: 'טיפים ללימוד React',
    content: 'אשמח לקבל טיפים ללימוד React. איזה משאבים אתם ממליצים?',
    author_id: users[1].id,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    tags: ['react', 'javascript', 'frontend'],
    status: 'published',
    likes: 8,
    views: 200,
    author: users[1],
    comments: []
  },
  {
    id: '3',
    title: 'שאלה בנושא Node.js',
    content: 'איך מטפלים בשגיאות ב-Node.js בצורה הטובה ביותר?',
    author_id: users[2].id,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    tags: ['nodejs', 'backend', 'שגיאות'],
    status: 'published',
    likes: 3,
    views: 80,
    author: users[2],
    comments: []
  }
] 