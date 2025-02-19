import { Forum } from "@/components/forum/Forum";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "קהילה",
  description: "הקהילה שלנו",
};

export default function Page() {
  return <Forum />;
}
