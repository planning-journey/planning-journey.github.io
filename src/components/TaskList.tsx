import React, { useEffect, useRef } from 'react';
import { type Task } from '../db';
import TaskItem from './TaskItem';

interface TaskListProps {
  tasks: Task[];
  onViewTaskDetail: (task: Task) => void;
  onToggleTaskComplete: (taskId: string, completed: boolean) => void;
  scrollToTaskId: string | null;
  onClearScrollToTask: () => void; // New prop to clear scroll request
}

const TaskList: React.FC<TaskListProps> = ({ tasks, onViewTaskDetail, onToggleTaskComplete, scrollToTaskId, onClearScrollToTask }) => {
  const itemRefs = useRef<Map<string, HTMLDivElement | null>>(new Map());

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
      <div
        data-drop-container="true"
        className="flex flex-col items-center justify-center py-12 px-4 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl m-4"
      >
        <p className="text-center text-gray-500 dark:text-slate-400">오늘 할 일을 추가해보세요!</p>
        <p className="text-sm text-slate-400 dark:text-slate-600 mt-2">이곳에 할 일을 드래그하여 옮길 수 있습니다.</p>
      </div>
    );
  }

  const sortedTasks = [...tasks].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  return (
    <div className="divide-y divide-slate-200 dark:divide-slate-700">
      {sortedTasks.map((task) => (
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
