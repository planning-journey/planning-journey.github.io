import React, { useEffect, useRef } from 'react';
import { type Task } from '../db';
import TaskItem from './TaskItem';

interface TaskListProps {
  tasks: Task[];
  onViewTaskDetail: (task: Task) => void;
  onToggleTaskComplete: (taskId: number, completed: boolean) => void;
  scrollToTaskId: number | null;
  onClearScrollToTask: () => void; // New prop to clear scroll request
}

const TaskList: React.FC<TaskListProps> = ({ tasks, onViewTaskDetail, onToggleTaskComplete, scrollToTaskId, onClearScrollToTask }) => {
  const itemRefs = useRef<Map<number, HTMLDivElement | null>>(new Map());

  useEffect(() => {
    if (scrollToTaskId !== null) {
      const node = itemRefs.current.get(scrollToTaskId);
      if (node) {
        node.scrollIntoView({ behavior: 'smooth', block: 'center' });
        onClearScrollToTask(); // Clear the scroll request after scrolling
      }
    }
  }, [scrollToTaskId, onClearScrollToTask]);

  if (tasks.length === 0) {
    return (
      <p className="text-center text-gray-500 dark:text-slate-400 mt-8">오늘 할 일을 추가해보세요!</p>
    );
  }

  return (
    <div className="divide-y divide-slate-200 dark:divide-slate-700">
      {tasks.map((task) => (
        <TaskItem
          key={task.id}
          task={task}
          onView={onViewTaskDetail}
          onToggleComplete={onToggleTaskComplete}
          ref={(node) => {
            if (task.id) {
              itemRefs.current.set(task.id, node);
            }
          }}
        />
      ))}
    </div>
  );
};

export default TaskList;
