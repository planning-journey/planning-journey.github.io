import React from 'react';
import { X } from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={onClose}
        ></div>
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 w-64 bg-white dark:bg-slate-800 shadow-lg z-40
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0 md:static md:shadow-none md:flex md:flex-col md:border-r md:border-slate-200/50 dark:md:border-slate-700`}
      >
        <div className="p-4 flex items-center justify-between border-b border-slate-200/50 dark:border-slate-700 md:hidden">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">메뉴</h2>
          <button onClick={onClose} className="p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors duration-200">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          {/* Sidebar content goes here */}
          <div className="p-2 text-gray-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors duration-200">
            사이드바 항목 1
          </div>
          <div className="p-2 text-gray-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors duration-200">
            사이드바 항목 2
          </div>
        </nav>
      </div>
    </>
  );
};

export default Sidebar;
