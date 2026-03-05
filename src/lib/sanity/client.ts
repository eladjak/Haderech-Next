import { createClient } from "next-sanity";

export const sanityClient = createClient({
  projectId: "b0hm1i34",
  dataset: "omanut-hakesher",
  apiVersion: "2026-02-25",
  useCdn: true,
});
