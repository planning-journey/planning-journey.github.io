import { Goal, ChevronDown } from 'lucide-react';
import { useState } from 'react';

const OngoingGoalsHeader = () => {
  const [isOpen, setIsOpen] = useState(true);

  const toggleOpen = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="bg-white dark:bg-slate-900/70 backdrop-blur-sm border-b border-slate-200/50">
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-2">
          <Goal className="w-5 h-5 text-slate-500" />
          <h2 className="text-lg font-semibold text-slate-800 dark:text-white">Ongoing Goals</h2>
        </div>
        <button onClick={toggleOpen} className="p-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700">
          <ChevronDown
            className={`w-5 h-5 text-slate-500 transition-transform duration-300 ${isOpen ? '' : '-rotate-90'}`}
          />
        </button>
      </div>
    </div>
  );
};

export default OngoingGoalsHeader;
