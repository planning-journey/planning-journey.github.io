interface ConfirmDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const ConfirmDeleteModal = ({ isOpen, onClose, onConfirm }: ConfirmDeleteModalProps) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 dark:bg-black/70 z-50 flex items-center justify-center"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-sm m-4 p-6 border border-gray-200 dark:border-slate-700 text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">삭제 확인</h3>
        <p className="text-gray-700 dark:text-slate-300 mb-6">정말로 이 항목을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.</p>

        <div className="flex justify-center gap-4">
          <button
            onClick={onClose}
            className="px-6 py-2 text-sm font-semibold text-gray-700 dark:text-slate-300 bg-gray-200 dark:bg-slate-700 rounded-xl hover:bg-gray-300 dark:hover:bg-slate-600 transition-all duration-300"
          >
            취소
          </button>
          <button
            onClick={onConfirm}
            className="px-6 py-2 text-sm font-semibold text-white bg-red-600 rounded-xl hover:bg-red-500 transition-all duration-300 shadow-md"
          >
            삭제
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDeleteModal;
