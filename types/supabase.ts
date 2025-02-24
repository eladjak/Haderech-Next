import type { Course, User } from "./api";
import type { Database as DatabaseTypes } from "./database";

export type Tables<T extends keyof DatabaseTypes["public"]["Tables"]> =
  DatabaseTypes["public"]["Tables"][T]["Row"];

export type ExtendedForumPost = Tables<"forum_posts"> & {
  author: {
    id: string;
    username: string;
    full_name: string;
    avatar_url: string | null;
    image: string | null;
    role: string;
  };
  comments: (Tables<"forum_comments"> & {
    author: {
      id: string;
      username: string;
      full_name: string;
      avatar_url: string | null;
      image: string | null;
      role: string;
    };
    replies: Tables<"forum_comments">[];
  })[];
};

export type { DatabaseTypes as Database };
