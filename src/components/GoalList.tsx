import type { Goal } from '../db';

interface GoalListProps {
  goals: Goal[];
}

const GoalList = ({ goals }: GoalListProps) => {
  return (
    <div className="p-4 space-y-2">
      {goals.length > 0 ? (
        goals.map((goal) => (
          <div
            key={goal.id}
            className="p-3 rounded-lg flex items-center gap-3"
            style={{ backgroundColor: goal.color ? `${goal.color}20` : 'transparent' }}
          >
            <div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: goal.color }}
            />
            <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{goal.name}</span>
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
