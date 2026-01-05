import { useState, useEffect } from 'react';
import { db, type Task, type Goal } from '../db';
import Calendar from './Calendar'; // Will be used for date selection
import { useLiveQuery } from 'dexie-react-hooks';

interface TaskEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  taskToEdit?: Task | null;
  onSave: (task: Task) => void;
}

const TaskEditorModal: React.FC<TaskEditorModalProps> = ({ isOpen, onClose, taskToEdit, onSave }) => {
  const [taskText, setTaskText] = useState('');
  const [description, setDescription] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [selectedGoalId, setSelectedGoalId] = useState<number | undefined>(undefined);
  const allGoals = useLiveQuery(() => db.goals.toArray(), []);

  useEffect(() => {
    if (taskToEdit) {
      setTaskText(taskToEdit.text);
      setDescription(taskToEdit.description || '');
      setSelectedDate(taskToEdit.dueDate ? new Date(taskToEdit.dueDate) : new Date());
      setSelectedGoalId(taskToEdit.goalId);
    } else {
      setTaskText('');
      setDescription('');
      setSelectedDate(new Date());
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
      description: description,
      dueDate: selectedDate,
      goalId: selectedGoalId,
      completed: taskToEdit?.completed || false,
      createdAt: taskToEdit?.createdAt || new Date(),
    };

    onSave(updatedTask);
    onClose();
  };

  const handleGoalChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value;
    setSelectedGoalId(value === "" ? undefined : parseInt(value));
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
              <label htmlFor="taskText" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                할 일 이름
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

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                설명 (선택 사항)
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 bg-gray-100 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="자세한 내용을 입력하세요"
              ></textarea>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                날짜 선택
              </label>
              <div className="flex justify-center">
                <Calendar
                  selectionType="day"
                  selectedDate={selectedDate}
                  onSelectDate={setSelectedDate}
                />
              </div>
            </div>

            <div>
              <label htmlFor="goalSelect" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                목표 (선택 사항)
              </label>
              <select
                id="goalSelect"
                value={selectedGoalId !== undefined ? selectedGoalId : ""}
                onChange={handleGoalChange}
                className="w-full px-3 py-2 bg-gray-100 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">-- 목표 없음 --</option>
                {allGoals?.map((goal) => (
                  <option key={goal.id} value={goal.id}>
                    {goal.name}
                  </option>
                ))}
              </select>
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
    </div>
  );
};

export default TaskEditorModal;
