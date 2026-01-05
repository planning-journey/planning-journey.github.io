import React from 'react';
import Calendar from './Calendar';

interface DateSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectDate: (date: Date) => void;
  initialDate: Date | null;
}

const DateSelectorModal: React.FC<DateSelectorModalProps> = ({ isOpen, onClose, onSelectDate, initialDate }) => {
  if (!isOpen) return null;

  const handleDateSelection = (date: Date) => {
    onSelectDate(date);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-60 dark:bg-opacity-70 z-50 flex items-center justify-center"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-sm m-4 p-6 border border-gray-200 dark:border-slate-700 text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-start">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">날짜 선택</h3>
          <button onClick={onClose} className="text-gray-400 dark:text-slate-400 hover:text-gray-600 dark:hover:text-white transition-colors text-2xl leading-none">
            &times;
          </button>
        </div>
        <div className="flex justify-center -m-4">
          <Calendar
            selectionType="day"
            selectedDate={initialDate}
            onSelectDate={handleDateSelection}
            showBorder={false} // Pass showBorder prop
          />
        </div>
      </div>
    </div>
  );
};

export default DateSelectorModal;
