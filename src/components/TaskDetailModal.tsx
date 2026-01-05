import React from 'react';
import ReactMarkdown from 'react-markdown';
import { db, type Task, type Goal } from '../db';
import { useLiveQuery } from 'dexie-react-hooks';
import { XCircle, CalendarDays, Tag } from 'lucide-react';
import { parseYYYYMMDDToDate } from '../utils/dateUtils';

interface TaskDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task | null;
}

const TaskDetailModal: React.FC<TaskDetailModalProps> = ({ isOpen, onClose, task }) => {
  const goal = useLiveQuery(() => (task?.goalId ? db.goals.get(task.goalId) : undefined), [task?.goalId]);

  if (!isOpen || !task) return null;

  const formatDateForDisplay = (dateString: string) => {
    const date = parseYYYYMMDDToDate(dateString);
    return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`;
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-60 dark:bg-opacity-70 z-50 flex items-center justify-center"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-md m-4 p-6 border border-gray-200 dark:border-slate-700"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">할 일 상세</h2>
          <button onClick={onClose} className="text-gray-400 dark:text-slate-400 hover:text-gray-600 dark:hover:text-white transition-colors text-2xl leading-none">
            <XCircle className="h-7 w-7" />
          </button>
        </div>

        <div className="space-y-4 text-gray-800 dark:text-slate-200">
          {/* Goal */}
          {goal && (
            <div className="flex items-center text-sm">
              <Tag className="h-4 w-4 mr-2 text-indigo-500" />
              <span className="font-semibold mr-1">목표:</span>
              <span className="block h-2 w-2 rounded-full mr-2" style={{ backgroundColor: goal.color }}></span>
              <span>{goal.name}</span>
            </div>
          )}

          {/* Date */}
          <div className="flex items-center text-sm">
            <CalendarDays className="h-4 w-4 mr-2 text-indigo-500" />
            <span className="font-semibold mr-1">날짜:</span>
            <span>{formatDateForDisplay(task.date)}</span>
          </div>

          {/* Task Name */}
          <div>
            <h3 className="text-xl font-bold mb-1">{task.text}</h3>
          </div>

          {/* Description */}
          {task.description && (
            <div>
              <p className="text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2">설명:</p>
              <div className="prose dark:prose-invert max-w-none">
                <ReactMarkdown>{task.description}</ReactMarkdown>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end mt-6">
          <button
            onClick={onClose}
            className="px-5 py-3 text-sm font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-500 transition-all duration-300 shadow-md"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskDetailModal;
