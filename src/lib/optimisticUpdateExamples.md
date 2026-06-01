# Optimistic Update Patterns

## Basic Example: Adding a Task

```jsx
import useOptimisticUpdate from '@/hooks/useOptimisticUpdate';
import { base44 } from '@/api/base44Client';

export function TaskList() {
  const { data: tasks = [] } = useQuery({
    queryKey: ['tasks'],
    queryFn: () => base44.entities.Task.list(),
  });

  const addTask = useOptimisticUpdate({
    queryKey: ['tasks'],
    mutationFn: (newTask) => base44.entities.Task.create(newTask),
    optimisticData: (oldTasks, newTask) => [
      ...oldTasks,
      { ...newTask, id: Date.now() } // temp ID
    ],
  });

  return (
    <div>
      <button onClick={() => addTask.mutate({ title: 'New Task' })}>
        {addTask.isPending ? 'Adding...' : 'Add Task'}
      </button>
      {tasks.map(t => <div key={t.id}>{t.title}</div>)}
    </div>
  );
}
```

## Updating Status with Rollback

```jsx
const updateStatus = useOptimisticUpdate({
  queryKey: ['orders', orderId],
  mutationFn: (status) => base44.entities.Order.update(orderId, { status }),
  optimisticData: (oldOrder) => ({ ...oldOrder, status: 'completed' }),
  onError: () => toast.error('Failed to update. Changes reverted.'),
});
```

## Deleting with Confirmation

```jsx
const deleteTask = useOptimisticUpdate({
  queryKey: ['tasks'],
  mutationFn: (taskId) => base44.entities.Task.delete(taskId),
  optimisticData: (oldTasks, taskId) => 
    oldTasks.filter(t => t.id !== taskId),
  onError: () => toast.error('Delete failed. Task restored.'),
});
```

## Key Benefits

- **Instant feedback**: UI updates immediately, no waiting for server
- **Automatic rollback**: On error, previous state is restored
- **No double-fetch**: onSuccess invalidates only when needed
- **Error handling**: Show toast/alert if mutation fails