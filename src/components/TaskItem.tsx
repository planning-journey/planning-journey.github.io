import React, { useState } from 'react';
import Checkbox from './Checkbox';
import { db, type Task, type Goal } from '../db';
import { useLiveQuery } from 'dexie-react-hooks';
import { MoreVertical, Edit, Trash } from 'lucide-react'; // Import icons

interface TaskItemProps {
  task: Task;
  onView: (task: Task) => void; // New prop for viewing
  onEdit: (task: Task) => void; // Explicit edit prop
  onDelete: (taskId: number) => void;
  onToggleComplete: (taskId: number, completed: boolean) => void;
}

const TaskItem: React.FC<TaskItemProps> = ({ task, onView, onEdit, onDelete, onToggleComplete }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const goal = useLiveQuery(() => (task.goalId ? db.goals.get(task.goalId) : undefined), [task.goalId]);

  const handleToggleComplete = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation(); // Prevent opening detail modal
    onToggleComplete(task.id!, !task.completed);
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent opening detail modal
    onEdit(task);
    setIsMenuOpen(false);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent opening detail modal
    onDelete(task.id!);
    setIsMenuOpen(false);
  };

  return (
    <div
      className="flex items-start justify-between rounded-none py-2 pr-1 pl-3 cursor-pointer transition-all duration-300 relative group"
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
          {task.description && (
            <p className="text-sm text-gray-600 dark:text-slate-400 mt-0.5 whitespace-pre-wrap">
              {task.description}
            </p>
          )}
        </div>
      </div>

      {/* More Options / Edit / Delete Menu */}
      <div className="relative">
        <button
          onClick={(e) => { e.stopPropagation(); setIsMenuOpen(!isMenuOpen); }}
          className="p-1 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors duration-200 opacity-0 group-hover:opacity-100 focus:opacity-100"
        >
          <MoreVertical className="h-5 w-5" />
        </button>
        {isMenuOpen && (
          <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-700 rounded-lg shadow-lg py-1 z-10 border border-gray-200 dark:border-slate-600">
            <button
              onClick={handleEditClick}
              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-600 transition-colors duration-150"
            >
              <Edit className="h-4 w-4 mr-2" />
              수정
            </button>
            <button
              onClick={handleDeleteClick}
              className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-slate-600 transition-colors duration-150"
            >
              <Trash className="h-4 w-4 mr-2" />
              삭제
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskItem;
