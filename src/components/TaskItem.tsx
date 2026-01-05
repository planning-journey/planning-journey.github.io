import React, { useState } from 'react';

import Checkbox from './Checkbox';
import { db, type Task, type Goal } from '../db';
import { useLiveQuery } from 'dexie-react-hooks';

interface TaskItemProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (taskId: number) => void;
  onToggleComplete: (taskId: number, completed: boolean) => void;
}

const TaskItem: React.FC<TaskItemProps> = ({ task, onEdit, onDelete, onToggleComplete }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const goal = useLiveQuery(() => (task.goalId ? db.goals.get(task.goalId) : undefined), [task.goalId]);

  const handleToggleComplete = () => {
    onToggleComplete(task.id!, !task.completed);
  };

  return (
    <div
      className="flex items-center justify-between rounded-none py-2 pr-1 pl-3 cursor-pointer transition-all duration-300"
      onClick={() => onEdit(task)}
    >
      <div className="flex items-center gap-3">
        <Checkbox
          checked={task.completed}
          onChange={handleToggleComplete}
          className="h-5 w-5"
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
          {task.description && (
            <p className="text-sm text-gray-600 dark:text-slate-400 mt-0.5 whitespace-pre-wrap">
              {task.description}
            </p>
          )}
        </div>
      </div>

    </div>
  );
};

export default TaskItem;
