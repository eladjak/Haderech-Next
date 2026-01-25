import { createClient } from "@supabase/supabase-js";
import { logger } from "@/lib/utils/logger";

interface Feedback {
  id: string;
  user_id: string;
  course_id: string;
  lesson_id: string;
  rating: number;
  comment: string;
  created_at: string;
  updated_at: string;
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export const createFeedback = async (
  userId: string,
  courseId: string,
  lessonId: string,
  rating: number,
  comment: string
): Promise<Feedback> => {
  try {
    // Validate rating is between 1-5
    if (rating < 1 || rating > 5) {
      throw new Error("דירוג חייב להיות בין 1 ל-5");
    }

    const { data: feedback, error } = await supabase
      .from("feedback")
      .insert({
        user_id: userId,
        course_id: courseId,
        lesson_id: lessonId,
        rating,
        comment,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;

    // Update course average rating
    await updateCourseRating(courseId);

    return feedback;
  } catch (error) {
    logger.error("Error creating feedback:", error);
    throw new Error("שגיאה ביצירת משוב");
  }
};

export const getFeedbackForLesson = async (
  lessonId: string
): Promise<Feedback[]> => {
  try {
    const { data: feedbacks, error } = await supabase
      .from("feedback")
      .select(
        `
        *,
        user:user_id (
          id,
          name,
          avatar_url
        )
      `
      )
      .eq("lesson_id", lessonId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return feedbacks;
  } catch (error) {
    logger.error("Error fetching lesson feedback:", error);
    throw new Error("שגיאה בטעינת משובים לשיעור");
  }
};

export const getFeedbackForCourse = async (
  courseId: string
): Promise<Feedback[]> => {
  try {
    const { data: feedbacks, error } = await supabase
      .from("feedback")
      .select(
        `
        *,
        user:user_id (
          id,
          name,
          avatar_url
        )
      `
      )
      .eq("course_id", courseId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return feedbacks;
  } catch (error) {
    logger.error("Error fetching course feedback:", error);
    throw new Error("שגיאה בטעינת משובים לקורס");
  }
};

const updateCourseRating = async (courseId: string): Promise<void> => {
  try {
    // Get all feedback for the course
    const { data: feedbacks } = await supabase
      .from("feedback")
      .select("rating")
      .eq("course_id", courseId);

    if (!feedbacks?.length) return;

    // Calculate average rating
    const averageRating =
      feedbacks.reduce((acc, curr) => acc + curr.rating, 0) / feedbacks.length;

    // Update course with new average rating
    const { error } = await supabase
      .from("courses")
      .update({
        average_rating: averageRating,
        updated_at: new Date().toISOString(),
      })
      .eq("id", courseId);

    if (error) throw error;
  } catch (error) {
    logger.error("Error updating course rating:", error);
    throw new Error("שגיאה בעדכון דירוג הקורס");
  }
};
