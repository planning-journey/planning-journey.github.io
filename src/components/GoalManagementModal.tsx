interface GoalManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const GoalManagementModal = ({ isOpen, onClose }: GoalManagementModalProps) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center"
      onClick={onClose}
    >
      <div 
        className="bg-slate-800 rounded-xl shadow-2xl w-full max-w-lg m-4 p-6 border border-slate-700"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-start">
          <h2 className="text-2xl font-bold text-white mb-4">목표 관리</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">&times;</button>
        </div>
        <div className="h-64 overflow-y-auto pr-2 mb-6">
            {/* Placeholder for goal list */}
            <div className="flex flex-col gap-3">
                <div className="p-4 bg-slate-700 rounded-lg text-slate-300">첫 번째 목표 예시</div>
                <div className="p-4 bg-slate-700 rounded-lg text-slate-300">두 번째 목표 예시</div>
            </div>
        </div>
        <div className="flex justify-end">
          <button className="px-5 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-500 transition-all duration-300 shadow-md">
            신규 목표 추가
          </button>
        </div>
      </div>
    </div>
  );
};

export default GoalManagementModal;
