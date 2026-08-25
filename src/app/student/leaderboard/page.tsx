import { redirect } from "next/navigation";

/**
 * Keep the historical route working without maintaining a second, divergent
 * leaderboard experience. The canonical destination is a private personal
 * progress view; it does not rank learners against one another.
 */
export default function StudentLeaderboardPage() {
  redirect("/community/leaderboard");
}
