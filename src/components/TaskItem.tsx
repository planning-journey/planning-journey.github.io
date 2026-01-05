import React, { useState } from 'react';
import { MoreVertical } from 'lucide-react';
import { db, Task, Goal } from '../db';
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
    <div className="flex items-center justify-between rounded-xl bg-white p-3 shadow-sm dark:bg-slate-800 border border-slate-200/50 dark:border-slate-700 mb-2">
      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          checked={task.completed}
          onChange={handleToggleComplete}
          className="h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-700"
        />
        <div>
          {goal && (
            <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-slate-400 mb-0.5">
              <span
                className="block h-2 w-2 rounded-full"
                style={{ backgroundColor: goal.color }}
              ></span>
              <span>{goal.name}</span>
            </div>
          )}
          <span className={`text-lg font-medium text-gray-900 dark:text-white ${task.completed ? 'line-through text-gray-400 dark:text-slate-500' : ''}`}>
            {task.text}
          </span>
        </div>
      </div>

      <div className="relative">
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-slate-200 transition-all duration-300"
        >
          <MoreVertical className="h-5 w-5" />
        </button>

        {isMenuOpen && (
          <div className="absolute right-0 top-full mt-2 w-36 rounded-xl bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none dark:bg-slate-700 transition-all duration-300 origin-top-right scale-100 opacity-100">
            <div className="py-1">
              <button
                onClick={() => { onEdit(task); setIsMenuOpen(false); }}
                className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 dark:text-slate-200 dark:hover:bg-slate-600 transition-all duration-300"
              >
                수정
              </button>
              <button
                onClick={() => { onDelete(task.id!); setIsMenuOpen(false); }}
                className="block w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/50 transition-all duration-300"
              >
                삭제
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskItem;
