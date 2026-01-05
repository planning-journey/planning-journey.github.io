import type { Goal } from '../db';

interface GoalListProps {
  goals: Goal[];
}

const getDday = (endDate: Date): string => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const end = new Date(endDate);
  end.setHours(0, 0, 0, 0);

  const diffTime = end.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return 'D-Day';
  } else if (diffDays > 0) {
    return `D-${diffDays}`;
  } else {
    return `D+${Math.abs(diffDays)}`;
  }
};

const GoalList = ({ goals }: GoalListProps) => {
  return (
    <div className="p-4 space-y-2">
      {goals.length > 0 ? (
        goals.map((goal) => (
          <div
            key={goal.id}
            className="p-3 rounded-lg flex items-center justify-between gap-3 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800/60"
            style={{ backgroundColor: goal.color ? `${goal.color}20` : 'transparent' }}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ backgroundColor: goal.color }}
              />
              <span className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate">{goal.name}</span>
            </div>
            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700/50 px-2 py-1 rounded-full">
              {getDday(goal.endDate)}
            </div>
          </div>
        ))
      ) : (
        <div className="text-center py-4 text-slate-500">
          No ongoing goals for this day.
        </div>
      )}
    </div>
  );
};

export default GoalList;
