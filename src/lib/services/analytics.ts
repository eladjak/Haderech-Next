import { createClient } from '@supabase/supabase-js'

interface AnalyticsEvent {
  id: string;
  user_id: string;
  action: AnalyticsAction;
  type: RecommendationType;
  item_id: string;
  effective?: boolean;
  created_at: string;
}

type AnalyticsAction = 
  | 'view'
  | 'click'
  | 'complete'
  | 'like'
  | 'share'
  | 'save'
  | 'dismiss';

type RecommendationType = 
  | 'course'
  | 'book'
  | 'podcast'
  | 'article'
  | 'forum_post'
  | 'simulation';

interface EffectivenessMetric {
  type: RecommendationType;
  interactions: {
    action: AnalyticsAction;
    count: number;
  }[];
  effectiveness?: number;
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export const trackRecommendationInteraction = async (
  userId: string,
  type: RecommendationType,
  itemId: string,
  action: AnalyticsAction
): Promise<void> => {
  try {
    const { error } = await supabase
      .from('analytics')
      .insert({
        user_id: userId,
        action,
        type,
        item_id: itemId,
        created_at: new Date().toISOString()
      });

    if (error) throw error;
  } catch (error) {
    console.error('Error tracking recommendation interaction:', error);
    throw new Error('שגיאה בתיעוד האינטראקציה');
  }
};

export const getRecommendationEffectiveness = async (): Promise<EffectivenessMetric[]> => {
  try {
    const { data: events, error } = await supabase
      .from('analytics')
      .select('*');

    if (error) throw error;

    // Group events by type and action
    const effectiveness = events.reduce((acc: { [key: string]: { [key: string]: number } }, event) => {
      if (!acc[event.type]) {
        acc[event.type] = {};
      }
      if (!acc[event.type][event.action]) {
        acc[event.type][event.action] = 0;
      }
      acc[event.type][event.action]++;
      return acc;
    }, {});

    // Convert to array format
    return Object.entries(effectiveness).map(([type, actions]) => ({
      type: type as RecommendationType,
      interactions: Object.entries(actions).map(([action, count]) => ({
        action: action as AnalyticsAction,
        count
      }))
    }));
  } catch (error) {
    console.error('Error getting recommendation effectiveness:', error);
    throw new Error('שגיאה בטעינת נתוני אפקטיביות');
  }
};

export const trackRecommendationEffectiveness = async (
  userId: string,
  type: RecommendationType,
  itemId: string,
  action: AnalyticsAction,
  effective: boolean
): Promise<void> => {
  try {
    const { error } = await supabase
      .from('analytics')
      .insert({
        user_id: userId,
        action,
        type,
        item_id: itemId,
        effective,
        created_at: new Date().toISOString()
      });

    if (error) throw error;
  } catch (error) {
    console.error('Error tracking recommendation effectiveness:', error);
    throw new Error('שגיאה בתיעוד אפקטיביות ההמלצה');
  }
};

export const getDetailedRecommendationEffectiveness = async (): Promise<EffectivenessMetric[]> => {
  try {
    const { data: events, error } = await supabase
      .from('analytics')
      .select('*')
      .not('effective', 'is', null);

    if (error) throw error;

    // Group events by type
    const effectiveness = events.reduce((acc: { [key: string]: any }, event) => {
      if (!acc[event.type]) {
        acc[event.type] = {
          totalInteractions: 0,
          effectiveInteractions: 0,
          actionCounts: {}
        };
      }

      acc[event.type].totalInteractions++;
      if (event.effective) {
        acc[event.type].effectiveInteractions++;
      }

      if (!acc[event.type].actionCounts[event.action]) {
        acc[event.type].actionCounts[event.action] = 0;
      }
      acc[event.type].actionCounts[event.action]++;

      return acc;
    }, {});

    // Convert to array format with effectiveness percentage
    return Object.entries(effectiveness).map(([type, data]: [string, any]) => ({
      type: type as RecommendationType,
      interactions: Object.entries(data.actionCounts).map(([action, count]) => ({
        action: action as AnalyticsAction,
        count: count as number
      })),
      effectiveness: (data.effectiveInteractions / data.totalInteractions) * 100
    }));
  } catch (error) {
    console.error('Error getting detailed recommendation effectiveness:', error);
    throw new Error('שגיאה בטעינת נתוני אפקטיביות מפורטים');
  }
}; 