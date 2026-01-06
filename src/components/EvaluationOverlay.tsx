import React, { useState, useEffect, useCallback, useRef } from 'react';
import { X, ClipboardCheck } from 'lucide-react';
import useBodyScrollLock from '../utils/useBodyScrollLock';
import EvaluationContent, { type EvaluationContentRef } from './EvaluationContent';

interface EvaluationOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: Date;
  hasEvaluation: boolean;
  selectedProjectId: string | null; // Add selectedProjectId prop
}

const EvaluationOverlay: React.FC<EvaluationOverlayProps> = ({ isOpen, onClose, selectedDate, hasEvaluation, selectedProjectId }) => {
  useBodyScrollLock(isOpen);

  const [visible, setVisible] = useState(isOpen);
  const [animated, setAnimated] = useState(isOpen);
  const [isContentEditing, setIsContentEditing] = useState(false);
  const evaluationContentRef = useRef<EvaluationContentRef>(null);

  useEffect(() => {
    if (isOpen) {
      setVisible(true);
      const timeoutId = setTimeout(() => {
        setAnimated(true);
      }, 50); // Small delay to ensure the component is mounted before starting animation
      return () => clearTimeout(timeoutId);
    } else {
      setAnimated(false);
      setIsContentEditing(false); // Reset editing state on close
      const timeoutId = setTimeout(() => {
        setVisible(false);
      }, 300); // Must match CSS transition duration
      return () => clearTimeout(timeoutId);
    }
  }, [isOpen]);

  const handleSaveClick = useCallback(async () => {
    if (evaluationContentRef.current) {
      await evaluationContentRef.current.save();
    }
    // setIsContentEditing is now handled by saveContent within EvaluationContent
    // no need to set to false here as EvaluationContent's saveContent will inform
    // parent via setIsEditing prop.
  }, []); // No dependency on saveContentFunc anymore

  // If not visible, return null to unmount
  if (!visible) {
    return null;
  }

  // Determine the height based on whether either button is present
  const footerHeight = '76px'; // height of one button + padding

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

        <div className={`p-4 overflow-y-auto h-[calc(100%-64px-${isContentEditing || !isContentEditing ? footerHeight : '0px'})]`}>
          <EvaluationContent
            ref={evaluationContentRef}
            selectedDate={selectedDate}
            setIsEditing={setIsContentEditing}
            parentIsEditing={isContentEditing} // Pass parent's editing state
            selectedProjectId={selectedProjectId} // Pass selectedProjectId
          />
        </div>

        {isContentEditing && (
          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-200/50 dark:border-slate-700 bg-white dark:bg-slate-900">
            <button
              onClick={handleSaveClick}
              className="w-full px-5 py-3 text-sm font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-500 transition-all duration-300 shadow-md"
            >
              저장
            </button>
          </div>
        )}

        {!isContentEditing && (
          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-200/50 dark:border-slate-700 bg-white dark:bg-slate-900">
            <button
              onClick={() => setIsContentEditing(true)}
              className="w-full px-5 py-3 text-sm font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-500 transition-all duration-300 shadow-md"
            >
              일일 평가 작성하기
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default EvaluationOverlay;

