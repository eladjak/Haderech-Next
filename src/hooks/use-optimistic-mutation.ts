import { useState, useTransition } from 'react';
import { logger } from "@/lib/utils/logger";

export function useOptimisticMutation<T>(
  mutationFn: (data: T) => Promise<any>,
  onSuccess?: () => void
) {
  const [isPending, startTransition] = useTransition();
  const [optimisticData, setOptimisticData] = useState<T | null>(null);

  const mutate = async (data: T) => {
    setOptimisticData(data);

    startTransition(async () => {
      try {
        await mutationFn(data);
        onSuccess?.();
      } catch (error) {
        logger.error("Mutation failed:", error);
        // Revert optimistic update
        setOptimisticData(null);
      }
    });
  };

  return { mutate, isPending, optimisticData };
}

// Usage example:
// const { mutate, isPending } = useOptimisticMutation(
//   async (post) => fetch('/api/forum', { method: 'POST', body: JSON.stringify(post) })
// );
