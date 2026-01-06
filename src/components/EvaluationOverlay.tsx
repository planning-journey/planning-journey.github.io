import React, { useState, useEffect } from 'react';
import { X, ClipboardCheck } from 'lucide-react';
import useBodyScrollLock from '../utils/useBodyScrollLock';
import EvaluationContent from './EvaluationContent'; // Assuming we'll move it here

interface EvaluationOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: Date;
  hasEvaluation: boolean;
}

const EvaluationOverlay: React.FC<EvaluationOverlayProps> = ({ isOpen, onClose, selectedDate, hasEvaluation }) => {

  useBodyScrollLock(isOpen);

  const [visible, setVisible] = useState(isOpen);
  const [animated, setAnimated] = useState(isOpen);

  useEffect(() => {
    if (isOpen) {
      setVisible(true);
      const timeoutId = setTimeout(() => {
        setAnimated(true);
      }, 50); // Small delay to ensure the component is mounted before starting animation
      return () => clearTimeout(timeoutId);
    } else {
      setAnimated(false);
      const timeoutId = setTimeout(() => {
        setVisible(false);
      }, 300); // Must match CSS transition duration
      return () => clearTimeout(timeoutId);
    }
  }, [isOpen]);

  // If not visible, return null to unmount
  if (!visible) {
    return null;
  }

  return (
    <div
      className={`fixed inset-0 z-50 flex justify-end transition-opacity duration-300 ${animated ? 'opacity-100' : 'opacity-0'}`}
      onClick={onClose}
    >
      <div
        className={`relative w-full max-w-md bg-white dark:bg-slate-900 shadow-xl transform transition-transform duration-300 ${animated ? 'translate-x-0' : 'translate-x-full'}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-slate-200/50 dark:border-slate-700">

          <div className="flex items-center gap-2">

            <ClipboardCheck className="w-5 h-5 text-slate-500" />

            <h2 className="text-lg font-semibold text-slate-800 dark:text-white">Evaluation</h2>

            {hasEvaluation && (

              <div className="w-2 h-2 bg-green-400 rounded-full ml-1"></div>

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

    </div>

  );

};

export default EvaluationOverlay;
