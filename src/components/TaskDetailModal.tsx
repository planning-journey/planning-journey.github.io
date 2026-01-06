import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { db, type Task } from '../db';
import { useLiveQuery } from 'dexie-react-hooks';
import { CalendarDays, Tag, Edit, Trash, X } from 'lucide-react';
import { parseYYYYMMDDToDate } from '../utils/dateUtils';
import ConfirmDeleteModal from './ConfirmDeleteModal';

interface TaskDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task | null;
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: number) => void;
}

const TaskDetailModal: React.FC<TaskDetailModalProps> = ({ isOpen, onClose, task, onEditTask, onDeleteTask }) => {
  const goal = useLiveQuery(() => (task?.goalId ? db.goals.get(task.goalId) : undefined), [task?.goalId]);
  const [showConfirmDeleteModal, setShowConfirmDeleteModal] = useState(false);

  // Animation states
  const [shouldRender, setShouldRender] = useState(false);
  const [animateIn, setAnimateIn] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      setTimeout(() => {
        setAnimateIn(true);
      }, 50);
    } else {
      setAnimateIn(false);
      const timer = setTimeout(() => {
        setShouldRender(false);
      }, 300); // Duration of transition-transform duration-300
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!shouldRender) {
    return null;
  }

  // If the task is null, display a loading or empty state within the slide-in,
  // but don't unmount the entire component until shouldRender is false.
  if (!task) {
    return (
      <div
        className={`fixed top-0 left-0 right-0 bottom-0 bg-black/50 z-50 transition-opacity duration-300
          ${animateIn ? 'opacity-100' : 'opacity-0'}`}
        onClick={onClose}
      >
        <div
          className={`fixed top-0 right-0 bottom-0 w-full bg-white dark:bg-slate-900 shadow-xl z-50 transform transition-transform duration-300 max-w-md
            ${animateIn ? 'translate-x-0' : 'translate-x-full'}`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between p-4 border-b border-slate-200/50 dark:border-slate-700">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">할 일 상세</h2>
            <button
              onClick={onClose}
              className="p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors duration-200"
            >
              <X className="h-5 w-5 text-slate-500" />
            </button>
          </div>
          <div className="p-4 text-center text-gray-500 dark:text-slate-400">
            <p>할 일 정보를 불러오는 중입니다...</p>
          </div>
        </div>
      </div>
    );
  }

  const formatDateForDisplay = (dateString: string) => {
    const date = parseYYYYMMDDToDate(dateString);
    return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`;
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEditTask(task);
    onClose();
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowConfirmDeleteModal(true);
  };

  const handleConfirmDelete = () => {
    if (task?.id) {
      onDeleteTask(task.id);
      setShowConfirmDeleteModal(false);
      onClose();
    }
  };

  const handleCancelDelete = () => {
    setShowConfirmDeleteModal(false);
  };

  return (
    <div
      className={`fixed top-0 left-0 right-0 bottom-0 bg-black/50 z-50 transition-opacity duration-300
        ${animateIn ? 'opacity-100' : 'opacity-0'}`}
      onClick={onClose}
    >
      <div
        className={`fixed top-0 right-0 bottom-0 w-full bg-white dark:bg-slate-900 shadow-xl z-50 transform transition-transform duration-300 max-w-md
          ${animateIn ? 'translate-x-0' : 'translate-x-full'}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-slate-200/50 dark:border-slate-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">할 일 상세</h2>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleEditClick}
              className="p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors duration-200"
              title="수정"
            >
              <Edit className="h-5 w-5 text-slate-500" />
            </button>
            <button
              onClick={handleDeleteClick}
              className="p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors duration-200"
              title="삭제"
            >
              <Trash className="h-5 w-5 text-red-500" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors duration-200"
            >
              <X className="h-5 w-5 text-slate-500" />
            </button>
          </div>
        </div>

        <div className="p-4 overflow-y-auto h-[calc(100%-64px)]"> {/* Adjust height based on header height */}
          <div className="space-y-4 text-gray-800 dark:text-slate-200">
            {/* Task Name */}
            <div>
              <h3 className="text-xl font-bold mb-1">{task.text}</h3>
            </div>

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

            {/* Description */}
            {task.description && (
              <div>
                <p className="text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2">설명:</p>
                <div className="prose dark:prose-invert max-w-none prose-blue break-all">
                  <ReactMarkdown>{task.description}</ReactMarkdown>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <ConfirmDeleteModal
        isOpen={showConfirmDeleteModal}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
};

export default TaskDetailModal;
