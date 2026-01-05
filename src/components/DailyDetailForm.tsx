import { Plus } from 'lucide-react';

interface DailyDetailFormProps {
  // Add props for handling input and button click
  // onAddItem: (itemText: string) => void;
}

const DailyDetailForm = () => {
  return (
    <div className="bg-white dark:bg-slate-800 p-4 border-t border-slate-200/50 dark:border-slate-700">
      <div className="flex gap-2">
        <input
          type="text"
          className="flex-grow px-4 py-2 bg-gray-100 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="일일 할 일 추가..."
        />
        <button className="flex-shrink-0 p-3 bg-indigo-600 text-white rounded-xl shadow-md hover:bg-indigo-500 transition-all duration-300">
          <Plus className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default DailyDetailForm;
