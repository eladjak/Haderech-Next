export interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  points: number
}

export const ACHIEVEMENTS = {
  FIRST_LOGIN: {
    id: 'first_login',
    title: 'ברוכים הבאים',
    description: 'התחברת לראשונה למערכת',
    icon: '👋',
    points: 10
  },
  COMPLETE_PROFILE: {
    id: 'complete_profile',
    title: 'פרופיל מושלם',
    description: 'השלמת את כל פרטי הפרופיל שלך',
    icon: '✨',
    points: 20
  },
  FIRST_COURSE: {
    id: 'first_course',
    title: 'צעד ראשון',
    description: 'השלמת את הקורס הראשון שלך',
    icon: '🎓',
    points: 30
  },
  SOCIAL_BUTTERFLY: {
    id: 'social_butterfly',
    title: 'פרפר חברתי',
    description: 'הצטרפת ל-5 קבוצות שונות',
    icon: '🦋',
    points: 25
  },
  CHAT_MASTER: {
    id: 'chat_master',
    title: 'מאסטר הצ\'אט',
    description: 'השתתפת ב-50 שיחות',
    icon: '💬',
    points: 40
  },
  SIMULATOR_MASTER: {
    id: 'simulator_master',
    title: 'מאסטר הסימולטור',
    description: 'השלמת 50 סימולציות',
    icon: '🎮',
    points: 50
  },
  FEEDBACK_CHAMPION: {
    id: 'feedback_champion',
    title: 'אלוף המשוב',
    description: 'קיבלת ציון ממוצע של 4.5 ב-10 סימולציות',
    icon: '🏆',
    points: 60
  }
} as const 