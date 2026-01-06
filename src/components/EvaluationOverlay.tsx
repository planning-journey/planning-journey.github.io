import React from 'react';
import { X, ClipboardCheck } from 'lucide-react';
import EvaluationContent from './EvaluationContent'; // Assuming we'll move it here

interface EvaluationOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: Date;
  hasEvaluation: boolean;
}

const EvaluationOverlay: React.FC<EvaluationOverlayProps> = ({ isOpen, onClose, selectedDate, hasEvaluation }) => {
  return (
    <div
      className={`fixed top-0 right-0 bottom-0 w-full bg-white dark:bg-slate-900 shadow-xl z-50 transform transition-transform duration-300 max-w-sm
        ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
    >
      <div className="flex items-center justify-between p-4 border-b border-slate-200/50 dark:border-slate-700">
        <div className="flex items-center gap-2">
          <ClipboardCheck className="w-5 h-5 text-slate-500" />
          <h2 className="text-lg font-semibold text-slate-800 dark:text-white">Evaluation</h2>
          {hasEvaluation && (
            <div className="w-2 h-2 bg-red-500 rounded-full ml-1 animate-pulse"></div>
          )}
        </div>
        <button
          onClick={onClose}
          className="p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors duration-200"
        >
          <X className="w-5 h-5 text-slate-500" />
        </button>
      </div>
      <div className="p-4 overflow-y-auto h-[calc(100%-64px)]"> {/* Adjust height based on header height */}
        <EvaluationContent selectedDate={selectedDate} />
      </div>
    </div>
  );
};

export default EvaluationOverlay;
