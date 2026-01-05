import { useState, useEffect } from 'react';
import { db, type Task, type Goal } from '../db';
import Calendar from './Calendar';
import { useLiveQuery } from 'dexie-react-hooks';
import GoalAutocomplete from './GoalAutocomplete';
import DateSelectorModal from './DateSelectorModal'; // Import DateSelectorModal
import { Calendar as CalendarIcon } from 'lucide-react'; // Import Calendar icon from lucide-react
import { formatDateToYYYYMMDD, parseYYYYMMDDToDate } from '../utils/dateUtils';

interface TaskEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  taskToEdit?: Task | null;
  onSave: (task: Task) => void;
}

const TaskEditorModal: React.FC<TaskEditorModalProps> = ({ isOpen, onClose, taskToEdit, onSave }) => {
  const [taskText, setTaskText] = useState('');
  const [selectedDate, setSelectedDate] = useState<string | null>(formatDateToYYYYMMDD(new Date()));
  const [selectedGoalId, setSelectedGoalId] = useState<number | undefined>(undefined);
  const [isDateSelectorModalOpen, setIsDateSelectorModalOpen] = useState(false); // New state for date selector modal
  const allGoals = useLiveQuery(() => db.goals.toArray(), []);

  useEffect(() => {
    if (taskToEdit) {
      setTaskText(taskToEdit.text);
      setSelectedDate(taskToEdit.date); // Use the date string directly
      setSelectedGoalId(taskToEdit.goalId);
    } else {
      setTaskText('');
      setSelectedDate(formatDateToYYYYMMDD(new Date())); // Default to today's date
      setSelectedGoalId(undefined);
    }
  }, [taskToEdit]);

  if (!isOpen) return null;

  const handleSave = async () => {
    if (!taskText.trim() || !selectedDate) {
      return;
    }

    const updatedTask: Task = {
      ...taskToEdit,
      text: taskText,
      date: selectedDate, // Use the date string directly
      goalId: selectedGoalId,
      completed: taskToEdit?.completed || false,
      createdAt: taskToEdit?.createdAt || new Date(),
    };

    onSave(updatedTask);
    onClose();
  };

  const handleSelectGoal = (goalId: number | undefined) => {
    setSelectedGoalId(goalId);
  };

  const handleOpenDateSelector = () => {
    setIsDateSelectorModalOpen(true);
  };

  const handleSelectNewDate = (date: Date) => {
    setSelectedDate(formatDateToYYYYMMDD(date)); // Convert Date object to YYYY-MM-DD string
    setIsDateSelectorModalOpen(false);
  };

  const formatDateForDisplay = (dateString: string | null) => {
    if (!dateString) return '날짜 미지정';
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
        <div className="flex justify-between items-start">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            {taskToEdit ? '할 일 수정' : '할 일 추가'}
          </h2>
          <button onClick={onClose} className="text-gray-400 dark:text-slate-400 hover:text-gray-600 dark:hover:text-white transition-colors text-2xl leading-none">
            &times;
          </button>
        </div>

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
              <label htmlFor="taskText" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                할 일
              </label>
              <input
                type="text"
                id="taskText"
                value={taskText}
                onChange={(e) => setTaskText(e.target.value)}
                className="w-full px-3 py-2 bg-gray-100 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="예: 보고서 작성"
                required
              />
            </div>
          </div>

          <div className="flex justify-end mt-8">
            <button
              type="submit"
              className="w-full px-5 py-3 text-sm font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-500 transition-all duration-300 shadow-md"
            >
              {taskToEdit ? '할 일 수정' : '할 일 추가'}
            </button>
          </div>
        </form>
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
