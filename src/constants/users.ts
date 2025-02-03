import type { User } from '@/types/api'

export const users: User[] = [
  {
    id: '1',
    name: 'יוסי כהן',
    email: 'yossi@example.com',
    avatar_url: '/avatars/yossi.jpg',
    bio: 'מורה ומנחה בעל ניסיון של 15 שנה בתחום הזוגיות',
    created_at: '2024-01-01T00:00:00.000Z',
    updated_at: '2024-01-01T00:00:00.000Z',
    role: 'admin',
    settings: {
      notifications: true,
      language: 'he',
      theme: 'light'
    }
  },
  {
    id: '2',
    name: 'רחל לוי',
    email: 'rachel@example.com',
    avatar_url: '/avatars/rachel.jpg',
    bio: 'פסיכולוגית קלינית המתמחה בטיפול זוגי',
    created_at: '2024-01-01T00:00:00.000Z',
    updated_at: '2024-01-01T00:00:00.000Z',
    role: 'admin',
    settings: {
      notifications: true,
      language: 'he',
      theme: 'dark'
    }
  },
  {
    id: '3',
    name: 'דוד ישראלי',
    email: 'david@example.com',
    avatar_url: '/avatars/david.jpg',
    bio: 'מטפל זוגי ומנחה סדנאות תקשורת',
    created_at: '2024-01-01T00:00:00.000Z',
    updated_at: '2024-01-01T00:00:00.000Z',
    role: 'admin',
    settings: {
      notifications: true,
      language: 'he',
      theme: 'system'
    }
  }
] 