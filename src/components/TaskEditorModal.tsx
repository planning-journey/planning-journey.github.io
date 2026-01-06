import { useState, useEffect, useRef } from 'react';
import { db, type Task } from '../db';
import { useLiveQuery } from 'dexie-react-hooks';
import GoalAutocomplete from './GoalAutocomplete';
import DateSelectorModal from './DateSelectorModal';
import { Calendar as CalendarIcon, X } from 'lucide-react';
import { formatDateToYYYYMMDD, parseYYYYMMDDToDate, formatDateForDisplay } from '../utils/dateUtils';
import useBodyScrollLock from '../utils/useBodyScrollLock';
import { v4 as uuidv4 } from 'uuid'; // Import uuid for unique IDs

interface TaskEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  taskToEdit?: Task | null;
  onSave: (task: Task) => void;
  selectedProjectId: string; // Add selectedProjectId prop
}

const TaskEditorModal: React.FC<TaskEditorModalProps> = ({ isOpen, onClose, taskToEdit, onSave, selectedProjectId }) => {
  useBodyScrollLock(isOpen);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedDate, setSelectedDate] = useState<string | null>(formatDateToYYYYMMDD(new Date()));
  const [selectedGoalId, setSelectedGoalId] = useState<string | null | undefined>(undefined);
  const [isDateSelectorModalOpen, setIsDateSelectorModalOpen] = useState(false);
  const allGoals = useLiveQuery(() => db.goals.toArray(), []);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [visible, setVisible] = useState(isOpen);
  const [animated, setAnimated] = useState(isOpen);

  useEffect(() => {
    if (isOpen) {
      setVisible(true);
      const timeoutId = setTimeout(() => {
        setAnimated(true);
      }, 50); // Small delay to ensure the component is mounted before starting animation
      return () => clearTimeout(timeoutId);
    } else {
      setAnimated(false);
      const timeoutId = setTimeout(() => {
        setVisible(false);
      }, 300); // Must match CSS transition duration
      return () => clearTimeout(timeoutId);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      if (taskToEdit) {
        setTitle(taskToEdit.title); // Use title
        setDescription(taskToEdit.description || '');
        setSelectedDate(taskToEdit.date);
        setSelectedGoalId(taskToEdit.goalId);
      } else {
        setTitle('');
        setDescription('');
        setSelectedDate(formatDateToYYYYMMDD(new Date()));
        setSelectedGoalId(undefined);
      }
    }
  }, [isOpen, taskToEdit]);

  // Effect for dynamic textarea height
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [description, animated]); // Adjust height when description changes or modal opens

  // If not visible, return null to unmount
  if (!visible) {
    return null;
  }

  const handleSave = async () => {
    if (!title.trim() || !selectedDate) {
      return;
    }

    const taskData: Task = {
      id: taskToEdit ? taskToEdit.id : uuidv4(), // Use existing ID or generate new
      projectId: selectedProjectId,
      title: title,
      description: description,
      date: selectedDate,
      goalId: selectedGoalId === undefined ? undefined : selectedGoalId || undefined,
      completed: taskToEdit?.completed || false,
      createdAt: taskToEdit?.createdAt || new Date(),
      dueDate: taskToEdit?.dueDate, // Carry over dueDate if exists
    };

    onSave(taskData);
    onClose();
  };

  const handleSelectGoal = (goalId: string | null | undefined) => { // Updated type
    setSelectedGoalId(goalId);
  };

  const handleOpenDateSelector = () => {
    setIsDateSelectorModalOpen(true);
  };

  const handleSelectNewDate = (date: Date) => {
    setSelectedDate(formatDateToYYYYMMDD(date));
    setIsDateSelectorModalOpen(false);
  };

  // Remove the local formatDateForDisplay and use the imported one

  return (
    <div className={`fixed inset-0 z-50 flex justify-end transition-opacity duration-300 ${animated ? 'opacity-100' : 'opacity-0'}`}
      onClick={onClose}
    >
      <div
        className={`fixed top-0 right-0 bottom-0 w-full bg-white dark:bg-slate-900 shadow-xl z-50 transform transition-transform duration-300 max-w-md
          ${animated ? 'translate-x-0' : 'translate-x-full'}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-slate-200/50 dark:border-slate-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            {taskToEdit ? '할 일 수정' : '할 일 추가'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors duration-200"
          >
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        <div className="p-4 overflow-y-auto h-[calc(100%-64px-76px)]"> {/* Adjusted height to account for header and fixed footer */}
          <form onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
            <div className="space-y-6">
              <div>
                <label htmlFor="goalAutocomplete" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                  목표
                </label>
                <GoalAutocomplete
                  goals={allGoals || []}
                  selectedGoalId={selectedGoalId}
                  onSelectGoal={handleSelectGoal}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                  날짜
                </label>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-2 bg-gray-100 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg text-gray-900 dark:text-white flex-grow">
                    {formatDateForDisplay(selectedDate)}
                  </span>
                  <button
                    type="button"
                    onClick={handleOpenDateSelector}
                    className="p-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-500 transition-all duration-300 shadow-md"
                  >
                    <CalendarIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="taskTitle" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                  할 일
                </label>
                <input
                  type="text"
                  id="taskTitle"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-100 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="예: 보고서 작성"
                  required
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                  설명
                </label>
                <textarea
                  ref={textareaRef}
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={1}
                  className="w-full px-3 py-2 bg-gray-100 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 overflow-hidden resize-none"
                  placeholder="자세한 내용을 입력하세요"
                ></textarea>
              </div>
            </div>
          </form>
        </div>

        <div className="p-4 border-t border-slate-200/50 dark:border-slate-700">
          <button
            type="submit"
            onClick={handleSave}
            className="w-full px-5 py-3 text-sm font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-500 transition-all duration-300 shadow-md"
          >
            {taskToEdit ? '할 일 수정' : '할 일 추가'}
          </button>
        </div>
      </div>

      <DateSelectorModal
        isOpen={isDateSelectorModalOpen}
        onClose={() => setIsDateSelectorModalOpen(false)}
        onSelectDate={handleSelectNewDate}
        initialDate={selectedDate ? parseYYYYMMDDToDate(selectedDate) : new Date()}
      />
    </div>
  );
};

export default TaskEditorModal;
