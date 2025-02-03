import { createServerClient } from '@/lib/supabase-server'
import { cookies } from 'next/headers'

interface AnalyticsEvent {
  id: string
  type: string
  user_id: string
  course_id?: string
  lesson_id?: string
  data: Record<string, string | number | boolean | null>
  created_at: string
}

interface EffectivenessMetric {
  type: string
  total: number
  success: number
  rate: number
  trend: 'up' | 'down' | 'stable'
}

interface UserEngagement {
  user_id: string
  total_time: number
  sessions: number
  completed_lessons: number
  active_days: number
}

interface CourseMetrics {
  course_id: string
  enrollments: number
  completion_rate: number
  average_rating: number
  total_time: number
}

export async function trackEvent(
  type: string,
  user_id: string,
  data: Record<string, string | number | boolean | null>,
  course_id?: string,
  lesson_id?: string
) {
  try {
    const cookieStore = cookies()
    const supabase = createServerClient(cookieStore)

    const event = {
      type,
      user_id,
      course_id,
      lesson_id,
      data,
      created_at: new Date().toISOString()
    }

    const { error } = await supabase
      .from('analytics_events')
      .insert(event)

    if (error) {
      console.error('Error tracking event:', error)
    }
  } catch (error) {
    console.error('Error in trackEvent:', error)
  }
}

export async function getUserEngagement(user_id: string): Promise<UserEngagement | null> {
  try {
    const cookieStore = cookies()
    const supabase = createServerClient(cookieStore)

    const { data: events, error } = await supabase
      .from('analytics_events')
      .select('*')
      .eq('user_id', user_id)
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Error fetching user events:', error)
      return null
    }

    const engagement: UserEngagement = {
      user_id,
      total_time: 0,
      sessions: 0,
      completed_lessons: 0,
      active_days: 0
    }

    const activeDays = new Set<string>()

    events.forEach((event: AnalyticsEvent) => {
      const date = event.created_at.split('T')[0]
      activeDays.add(date)

      if (event.type === 'session_start') {
        engagement.sessions++
      }

      if (event.type === 'lesson_complete') {
        engagement.completed_lessons++
      }

      if (event.type === 'time_spent' && typeof event.data.duration === 'number') {
        engagement.total_time += event.data.duration
      }
    })

    engagement.active_days = activeDays.size

    return engagement
  } catch (error) {
    console.error('Error in getUserEngagement:', error)
    return null
  }
}

export async function getCourseMetrics(course_id: string): Promise<CourseMetrics | null> {
  try {
    const cookieStore = cookies()
    const supabase = createServerClient(cookieStore)

    const { data: events, error } = await supabase
      .from('analytics_events')
      .select('*')
      .eq('course_id', course_id)

    if (error) {
      console.error('Error fetching course events:', error)
      return null
    }

    const metrics: CourseMetrics = {
      course_id,
      enrollments: 0,
      completion_rate: 0,
      average_rating: 0,
      total_time: 0
    }

    let totalRatings = 0
    let ratingSum = 0
    let completions = 0

    events.forEach((event: AnalyticsEvent) => {
      if (event.type === 'course_enroll') {
        metrics.enrollments++
      }

      if (event.type === 'course_complete') {
        completions++
      }

      if (event.type === 'course_rate' && typeof event.data.rating === 'number') {
        totalRatings++
        ratingSum += event.data.rating
      }

      if (event.type === 'time_spent' && typeof event.data.duration === 'number') {
        metrics.total_time += event.data.duration
      }
    })

    metrics.completion_rate = metrics.enrollments > 0 ? (completions / metrics.enrollments) * 100 : 0
    metrics.average_rating = totalRatings > 0 ? ratingSum / totalRatings : 0

    return metrics
  } catch (error) {
    console.error('Error in getCourseMetrics:', error)
    return null
  }
}

export async function getEffectivenessMetrics(): Promise<EffectivenessMetric[]> {
  try {
    const cookieStore = cookies()
    const supabase = createServerClient(cookieStore)

    const { data: events, error } = await supabase
      .from('analytics_events')
      .select('*')
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Error fetching events:', error)
      return []
    }

    const effectiveness: Record<string, { total: number; success: number; history: boolean[] }> = {}

    events.forEach((event: AnalyticsEvent) => {
      if (!effectiveness[event.type]) {
        effectiveness[event.type] = { total: 0, success: 0, history: [] }
      }

      effectiveness[event.type].total++

      if (event.data.success === true) {
        effectiveness[event.type].success++
      }

      effectiveness[event.type].history.push(event.data.success === true)
    })

    return Object.entries(effectiveness).map(([type, data]) => {
      const rate = data.total > 0 ? (data.success / data.total) * 100 : 0
      const recentHistory = data.history.slice(-10)
      const recentRate = recentHistory.length > 0
        ? (recentHistory.filter(Boolean).length / recentHistory.length) * 100
        : 0

      return {
        type,
        total: data.total,
        success: data.success,
        rate,
        trend: recentRate > rate ? 'up' : recentRate < rate ? 'down' : 'stable'
      }
    })
  } catch (error) {
    console.error('Error in getEffectivenessMetrics:', error)
    return []
  }
} 