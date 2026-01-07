import { useMemo, useState, useEffect } from 'react';
import { Goal as GoalIcon, ChevronDown } from 'lucide-react';
import type { Goal } from '../db';
import GoalList from './GoalList';

interface OngoingGoalsHeaderProps {
  goals: Goal[] | undefined;
  selectedDate: Date;
  onGoalSelect?: (goal: Goal) => void;
  selectedProjectId: string | null; // Add selectedProjectId prop
}

import { getDdayInfo } from '../utils/dateUtils';


const OngoingGoalsHeader = ({ goals, selectedDate, onGoalSelect, selectedProjectId }: OngoingGoalsHeaderProps) => {
  const [isOpen, setIsOpen] = useState(() => {
    const savedState = localStorage.getItem('ongoingGoalsOpen');
    return savedState !== null ? JSON.parse(savedState) : true;
  });

  useEffect(() => {
    localStorage.setItem('ongoingGoalsOpen', JSON.stringify(isOpen));
  }, [isOpen]);

  const toggleOpen = () => {
    setIsOpen((prev: boolean) => !prev);
  };

  const filteredGoals = useMemo(() => {
    if (!goals || !selectedProjectId) return []; // If no projects selected, return empty

    // Filter goals by projectId first
    const projectGoals = goals.filter(goal => goal.projectId === selectedProjectId);

    // Set time to 00:00:00 for accurate date comparison
    const startOfDay = new Date(selectedDate);
    startOfDay.setHours(0, 0, 0, 0);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return projectGoals
      .filter(goal => {
        const startDate = new Date(goal.startDate);
        startDate.setHours(0, 0, 0, 0);
        const endDate = new Date(goal.endDate);
        endDate.setHours(0, 0, 0, 0);

        return goal.status !== 'completed' && startDate <= startOfDay && startOfDay <= endDate && endDate >= today;
      })
      .sort((a, b) => new Date(b.endDate).getTime() - new Date(a.endDate).getTime());
  }, [goals, selectedDate, selectedProjectId]);

  const urgentGoals = useMemo(() => {
    if (!filteredGoals) return [];
    return filteredGoals.filter(goal => getDdayInfo(goal.endDate, selectedDate).isUrgent);
  }, [filteredGoals, selectedDate]);

  return (
    <div className="bg-white dark:bg-slate-900/70 backdrop-blur-sm border-b border-slate-200/50 dark:border-slate-700">
      <div className="flex items-center justify-between p-4 cursor-pointer" onClick={toggleOpen}>
        <div className="flex items-center gap-2">
          <GoalIcon className="w-5 h-5 text-slate-500" />
          <h2 className="text-lg font-semibold text-slate-800 dark:text-white">Ongoing Goals</h2>
        </div>
        <button className="p-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700">
          <ChevronDown
            className={`w-5 h-5 text-slate-500 transition-transform duration-300 ${isOpen ? '' : '-rotate-90'}`}
          />
        </button>
      </div>
      {!isOpen && urgentGoals.length > 0 && (
        <div className="px-4 py-2 text-sm text-red-500 bg-red-50 dark:bg-red-900/20 border-y border-red-200 dark:border-red-900 -mb-px">
          종료일이 임박한 {urgentGoals.length}개의 진행중인 목표가 있습니다.
        </div>
      )}
      {isOpen && <GoalList goals={filteredGoals} onGoalSelect={onGoalSelect} currentDate={selectedDate} />}
    </div>
  );
};

export default OngoingGoalsHeader;
