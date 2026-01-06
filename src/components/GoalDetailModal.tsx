import type { Goal } from '../db';

interface GoalDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  goal: Goal | null;
}

const periodTypeMap = {
  daily: '일간',
  weekly: '주간',
  monthly: '월간',
  yearly: '연간',
  free: '자유',
};

const formatDate = (date: Date | null) => {
  if (!date) return '';
  return new Date(date).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

const GoalDetailModal = ({ isOpen, onClose, goal }: GoalDetailModalProps) => {
  if (!isOpen || !goal) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 dark:bg-black/70 z-50 flex items-center justify-center"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-md m-4 p-6 border border-gray-200 dark:border-slate-700"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: goal.color }} />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{goal.name}</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 dark:text-slate-400 hover:text-gray-600 dark:hover:text-white transition-colors text-2xl leading-none">&times;</button>
        </div>

        <div className="space-y-4 text-sm">
          <div className="flex justify-between p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
            <span className="font-semibold text-slate-600 dark:text-slate-300">구분</span>
            <span className="font-medium text-slate-800 dark:text-slate-100">{periodTypeMap[goal.periodType]}</span>
          </div>
          <div className="flex justify-between p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
            <span className="font-semibold text-slate-600 dark:text-slate-300">시작일</span>
            <span className="font-medium text-slate-800 dark:text-slate-100">{formatDate(goal.startDate)}</span>
          </div>
          <div className="flex justify-between p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
            <span className="font-semibold text-slate-600 dark:text-slate-300">종료일</span>
            <span className="font-medium text-slate-800 dark:text-slate-100">{formatDate(goal.endDate)}</span>
          </div>
           <div className="flex justify-between p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
            <span className="font-semibold text-slate-600 dark:text-slate-300">생성일</span>
            <span className="font-medium text-slate-800 dark:text-slate-100">{formatDate(goal.createdAt)}</span>
          </div>
        </div>

        <div className="flex justify-end mt-6">
          <button
            onClick={onClose}
            className="w-full px-5 py-3 text-sm font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-500 transition-all duration-300 shadow-md"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};

export default GoalDetailModal;
