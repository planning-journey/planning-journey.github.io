import React from 'react';
import Checkbox from './Checkbox';
import { db, type Task } from '../db';
import { useLiveQuery } from 'dexie-react-hooks';

interface TaskItemProps {
  task: Task;
  onView: (task: Task) => void;
  onToggleComplete: (taskId: number, completed: boolean) => void;
}

const TaskItem: React.FC<TaskItemProps> = ({ task, onView, onToggleComplete }) => {
  const goal = useLiveQuery(() => (task.goalId ? db.goals.get(task.goalId) : undefined), [task.goalId]);

  const handleToggleComplete = (completed: boolean) => {
    onToggleComplete(task.id!, completed);
  };

  return (
    <div
      className="flex flex-col items-stretch rounded-none py-2 pr-1 pl-3 cursor-pointer relative group"
      onClick={() => onView(task)} // Open detail modal on main div click
    >
      <div className="flex items-center gap-3 flex-grow">
        <Checkbox
          checked={task.completed}
          onChange={handleToggleComplete}
          className="h-5 w-5 mt-1"
        />
        <div>
          {goal && (
            <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-slate-400">
              <span
                className="block h-2 w-2 rounded-full"
                style={{ backgroundColor: goal.color }}
              ></span>
              <span>{goal.name}</span>
            </div>
          )}
          <span className={`font-medium text-gray-900 dark:text-white ${task.completed ? 'line-through text-gray-400 dark:text-slate-500' : ''}`}>
            {task.text}
          </span>
        </div>
      </div>

      {task.description && (
        <p className="text-sm text-gray-600 dark:text-slate-400 mt-0.5 whitespace-pre-wrap pl-8 line-clamp-3">
          {task.description}
        </p>
      )}
    </div>
  );
};

export default TaskItem;
