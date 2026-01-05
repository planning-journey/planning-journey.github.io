import type { Goal } from '../db';

interface GoalListProps {
  goals: Goal[];
  onGoalSelect?: (goal: Goal) => void;
}

const getDdayInfo = (endDate: Date): { text: string; isUrgent: boolean } => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const end = new Date(endDate);
  end.setHours(0, 0, 0, 0);

  const diffTime = end.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  const isUrgent = diffDays >= 0 && diffDays <= 7;

  let text;
  if (diffDays === 0) {
    text = 'D-Day';
  } else if (diffDays > 0) {
    text = `D-${diffDays}`;
  } else {
    text = `D+${Math.abs(diffDays)}`;
  }

  return { text, isUrgent };
};

const GoalList = ({ goals, onGoalSelect }: GoalListProps) => {
  return (
    <div className="space-y-1 px-4 pb-2"> {/* Reduced vertical space and added horizontal padding */}
      {goals.length > 0 ? (
        goals.map((goal) => {
          const dDay = getDdayInfo(goal.endDate);
          return (
            <div
              key={goal.id}
              className="flex items-center justify-between gap-2 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800/60 rounded-md py-1 px-2 cursor-pointer"
              onClick={() => onGoalSelect?.(goal)}
            >
              <div className="flex items-center gap-2 min-w-0">
                <div
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ backgroundColor: goal.color }}
                />
                <span className="text-sm text-slate-700 dark:text-slate-200 truncate">{goal.name}</span>
              </div>
              <div
                className={`text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${
                  dDay.isUrgent
                    ? 'text-red-500 bg-red-100 dark:text-red-400 dark:bg-red-900/50'
                    : 'text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700/50'
                }`}
              >
                {dDay.text}
              </div>
            </div>
          );
        })
      ) : (
        <div className="text-center py-4 text-slate-500 text-sm">
          No ongoing goals for this day.
        </div>
      )}
    </div>
  );
};

export default GoalList;
