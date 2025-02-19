export interface Activity {
  id: string;
  title: string;
  description: string;
  type: "meeting" | "workshop" | "social" | "other";
  date: string;
  location?: string;
  max_participants?: number;
  participants: string[];
  created_at: string;
}
