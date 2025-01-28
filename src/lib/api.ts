import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

const supabase = createClientComponentClient()

export interface Course {
  id: string
  title: string
  description: string
  duration: number
  level: 'beginner' | 'intermediate' | 'advanced'
  price: number
  averageRating: number
  thumbnail?: string
}

export interface ForumPost {
  id: string
  title: string
  author: {
    name: string
    avatar_url?: string
  }
  created_at: string
  replies_count: number
}

interface RawForumPost {
  id: string
  title: string
  created_at: string
  author: {
    name: string
    avatar_url: string | null
  }[]
  replies_count: { count: number }[]
}

export async function getRecommendedCourses(): Promise<Course[]> {
  const { data, error } = await supabase
    .from('courses')
    .select('*')
    .order('averageRating', { ascending: false })
    .limit(3)

  if (error) {
    throw new Error('Failed to fetch recommended courses')
  }

  return data || []
}

export async function getLatestForumPosts(): Promise<ForumPost[]> {
  const { data: posts, error } = await supabase
    .from('forum_posts')
    .select(`
      id,
      title,
      created_at,
      author:profiles(name, avatar_url),
      replies_count:forum_replies(count)
    `)
    .order('created_at', { ascending: false })
    .limit(5)

  if (error) {
    console.error('Error fetching latest forum posts:', error)
    return []
  }

  return (posts as RawForumPost[]).map((post) => ({
    id: post.id,
    title: post.title,
    created_at: post.created_at,
    author: {
      name: post.author[0]?.name || 'משתמש לא ידוע',
      avatar_url: post.author[0]?.avatar_url || undefined,
    },
    replies_count: post.replies_count[0]?.count || 0,
  }))
} 