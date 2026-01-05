import { useState, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

const EvaluationHeader = () => {
  const [isOpen, setIsOpen] = useState(() => {
    const savedState = localStorage.getItem('evaluationHeaderOpen');
    return savedState !== null ? JSON.parse(savedState) : true;
  });

  useEffect(() => {
    localStorage.setItem('evaluationHeaderOpen', JSON.stringify(isOpen));
  }, [isOpen]);

  const toggleOpen = () => {
    setIsOpen((prev: boolean) => !prev);
  };

  return (
    <div className="bg-white dark:bg-slate-900/70 backdrop-blur-sm border-t border-slate-200/50 dark:border-slate-700">
      <div className="flex items-center justify-between p-4 cursor-pointer" onClick={toggleOpen}>
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold text-slate-800 dark:text-white">Evaluation</h2>
        </div>
        <button className="p-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700">
          <ChevronDown
            className={`w-5 h-5 text-slate-500 transition-transform duration-300 ${isOpen ? '' : '-rotate-90'}`}
          />
        </button>
      </div>
      {/* {isOpen && <EvaluationContent />} */} {/* Toggle state is not implemented yet */}
    </div>
  );
};

export default EvaluationHeader;
