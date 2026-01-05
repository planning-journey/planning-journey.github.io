import { useState, useRef, useEffect } from 'react';
import { Settings, Flag, Sun, Moon, Monitor, Check, Calendar } from 'lucide-react'; // Import Calendar icon
import { useTheme } from '../contexts/ThemeContext'; // Import useTheme hook
import InlineCalendar from './InlineCalendar'; // Import InlineCalendar

interface HeaderProps {
  onOpenModal: () => void;
  onDateSelect: (date: Date) => void;
  currentCalendarViewDate: Date; // New prop for the calendar's currently viewed date
  onCalendarViewChange: (date: Date) => void; // Prop to pass to InlineCalendar for view changes
  onSelectToday: () => void;
  selectedDate: Date; // Prop from App.tsx representing the user's selected day
  todayScrollTrigger: number;
}

const Header = ({ onOpenModal, onDateSelect, currentCalendarViewDate, onCalendarViewChange, onSelectToday, selectedDate, todayScrollTrigger }: HeaderProps) => {
  const [isSettingsMenuOpen, setSettingsMenuOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const settingsButtonRef = useRef<HTMLButtonElement>(null);
  const settingsMenuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        settingsMenuRef.current &&
        !settingsMenuRef.current.contains(event.target as Node) &&
        settingsButtonRef.current &&
        !settingsButtonRef.current.contains(event.target as Node)
      ) {
        setSettingsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleThemeChange = (selectedTheme: 'light' | 'dark' | 'system') => {
    setTheme(selectedTheme);
    setSettingsMenuOpen(false);
  };

  const formattedMonthYear = new Intl.DateTimeFormat('ko-KR', { year: 'numeric', month: 'long' }).format(currentCalendarViewDate);

  return (
    <header className="flex flex-col border-b border-slate-200/50 dark:border-slate-700 bg-white dark:bg-gray-900">
      <div className="flex items-center justify-between p-4">
        <div className="flex flex-col">
          <h1 className="text-xs font-semibold tracking-wide text-gray-500 dark:text-gray-400 mb-1">PLANNING JOURNEY</h1>
          <div className="flex items-center">
            <div className="text-xl font-bold text-gray-900 dark:text-white">
              {formattedMonthYear}
            </div>
            <button
              onClick={onSelectToday}
              className="ml-2 p-1 rounded-full text-indigo-600 dark:text-indigo-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-300 flex items-center gap-1"
            >
              <Calendar className="w-5 h-5" /> Today
            </button>
          </div>
        </div>
        <div className="flex items-center gap-4 relative">
          {/* Settings Button */}
          <button
            ref={settingsButtonRef}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-300 relative z-20"
            onClick={() => setSettingsMenuOpen(!isSettingsMenuOpen)}
          >
            <Settings className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>

          {/* Settings Context Menu */}
          {isSettingsMenuOpen && (
            <div
              ref={settingsMenuRef}
              className="absolute top-full right-0 mt-2 w-40 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 z-30 overflow-hidden"
            >
              <button
                className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                onClick={() => handleThemeChange('light')}
              >
                <Sun className="w-4 h-4" />
                <span>Light</span>
                {theme === 'light' && <Check className="ml-auto w-4 h-4 text-indigo-400" />}
              </button>
              <button
                className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                onClick={() => handleThemeChange('dark')}
              >
                <Moon className="w-4 h-4" />
                <span>Dark</span>
                {theme === 'dark' && <Check className="ml-auto w-4 h-4 text-indigo-400" />}
              </button>
              <button
                className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                onClick={() => handleThemeChange('system')}
              >
                <Monitor className="w-4 h-4" />
                <span>System</span>
                {theme === 'system' && <Check className="ml-auto w-4 h-4 text-indigo-400" />}
              </button>
            </div>
          )}

          {/* Goal Management Button */}
          <button
            onClick={onOpenModal}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-500 transition-all duration-300 shadow-md relative z-10"
          >
            <Flag className="w-4 h-4" />
            <span>목표 관리</span>
          </button>
        </div>
      </div>
      <InlineCalendar 
        onDateSelect={onDateSelect} 
        onViewChange={onCalendarViewChange}
        selectedDateProp={selectedDate} 
        currentViewDateProp={currentCalendarViewDate} // Pass currentCalendarViewDate to InlineCalendar
        todayScrollTrigger={todayScrollTrigger} 
      />
    </header>
  );
};

export default Header;