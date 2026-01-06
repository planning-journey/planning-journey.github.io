import {Flag, Calendar, ChevronRight} from 'lucide-react'; // Import Calendar and Menu icons
import InlineCalendar from './InlineCalendar'; // Import InlineCalendar
import { type Goal, type Task, type DailyEvaluation } from '../db'; // Import types

interface HeaderProps {
  onOpenModal: () => void;
  onDateSelect: (date: Date) => void;
  currentCalendarViewDate: Date; // New prop for the calendar's currently viewed date
  onCalendarViewChange: (date: Date) => void; // Prop to pass to InlineCalendar for view changes
  onSelectToday: () => void;
  selectedDate: Date; // Prop from App.tsx representing the user's selected day
  todayScrollTrigger: number;
  allGoals: Goal[];
  allTasks: Task[];
  allDailyEvaluations: DailyEvaluation[];
  onToggleSidebar: () => void; // New prop for toggling the sidebar
  selectedProjectName: string | null; // Add selectedProjectName prop
  selectedProjectId: string | null; // Add selectedProjectId prop
}

const Header = ({ onOpenModal, onDateSelect, currentCalendarViewDate, onCalendarViewChange, onSelectToday, selectedDate, todayScrollTrigger, allGoals, allTasks, allDailyEvaluations, onToggleSidebar, selectedProjectName, selectedProjectId }: HeaderProps) => {
  const formattedMonthYear = new Intl.DateTimeFormat('ko-KR', { year: 'numeric', month: 'long' }).format(currentCalendarViewDate);

  return (
    <header className="flex flex-col border-b border-slate-200/50 dark:border-slate-700 bg-white dark:bg-gray-900 pb-2">
      <div className="flex items-center justify-between py-4 pr-4 md:pl-4">
        <div className="flex items-center gap-2"> {/* Added flex container for hamburger and title */}
          <button
            onClick={onToggleSidebar}
            className="p-2 rounded-r-2xl bg-slate-100 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-300 md:hidden"
          >
            <ChevronRight className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
          <div className="flex flex-col">
            {selectedProjectName && (
              <h2 className="text-xs font-semibold tracking-wide text-gray-500 dark:text-gray-400">{selectedProjectName}</h2>
            )}
            <div className="flex items-center">
              <div className="text-lg font-bold text-gray-900 dark:text-white">
                {formattedMonthYear}
              </div>
              <button
                onClick={onSelectToday}
                className="ml-2 p-1 rounded-full text-sm text-indigo-600 dark:text-indigo-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-300 flex items-center gap-1"
              >
                <Calendar className="w-4 h-4" /> Today
              </button>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4 relative">
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
        allGoals={allGoals}
        allTasks={allTasks}
        allDailyEvaluations={allDailyEvaluations}
        selectedProjectId={selectedProjectId}
      />
    </header>
  );
};

export default Header;
