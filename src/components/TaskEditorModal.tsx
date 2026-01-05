import { useState, useEffect, useRef } from 'react';
import { db, type Task } from '../db';
import { useLiveQuery } from 'dexie-react-hooks';
import GoalAutocomplete from './GoalAutocomplete';
import DateSelectorModal from './DateSelectorModal';
import { Calendar as CalendarIcon } from 'lucide-react';
import { formatDateToYYYYMMDD, parseYYYYMMDDToDate } from '../utils/dateUtils';

interface TaskEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  taskToEdit?: Task | null;
  onSave: (task: Task) => void;
}

const TaskEditorModal: React.FC<TaskEditorModalProps> = ({ isOpen, onClose, taskToEdit, onSave }) => {
  const [taskText, setTaskText] = useState('');
  const [description, setDescription] = useState(''); // Add description state
  const [selectedDate, setSelectedDate] = useState<string | null>(formatDateToYYYYMMDD(new Date()));
  const [selectedGoalId, setSelectedGoalId] = useState<number | null | undefined>(undefined);
  const [isDateSelectorModalOpen, setIsDateSelectorModalOpen] = useState(false);
  const allGoals = useLiveQuery(() => db.goals.toArray(), []);
  const textareaRef = useRef<HTMLTextAreaElement>(null); // Ref for textarea

  useEffect(() => {
    if (taskToEdit) {
      setTaskText(taskToEdit.text);
      setDescription(taskToEdit.description || ''); // Initialize description
      setSelectedDate(taskToEdit.date);
      setSelectedGoalId(taskToEdit.goalId);
    } else {
      setTaskText('');
      setDescription(''); // Reset description
      setSelectedDate(formatDateToYYYYMMDD(new Date()));
      setSelectedGoalId(undefined);
    }
  }, [taskToEdit]);

  // Effect for dynamic textarea height
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [description, isOpen]); // Adjust height when description changes or modal opens

  if (!isOpen) return null;

  const handleSave = async () => {
    if (!taskText.trim() || !selectedDate) {
      return;
    }

    const updatedTask: Task = {
      ...taskToEdit,
      text: taskText,
      description: description, // Include description in updated task
      date: selectedDate,
      goalId: selectedGoalId === undefined ? null : selectedGoalId,
      completed: taskToEdit?.completed || false,
      createdAt: taskToEdit?.createdAt || new Date(),
    };

    onSave(updatedTask);
    onClose();
  };

  const handleSelectGoal = (goalId: number | null | undefined) => {
    setSelectedGoalId(goalId);
  };

  const handleOpenDateSelector = () => {
    setIsDateSelectorModalOpen(true);
  };

  const handleSelectNewDate = (date: Date) => {
    setSelectedDate(formatDateToYYYYMMDD(date));
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
        className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-md m-4 p-6 border border-gray-200 dark:border-slate-700 max-h-[90vh] overflow-y-auto"
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
            
            {/* Description Textarea */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                설명
              </label>
              <textarea
                ref={textareaRef}
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={1} // Start with 1 row, height will be adjusted by JS
                className="w-full px-3 py-2 bg-gray-100 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 overflow-hidden resize-none"
                placeholder="자세한 내용을 입력하세요"
              ></textarea>
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
