import { createClient } from '@supabase/supabase-js'

interface Level {
  name: string;
  minPoints: number;
  icon?: string;
}

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  condition: (user: UserProfile) => boolean;
}

interface UserProfile {
  id: string;
  points: number;
  level: string;
  badges: string[];
  completed_courses: string[];
  forum_posts: number;
  login_streak: number;
  created_at: string;
  updated_at: string;
}

export const ACTIONS = {
  VIEW_RECOMMENDATIONS: 5,
  COMPLETE_COURSE: 50,
  COMPLETE_LESSON: 10,
  POST_FORUM: 15,
  REPLY_FORUM: 5,
  COMPLETE_QUIZ: 20,
  GIVE_FEEDBACK: 5
} as const;

export type ActionType = keyof typeof ACTIONS;

export const LEVELS: Level[] = [
  { name: 'מתחיל', minPoints: 0, icon: '🌱' },
  { name: 'מתקדם', minPoints: 100, icon: '🌿' },
  { name: 'מומחה', minPoints: 500, icon: '🌳' },
  { name: 'מאסטר', minPoints: 1000, icon: '🌟' }
];

export const BADGES: Badge[] = [
  { 
    id: 'first_course',
    name: 'סיים קורס ראשון',
    description: 'השלמת את הקורס הראשון שלך',
    icon: '🎓',
    condition: (user) => user.completed_courses.length >= 1
  },
  {
    id: 'forum_contributor',
    name: 'משתתף פעיל בפורום',
    description: 'פרסמת 10 פוסטים או תגובות בפורום',
    icon: '💬',
    condition: (user) => user.forum_posts >= 10
  },
  {
    id: 'serial_completer',
    name: 'מסיים סדרתי',
    description: 'השלמת 5 קורסים',
    icon: '🏆',
    condition: (user) => user.completed_courses.length >= 5
  },
  {
    id: 'persistent',
    name: 'מתמיד',
    description: 'התחברת 7 ימים ברציפות',
    icon: '⭐',
    condition: (user) => user.login_streak >= 7
  }
];

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export const awardPoints = async (userId: string, action: ActionType): Promise<UserProfile> => {
  try {
    // Get current user profile
    const { data: user } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (!user) throw new Error('משתמש לא נמצא');

    // Calculate new points
    const newPoints = (user.points || 0) + ACTIONS[action];

    // Calculate new level
    const newLevel = LEVELS.reduce((acc, level) => {
      if (newPoints >= level.minPoints) return level.name;
      return acc;
    }, LEVELS[0].name);

    // Check for new badges
    const currentBadges = new Set(user.badges || []);
    BADGES.forEach(badge => {
      if (!currentBadges.has(badge.id) && badge.condition(user)) {
        currentBadges.add(badge.id);
      }
    });

    // Update user profile
    const { data: updatedUser, error } = await supabase
      .from('profiles')
      .update({
        points: newPoints,
        level: newLevel,
        badges: Array.from(currentBadges),
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return updatedUser;
  } catch (error) {
    console.error('Error awarding points:', error);
    throw new Error('שגיאה בהענקת נקודות');
  }
};

export const getUserLevel = async (userId: string): Promise<{ level: Level; progress: number }> => {
  try {
    // Get user points
    const { data: user } = await supabase
      .from('profiles')
      .select('points')
      .eq('id', userId)
      .single();

    if (!user) throw new Error('משתמש לא נמצא');

    const points = user.points || 0;
    
    // Find current level and next level
    let currentLevel = LEVELS[0];
    let nextLevel = LEVELS[1];

    for (let i = 0; i < LEVELS.length; i++) {
      if (points >= LEVELS[i].minPoints) {
        currentLevel = LEVELS[i];
        nextLevel = LEVELS[i + 1];
      }
    }

    // Calculate progress to next level
    const progress = nextLevel
      ? ((points - currentLevel.minPoints) / (nextLevel.minPoints - currentLevel.minPoints)) * 100
      : 100;

    return {
      level: currentLevel,
      progress: Math.min(Math.max(progress, 0), 100)
    };
  } catch (error) {
    console.error('Error getting user level:', error);
    throw new Error('שגיאה בטעינת רמת המשתמש');
  }
}; 