import React from 'react';
import Checkbox from './Checkbox';
import { db, type Task } from '../db';
import { useLiveQuery } from 'dexie-react-hooks';

interface TaskItemProps {
  task: Task;
  onView: (task: Task) => void;
  onToggleComplete: (taskId: string, completed: boolean) => void;
}

const TaskItem = React.forwardRef<HTMLDivElement, TaskItemProps>(({ task, onView, onToggleComplete }, ref) => {
  const goal = useLiveQuery(() => (task.goalId ? db.goals.get(task.goalId) : undefined), [task.goalId]);

  const handleToggleComplete = (completed: boolean) => {
    onToggleComplete(task.id!, completed);
  };

  return (
    <div
      ref={ref}
      className="flex flex-col items-stretch rounded-none py-2 pr-1 cursor-pointer relative group"
      onClick={() => onView(task)} // Open detail modal on main div click
    >
      <div className="flex items-stretch flex-grow">
        <Checkbox
          checked={task.completed}
          onChange={handleToggleComplete}
        />
        <div>
          {goal && (
            <div className={`flex items-center gap-1 text-sm ${goal.status === 'completed' ? 'text-slate-400 dark:text-slate-600 line-through' : 'text-gray-500 dark:text-slate-400'}`}>
              <span
                className={`block h-2 w-2 rounded-full ${goal.status === 'completed' ? 'opacity-50' : ''}`}
                style={{ backgroundColor: goal.color }}
              ></span>
              <span>{goal.name}</span>
            </div>
          )}
          <span className={`font-medium text-gray-900 dark:text-white ${task.completed ? 'line-through text-gray-400 dark:text-slate-500' : ''}`}>
            {task.title}
          </span>
        </div>
      </div>

      {task.description && (
        <p className="text-sm text-gray-600 dark:text-slate-400 mt-0.5 whitespace-pre-wrap pl-11 line-clamp-3">
          {task.description}
        </p>
      )}
    </div>
  );
})

export default TaskItem;
