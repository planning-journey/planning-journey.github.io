import { useLiveQuery } from 'dexie-react-hooks';
import { db, type Goal } from '../db';
import { Pencil, X } from 'lucide-react'; // Import Pencil and X icons

interface GoalManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddNewGoal: () => void;
  onEditGoal: (goal: Goal) => void; // New prop for editing a goal
  onDeleteGoal: (id: number) => void; // New prop for deleting a goal
}

// Helper function to get the week number of the month (1-indexed)
const getWeekOfMonth = (date: Date): number => {
  const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
  // Get 0-indexed day of the week (Sunday is 0, Monday is 1, ...) for the 1st of the month
  const firstDayOfMonth = startOfMonth.getDay(); 
  // Adjust to make Monday the start of the week (1=Monday, ..., 0=Sunday)
  const adjustedFirstDayOfMonth = (firstDayOfMonth === 0) ? 6 : firstDayOfMonth - 1; 

  const dayOfMonth = date.getDate();
  return Math.ceil((dayOfMonth + adjustedFirstDayOfMonth) / 7);
};

// Helper function to format date strings for display
const formatPeriod = (goal: Goal): string => {
  const { periodType, startDate, endDate } = goal;
  if (!startDate || !endDate) return "날짜 정보 없음";

  const startYear = startDate.getFullYear();
  const startMonth = startDate.getMonth() + 1; // 1-indexed

  switch (periodType) {
    case 'yearly':
      return `${startYear}년`;
    case 'monthly':
      return `${startYear}년 ${startMonth}월`;
    case 'weekly':
      // Assuming week starts on Monday (weekStartsOn: 1 in Calendar.tsx)
      const weekNum = getWeekOfMonth(startDate);
      return `${startMonth}월 ${weekNum}째 주 (${startDate.getDate()}일 ~ ${endDate.getDate()}일)`;
    case 'daily':
      return `${startYear}년 ${startMonth}월 ${startDate.getDate()}일`;
    case 'free':
      const endYear = endDate.getFullYear();
      const endMonth = endDate.getMonth() + 1;
      const endDateDay = endDate.getDate();
      return `${startYear}년 ${startMonth}월 ${startDate.getDate()}일 ~ ${endYear}년 ${endMonth}월 ${endDateDay}일`;
    default:
      return "기간 정보 없음";
  }
};


const GoalManagementModal = ({ isOpen, onClose, onAddNewGoal, onEditGoal, onDeleteGoal }: GoalManagementModalProps) => {
  // Fetch goals using useLiveQuery
  const goals = useLiveQuery(() => db.goals.toArray(), []) as Goal[] | undefined;

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-60 dark:bg-opacity-70 z-40 flex items-center justify-center"
      onClick={onClose}
    >
      <div 
        className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-lg m-4 p-6 border border-slate-200/50 dark:border-slate-700 transition-all duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-start mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">목표 관리</h2>
          <button onClick={onClose} className="text-gray-400 dark:text-slate-400 hover:text-gray-600 dark:hover:text-white transition-colors text-2xl leading-none">&times;</button>
        </div>
        
        <div className="h-64 overflow-y-auto pr-2 mb-6 custom-scrollbar">
            {goals && goals.length > 0 ? (
                <div className="flex flex-col">
                    {goals.map((goal) => (
                        <div 
                          key={goal.id} 
                          className="flex items-center py-2 px-3 border-b border-slate-200/50 dark:border-slate-700 last:border-b-0"
                        >
                          <div className="flex items-center flex-grow">
                            {/* Color Circle */}
                            <div className="w-4 h-4 rounded-full mr-3 shrink-0" style={{ backgroundColor: goal.color }}></div>
                            <div className="overflow-hidden"> {/* Added overflow-hidden to prevent text overflow */}
                              <span className="font-semibold text-gray-900 dark:text-white truncate block">{goal.name}</span> {/* Added truncate block */}
                              {/* Period Display */}
                              <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">{formatPeriod(goal)}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2 pl-4"> {/* Added pl-4 for spacing */}
                            {/* Pencil Icon for Edit */}
                            <button 
                              onClick={() => onEditGoal(goal)}
                              className="p-2 rounded-full text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            {/* X Icon for Delete */}
                            <button 
                              onClick={() => goal.id && onDeleteGoal(goal.id)} // Pass ID for deletion
                              className="p-2 rounded-full text-slate-500 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-red-500/50"
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
        
        <div className="flex justify-end">
          <button 
            onClick={onAddNewGoal}
            className="px-5 py-3 text-sm font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-500 transition-all duration-300 shadow-md"
          >
            신규 목표 추가
          </button>
        </div>
      </div>
    </div>
  );
};

export default GoalManagementModal;
