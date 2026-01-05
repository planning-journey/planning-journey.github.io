import React, { useState, useRef, useEffect } from 'react';
import { X } from 'lucide-react';
import { db } from '../db';
import { useLiveQuery } from 'dexie-react-hooks';

interface GoalSelectionBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectGoal: (goalId: number | null) => void;
  selectedGoalId: number | null;
}

const GoalSelectionBottomSheet: React.FC<GoalSelectionBottomSheetProps> = ({
  isOpen,
  onClose,
  onSelectGoal,
  selectedGoalId,
}) => {
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const sheetRef = useRef<HTMLDivElement>(null);

  const activeGoals = useLiveQuery(
    async () => {
      const now = new Date();
      return db.goals
        .where('startDate')
        .belowOrEqual(now)
        .and((goal) => goal.endDate >= now)
        .toArray();
    },
    []
  );

  useEffect(() => {
    if (isOpen) {
      sheetRef.current?.focus();
      const initialIndex = selectedGoalId === null
        ? 0
        : (activeGoals?.findIndex(goal => goal.id === selectedGoalId) ?? -1) + 1;
      if (initialIndex !== -1 && initialIndex !== activeIndex) {
        setActiveIndex(initialIndex);
      }
    }
  }, [isOpen, activeGoals, selectedGoalId]);

  if (!isOpen) return null;

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (!activeGoals) return;

    const totalItems = activeGoals.length + 1; // +1 for "선택 안함"

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActiveIndex((prevIndex) => (prevIndex + 1) % totalItems);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveIndex((prevIndex) => (prevIndex - 1 + totalItems) % totalItems);
    } else if (event.key === 'Enter') {
      event.preventDefault();
      if (activeIndex === 0) {
        onSelectGoal(null);
      } else {
        const selected = activeGoals[activeIndex - 1];
        if (selected) {
          onSelectGoal(selected.id || null);
        }
      }
      onClose(); // Close after selection
    } else if (event.key === 'Escape') {
      event.preventDefault();
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm transition-all duration-300 ease-in-out"
      onClick={onClose}
      onKeyDown={handleKeyDown}
      tabIndex={-1} // Make the div focusable
      ref={sheetRef}
    >
      <div
        className="relative w-full max-w-md rounded-t-3xl bg-white p-6 shadow-lg dark:bg-slate-800 transition-all duration-300 ease-in-out transform translate-y-0"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
      >
        <div className="flex items-center justify-between border-b border-slate-200/50 pb-4 dark:border-slate-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">목표 선택</h2>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-slate-200 transition-all duration-300"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="mt-4 max-h-60 overflow-y-auto">
          {activeGoals && activeGoals.length > 0 ? (
            <ul className="space-y-2">
              <li
                className={`flex cursor-pointer items-center justify-between rounded-xl p-3 transition-all duration-300
                  ${selectedGoalId === null ? 'bg-indigo-50 dark:bg-indigo-900/50' : ''}
                  ${activeIndex === 0 ? 'bg-gray-100 dark:bg-slate-700' : 'hover:bg-gray-50 dark:hover:bg-slate-700'}`}
                onClick={() => onSelectGoal(null)}
              >
                <span className="text-gray-700 dark:text-slate-200">선택 안함</span>
                {selectedGoalId === null && (
                  <svg className="h-5 w-5 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </li>
              {activeGoals.map((goal, index) => (
                <li
                  key={goal.id}
                  className={`flex cursor-pointer items-center justify-between rounded-xl p-3 transition-all duration-300
                    ${selectedGoalId === goal.id ? 'bg-indigo-50 dark:bg-indigo-900/50' : ''}
                    ${activeIndex === index + 1 ? 'bg-gray-100 dark:bg-slate-700' : 'hover:bg-gray-50 dark:hover:bg-slate-700'}`}
                  onClick={() => onSelectGoal(goal.id || null)}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="block h-3 w-3 rounded-full"
                      style={{ backgroundColor: goal.color }}
                    ></span>
                    <span className="text-gray-700 dark:text-slate-200">{goal.name}</span>
                  </div>
                  {selectedGoalId === goal.id && (
                    <svg className="h-5 w-5 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-center text-gray-500 dark:text-slate-400">활동 중인 목표가 없습니다.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default GoalSelectionBottomSheet;

