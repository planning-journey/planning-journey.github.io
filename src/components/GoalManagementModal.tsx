import { useState, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, type Goal } from '../db';
import { Pencil, X } from 'lucide-react';
import useBodyScrollLock from '../utils/useBodyScrollLock';

interface GoalManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddNewGoal: () => void;
  onEditGoal: (goal: Goal) => void;
  onDeleteGoal: (id: number) => void;
}

// Helper function to get the week number of the month (1-indexed)
const getWeekOfMonth = (date: Date): number => {
  const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
  const firstDayOfMonth = startOfMonth.getDay();
  const adjustedFirstDayOfMonth = (firstDayOfMonth === 0) ? 6 : firstDayOfMonth - 1;

  const dayOfMonth = date.getDate();
  return Math.ceil((dayOfMonth + adjustedFirstDayOfMonth) / 7);
};

// Helper function to format date strings for display
const formatPeriod = (goal: Goal): string => {
  const { periodType, startDate, endDate } = goal;
  if (!startDate || !endDate) return "날짜 정보 없음";

  const startYear = startDate.getFullYear();
  const startMonth = startDate.getMonth() + 1;

  switch (periodType) {
    case 'yearly':
      return `${startYear}년`;
    case 'monthly':
      return `${startYear}년 ${startMonth}월`;
    case 'weekly': {
      const weekNum = getWeekOfMonth(startDate);
      return `${startMonth}월 ${weekNum}째 주 (${startDate.getDate()}일 ~ ${endDate.getDate()}일)`;
    }
    case 'daily':
      return `${startYear}년 ${startMonth}월 ${startDate.getDate()}일`;
    case 'free': {
      const endYear = endDate.getFullYear();
      const endMonth = endDate.getMonth() + 1;
      const endDateDay = endDate.getDate();
      return `${startYear}년 ${startMonth}월 ${startDate.getDate()}일 ~ ${endYear}년 ${endMonth}월 ${endDateDay}일`;
    }
    default:
      return "기간 정보 없음";
  }
};


const GoalManagementModal = ({ isOpen, onClose, onAddNewGoal, onEditGoal, onDeleteGoal }: GoalManagementModalProps) => {
  useBodyScrollLock(isOpen);
  const goals = useLiveQuery(() => db.goals.toArray(), []) as Goal[] | undefined;

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

  // If not visible, return null to unmount
  if (!visible) {
    return null;
  }

  return (
    <div
      className={`fixed inset-0 z-50 flex justify-end transition-opacity duration-300 ${animated ? 'opacity-100' : 'opacity-0'}`}
      onClick={onClose}
    >
      <div
        className={`fixed top-0 right-0 bottom-0 w-full bg-white dark:bg-slate-900 shadow-xl z-50 transform transition-transform duration-300 max-w-md flex flex-col
          ${animated ? 'translate-x-0' : 'translate-x-full'}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-slate-200/50 dark:border-slate-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">목표 관리</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors duration-200"
          >
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        <div className="p-4 overflow-y-auto flex-[1_1_0]"> {/* Adjusted height to account for header and footer */}
          <div className="h-full overflow-y-auto pr-2 custom-scrollbar">
            {goals && goals.length > 0 ? (
                <div className="flex flex-col">
                    {goals.map((goal) => (
                        <div
                          key={goal.id}
                          className="flex items-center py-2 px-3 border-b border-slate-200/50 dark:border-slate-700 last:border-b-0"
                        >
                          <div className="flex items-start flex-grow gap-2">
                            <div className="h-6 flex items-center">
                              <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: goal.color }}></div>
                            </div>
                            <div className="overflow-hidden">
                              <span className="font-semibold text-gray-900 dark:text-white break-all">{goal.name}</span>
                              <p className="text-sm text-gray-500 dark:text-slate-400">{formatPeriod(goal)}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 pl-4">
                            <button
                              onClick={() => onEditGoal(goal)}
                              className="p-2 rounded-md text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => goal.id && onDeleteGoal(goal.id)}
                              className="p-2 rounded-md text-slate-500 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-red-500/50"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-gray-500 dark:text-slate-400 text-center py-10">아직 목표가 없습니다. 새로운 목표를 추가해보세요!</p>
            )}
          </div>
        </div>

        <div className="p-4 border-t border-slate-200/50 dark:border-slate-700">
          <button
            onClick={onAddNewGoal}
            className="w-full px-5 py-3 text-sm font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-500 transition-all duration-300 shadow-md"
          >
            신규 목표 추가
          </button>
        </div>
      </div>
    </div>
  );
};

export default GoalManagementModal;
