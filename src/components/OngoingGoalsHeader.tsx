import { useMemo, useState } from 'react';
import { Goal as GoalIcon, ChevronDown } from 'lucide-react';
import type { Goal } from '../db';
import GoalList from './GoalList';

interface OngoingGoalsHeaderProps {
  goals: Goal[] | undefined;
  selectedDate: Date;
}

const OngoingGoalsHeader = ({ goals, selectedDate }: OngoingGoalsHeaderProps) => {
  const [isOpen, setIsOpen] = useState(true);

  const toggleOpen = () => {
    setIsOpen(!isOpen);
  };

  const filteredGoals = useMemo(() => {
    if (!goals) return [];
    
    // Set time to 00:00:00 for accurate date comparison
    const startOfDay = new Date(selectedDate);
    startOfDay.setHours(0, 0, 0, 0);

    return goals
      .filter(goal => {
        const startDate = new Date(goal.startDate);
        startDate.setHours(0, 0, 0, 0);
        const endDate = new Date(goal.endDate);
        endDate.setHours(0, 0, 0, 0);

        return startDate <= startOfDay && startOfDay <= endDate;
      })
      .sort((a, b) => new Date(b.endDate).getTime() - new Date(a.endDate).getTime());
  }, [goals, selectedDate]);

  return (
    <div className="bg-white dark:bg-slate-900/70 backdrop-blur-sm border-b border-slate-200/50">
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-2">
          <GoalIcon className="w-5 h-5 text-slate-500" />
          <h2 className="text-lg font-semibold text-slate-800 dark:text-white">Ongoing Goals</h2>
        </div>
        <button onClick={toggleOpen} className="p-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700">
          <ChevronDown
            className={`w-5 h-5 text-slate-500 transition-transform duration-300 ${isOpen ? '' : '-rotate-90'}`}
          />
        </button>
      </div>
      {isOpen && <GoalList goals={filteredGoals} />}
    </div>
  );
};

export default OngoingGoalsHeader;
