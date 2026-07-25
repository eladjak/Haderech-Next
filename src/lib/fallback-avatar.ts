/**
 * Illustrated placeholder avatars for people who have not uploaded a photo.
 *
 * These are abstract, non-identifiable silhouette illustrations — deliberately
 * not portraits. They must never be presented as a photograph of the person.
 * The key only decides which of the six is shown, so the same person keeps the
 * same avatar between renders.
 */
const AVATARS = [
  "/images/illustrations/avatar-01.webp",
  "/images/illustrations/avatar-02.webp",
  "/images/illustrations/avatar-03.webp",
  "/images/illustrations/avatar-04.webp",
  "/images/illustrations/avatar-05.webp",
  "/images/illustrations/avatar-06.webp",
] as const;

export function fallbackAvatar(key: string): string {
  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    hash = (hash * 31 + key.charCodeAt(i)) >>> 0;
  }
  return AVATARS[hash % AVATARS.length];
}
