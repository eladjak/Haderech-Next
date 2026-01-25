import { ForumPostSkeleton } from '@/components/ui/skeleton';

export default function Loading() {
  return (
    <div className="container mx-auto py-8">
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <ForumPostSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
