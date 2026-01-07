import React from 'react';
import Checkbox from './Checkbox';
import { db, type Task } from '../db';
import { useLiveQuery } from 'dexie-react-hooks';
import { GripVertical } from 'lucide-react';
import { useDragDrop } from '../contexts/DragDropContext';

interface TaskItemProps {
  task: Task;
  onView: (task: Task) => void;
  onToggleComplete: (taskId: string, completed: boolean) => void;
}

const TaskItem = React.forwardRef<HTMLDivElement, TaskItemProps>(({ task, onView, onToggleComplete }, ref) => {
  const goal = useLiveQuery(() => (task.goalId ? db.goals.get(task.goalId) : undefined), [task.goalId]);
  const { startDrag, isDragging, draggedTask } = useDragDrop();

  const handleToggleComplete = (completed: boolean) => {
    onToggleComplete(task.id!, completed);
  };

  const isBeingDragged = isDragging && draggedTask?.id === task.id;

  return (
    <div
      ref={ref}
      data-task-id={task.id}
      className={`flex flex-col items-stretch rounded-none p-2 cursor-pointer relative group transition-opacity duration-200 ${isBeingDragged ? 'opacity-30' : 'opacity-100'}`}
      onClick={() => onView(task)} // Open detail modal on main div click
    >
      <div className="flex flex-col items-stretch">
        {goal && (
          <div className={`flex items-center gap-1 px-6 text-sm ${goal.status === 'completed' ? 'text-slate-400 dark:text-slate-600 line-through' : 'text-gray-500 dark:text-slate-400'}`}>
            <span
              className={`block h-2 w-2 flex-none rounded-full ${goal.status === 'completed' ? 'opacity-50' : ''}`}
              style={{ backgroundColor: goal.color }}
            ></span>
            <span className="truncate">{goal.name}</span>
          </div>
        )}

        <div className="flex items-start gap-2">
          <div className="flex items-center justify-center h-6">
            <button
              className="flex items-center size-4 text-slate-400 hover:text-indigo-500 cursor-grab active:cursor-grabbing touch-none"
              onPointerDown={(e) => {
                e.stopPropagation(); // Prevent opening detail modal
                startDrag(task, e);
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <GripVertical size={16} />
            </button>
          </div>
          <div className="flex-1 min-w-0">
            <span className={`font-medium text-gray-900 dark:text-white break-words ${task.completed ? 'opacity-50 line-through text-gray-400 dark:text-slate-500' : ''}`}>
              {task.title}
            </span>
          </div>
          <div
            onClick={(event: React.MouseEvent) => {
              event.stopPropagation();
              handleToggleComplete(!task.completed);
            }}
            className="flex items-center justify-center h-6">
            <Checkbox
              checked={task.completed}
              onChange={handleToggleComplete}
            />
          </div>
        </div>
      </div>

      {task.description && (
        <p className="text-sm text-gray-600 dark:text-slate-400 mt-0.5 whitespace-pre-wrap px-6 line-clamp-3">
          {task.description}
        </p>
      )}
    </div>
  );
})

export default TaskItem;
