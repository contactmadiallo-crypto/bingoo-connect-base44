import { useQueryClient, useMutation } from '@tanstack/react-query';

/**
 * Hook for optimistic UI updates with React Query
 * Automatically rolls back on error
 * 
 * Usage:
 * const mutation = useOptimisticUpdate({
 *   queryKey: ['tasks'],
 *   mutationFn: (data) => api.updateTask(data),
 *   optimisticData: (oldData) => [...oldData, newItem],
 * });
 */
export default function useOptimisticUpdate({
  queryKey,
  mutationFn,
  optimisticData,
  onSuccess,
  onError,
}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn,
    onMutate: async (variables) => {
      // Cancel outgoing queries
      await queryClient.cancelQueries({ queryKey });
      
      // Snapshot previous data
      const previousData = queryClient.getQueryData(queryKey);
      
      // Update cache optimistically
      if (optimisticData) {
        queryClient.setQueryData(queryKey, (old) => optimisticData(old, variables));
      }
      
      return { previousData };
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousData) {
        queryClient.setQueryData(queryKey, context.previousData);
      }
      onError?.(err);
    },
    onSuccess: (data, variables, context) => {
      // Invalidate & refetch for fresh data
      queryClient.invalidateQueries({ queryKey });
      onSuccess?.(data);
    },
  });
}