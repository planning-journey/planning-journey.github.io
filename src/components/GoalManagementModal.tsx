import { useLiveQuery } from 'dexie-react-hooks';
import { db, type Goal } from '../db';
import { Flag } from 'lucide-react'; // Assuming Flag icon might be used for goals visually

interface GoalManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddNewGoal: () => void; // New prop to open the GoalEditorModal
}

const GoalManagementModal = ({ isOpen, onClose, onAddNewGoal }: GoalManagementModalProps) => {
  // Fetch goals using useLiveQuery
  const goals = useLiveQuery(() => db.goals.toArray(), []) as Goal[] | undefined;

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-60 dark:bg-opacity-70 z-40 flex items-center justify-center"
      onClick={onClose}
    >
      <div 
        className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-lg m-4 p-6 border border-gray-200 dark:border-slate-700"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-start mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">목표 관리</h2>
          <button onClick={onClose} className="text-gray-400 dark:text-slate-400 hover:text-gray-600 dark:hover:text-white transition-colors text-2xl leading-none">&times;</button>
        </div>
        
        <div className="h-64 overflow-y-auto pr-2 mb-6 custom-scrollbar">
            {goals && goals.length > 0 ? (
                <div className="flex flex-col gap-3">
                    {goals.map((goal) => (
                        <div 
                          key={goal.id} 
                          className="flex items-center p-4 bg-gray-100 dark:bg-slate-700 rounded-lg text-gray-700 dark:text-slate-300 border border-gray-200 dark:border-slate-600 shadow-sm"
                        >
                          <Flag style={{ color: goal.color }} className="w-5 h-5 mr-3" />
                          <span className="font-medium text-gray-900 dark:text-white">{goal.name}</span>
                          <span className="ml-auto text-gray-500 dark:text-slate-400">{goal.periodType === 'daily' ? '매일' : goal.periodType === 'weekly' ? '매주' : '매월'}</span>
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
