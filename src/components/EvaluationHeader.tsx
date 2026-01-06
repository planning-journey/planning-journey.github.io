import {useState, useEffect, useRef} from 'react';
import { ChevronDown, ClipboardCheck } from 'lucide-react';
import EvaluationContent from './EvaluationContent'; // Import EvaluationContent

interface EvaluationHeaderProps {
  selectedDate: Date;
  stickyHeaderHeight: number;
  dailyDetailFormHeight: number;
  hasEvaluation: boolean;
}

const EvaluationHeader: React.FC<EvaluationHeaderProps> = ({ selectedDate, stickyHeaderHeight, dailyDetailFormHeight, hasEvaluation }) => {
  const [isOpen, setIsOpen] = useState(() => {
    const savedState = localStorage.getItem('evaluationHeaderOpen');
    return savedState !== null ? JSON.parse(savedState) : true;
  });
  const headerRef = useRef<HTMLDivElement>(null);
  const [evaluationHeaderFixedPartHeight, setEvaluationHeaderFixedPartHeight] = useState(0);

  useEffect(() => {
    localStorage.setItem('evaluationHeaderOpen', JSON.stringify(isOpen));
  }, [isOpen]);

  useEffect(() => {
    if (headerRef.current) {
      setEvaluationHeaderFixedPartHeight(headerRef.current.offsetHeight);
    }
  }, [headerRef]);

  const toggleOpen = () => {
    setIsOpen((prev: boolean) => !prev);
  };

  const availableHeight = `calc(100vh - ${stickyHeaderHeight}px - ${dailyDetailFormHeight}px - ${evaluationHeaderFixedPartHeight}px)`;

  return (
    <div className="bg-white dark:bg-slate-900/70 backdrop-blur-sm border-t border-slate-200/50 dark:border-slate-700">
      <div ref={headerRef} className="flex items-center justify-between p-4 cursor-pointer" onClick={toggleOpen}>
        <div className="flex items-center gap-2">
          <ClipboardCheck className="w-5 h-5 text-slate-500" />
          <h2 className="text-lg font-semibold text-slate-800 dark:text-white">Evaluation</h2>
          {hasEvaluation && (
            <div className="w-2 h-2 bg-red-500 rounded-full ml-1 animate-pulse"></div>
          )}
        </div>
        <button className="p-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700">
          <ChevronDown
            className={`w-5 h-5 text-slate-500 transition-transform duration-300 ${isOpen ? '' : '-rotate-90'}`}
          />
        </button>
      </div>
      {isOpen && (
        <div style={{ maxHeight: availableHeight, overflowY: 'auto' }}>
          <EvaluationContent selectedDate={selectedDate} />
        </div>
      )}
    </div>
  );
};

export default EvaluationHeader;
