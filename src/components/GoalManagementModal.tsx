import { useState, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, type Goal } from '../db';
import { Pencil, X } from 'lucide-react';
import useBodyScrollLock from '../utils/useBodyScrollLock';
import Checkbox from './Checkbox';

interface GoalManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddNewGoal: (projectId: string | null) => void;
  onEditGoal: (goal: Goal) => void;
  onDeleteGoal: (id: string) => void;
  selectedProjectId: string | null;
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
  const { periodType } = goal;
  if (!goal.startDate || !goal.endDate) return "날짜 정보 없음";

  // Convert string dates to Date objects
  const startDate = new Date(goal.startDate);
  const endDate = new Date(goal.endDate);

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

type TabType = 'in_progress' | 'completed' | 'all';

const GoalManagementModal = ({ isOpen, onClose, onAddNewGoal, onEditGoal, onDeleteGoal, selectedProjectId }: GoalManagementModalProps) => {
  useBodyScrollLock(isOpen);
  const [activeTab, setActiveTab] = useState<TabType>('in_progress');

  const allGoals = useLiveQuery(() => db.goals.toArray(), []) as Goal[] | undefined;
  
  // Filter goals by selectedProjectId and activeTab
  const filteredGoals = allGoals?.filter(goal => {
    if (goal.projectId !== selectedProjectId) return false;

    if (activeTab === 'in_progress') {
      return goal.status !== 'completed';
    } else if (activeTab === 'completed') {
      return goal.status === 'completed';
    }
    return true; // 'all'
  }) || [];

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

  const handleToggleGoal = async (goal: Goal) => {
    const newStatus = goal.status === 'completed' ? 'in_progress' : 'completed';
    await db.goals.update(goal.id, { status: newStatus });
  };

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

        {/* Tabs */}
        <div className="px-4 pt-4">
          <div className="flex p-1 space-x-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
            {(['in_progress', 'completed', 'all'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`
                  w-full py-2.5 text-sm font-medium leading-5 rounded-lg focus:outline-none transition-all duration-300
                  ${activeTab === tab
                    ? 'bg-white dark:bg-slate-700 text-indigo-700 dark:text-indigo-300 shadow'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
                  }
                `}
              >
                {tab === 'in_progress' ? '진행중' : tab === 'completed' ? '완료' : '전체'}
              </button>
            ))}
          </div>
        </div>

        <div className="p-4 overflow-y-auto flex-[1_1_0]">
          <div className="h-full overflow-y-auto pr-2 custom-scrollbar">
            {filteredGoals && filteredGoals.length > 0 ? (
                <div className="flex flex-col">
                    {filteredGoals.map((goal) => (
                        <div
                          key={goal.id}
                          className="flex items-center py-2 px-3 border-b border-slate-200/50 dark:border-slate-700 last:border-b-0"
                        >
                          <div className="flex items-center flex-grow gap-2">
                             <Checkbox
                                checked={goal.status === 'completed'}
                                onChange={() => handleToggleGoal(goal)}
                                className="mr-2"
                              />
                            <div className="flex items-center mr-3 h-6">
                              <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: goal.color }}></div>
                            </div>
                            <div className="overflow-hidden">
                              <span className={`font-semibold break-all ${goal.status === 'completed' ? 'text-slate-400 dark:text-slate-500 line-through' : 'text-gray-900 dark:text-white'}`}>
                                {goal.name}
                              </span>
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
                <p className="text-gray-500 dark:text-slate-400 text-center py-10">
                  {activeTab === 'in_progress' && '진행 중인 목표가 없습니다.'}
                  {activeTab === 'completed' && '완료된 목표가 없습니다.'}
                  {activeTab === 'all' && '아직 목표가 없습니다. 새로운 목표를 추가해보세요!'}
                </p>
            )}
          </div>
        </div>

        <div className="p-4 border-t border-slate-200/50 dark:border-slate-700">
          <button
            onClick={() => onAddNewGoal(selectedProjectId)}
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

