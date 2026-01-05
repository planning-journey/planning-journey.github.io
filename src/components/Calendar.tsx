import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react'; // For navigation icons

interface CalendarProps {
  selectionType: 'day' | 'week' | 'range';
  selectedDate?: Date | null; // For 'day' or 'week' selection
  startDate?: Date | null; // For 'range' selection
  endDate?: Date | null; // For 'range' selection
  onSelectDate: (date: Date) => void; // Callback for 'day' or 'week' selection
  onSelectRange: (start: Date | null, end: Date | null) => void; // Callback for 'range' selection
}

// Helper functions (re-implementing date-fns functionality using native Date methods)
const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay(); // 0 for Sunday, 1 for Monday
const isSameDay = (date1: Date | null, date2: Date | null) => {
  if (!date1 || !date2) return false;
  return date1.getFullYear() === date2.getFullYear() &&
         date1.getMonth() === date2.getMonth() &&
         date1.getDate() === date2.getDate();
};
const isSameWeek = (date1: Date | null, date2: Date | null, weekStartsOn: 0 | 1 = 0) => {
  if (!date1 || !date2) return false;
  const startOfWeek1 = getStartOfWeek(date1, weekStartsOn);
  const startOfWeek2 = getStartOfWeek(date2, weekStartsOn);
  return isSameDay(startOfWeek1, startOfWeek2);
};
const isBetween = (date: Date | null, start: Date | null, end: Date | null) => {
  if (!date || !start || !end) return false;
  const normalizedDate = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
  const normalizedStart = new Date(start.getFullYear(), start.getMonth(), start.getDate()).getTime();
  const normalizedEnd = new Date(end.getFullYear(), end.getMonth(), end.getDate()).getTime();
  return normalizedDate >= normalizedStart && normalizedDate <= normalizedEnd;
};

const getStartOfWeek = (date: Date, weekStartsOn: 0 | 1 = 0) => { // weekStartsOn: 0=Sunday, 1=Monday
  const day = date.getDay(); // 0 for Sunday, 1 for Monday, etc.
  const diff = (day < weekStartsOn ? 7 : 0) + day - weekStartsOn;
  const start = new Date(date);
  start.setDate(date.getDate() - diff);
  start.setHours(0, 0, 0, 0); // Normalize to start of day
  return start;
};
const getEndOfWeek = (date: Date, weekStartsOn: 0 | 1 = 0) => {
  const start = getStartOfWeek(date, weekStartsOn);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999); // Normalize to end of day
  return end;
};


const Calendar = ({
  selectionType,
  selectedDate,
  startDate,
  endDate,
  onSelectDate,
  onSelectRange,
}: CalendarProps) => {
  const [currentMonth, setCurrentMonth] = useState(startDate || new Date()); // Represents the month being viewed
  const today = new Date();

  // Handle month/year navigation
  const goToPreviousMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };
  const goToNextMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  // Generate days for the current month view
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth(); // 0-indexed
  const numDays = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month); // 0=Sunday, 1=Monday

  // Create an array of day numbers, including leading/trailing empty cells
  const days: (number | null)[] = Array(firstDay === 0 ? 6 : firstDay - 1).fill(null); // Adjust for Monday start
  for (let i = 1; i <= numDays; i++) {
    days.push(i);
  }
  
  // Handle day click
  const handleDayClick = (dayNum: number | null) => {
    if (dayNum === null) return;
    const clickedDate = new Date(year, month, dayNum);
    
    if (selectionType === 'day' || selectionType === 'week') {
      onSelectDate(clickedDate);
    } else if (selectionType === 'range') {
      if (!startDate || (startDate && endDate)) {
        // Start a new range or reset if range already selected
        onSelectRange(clickedDate, null);
      } else if (startDate && !endDate) {
        // Select end date
        if (clickedDate.getTime() < startDate.getTime()) {
          onSelectRange(clickedDate, startDate); // Swap if end date is before start date
        } else {
          onSelectRange(startDate, clickedDate);
        }
      }
    }
  };

  const dayNames = ['월', '화', '수', '목', '금', '토', '일'];

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-4 w-full max-w-sm border border-gray-200 dark:border-slate-700">
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-4">
        <button type="button" onClick={goToPreviousMonth} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors">
          <ChevronLeft className="w-5 h-5 text-gray-700 dark:text-slate-300" />
        </button>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          {year}년 {month + 1}월
        </h3>
        <button type="button" onClick={goToNextMonth} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors">
          <ChevronRight className="w-5 h-5 text-gray-700 dark:text-slate-300" />
        </button>
      </div>

      {/* Weekday Names */}
      <div className="grid grid-cols-7 gap-1 text-center text-sm font-medium text-gray-500 dark:text-slate-400 mb-2">
        {dayNames.map(day => (
          <div key={day}>{day}</div>
        ))}
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((dayNum, index) => {
          const date = dayNum ? new Date(year, month, dayNum) : null;
          const isCurrentMonth = date && date.getMonth() === month;
          const isToday = date && isSameDay(date, today);
          
          let isSelected = false;
          let isInRange = false; // For range selection: all days between start and end
          let isRangeStart = false; // For range selection: the start date
          let isRangeEnd = false;   // For range selection: the end date

          if (date) {
            if (selectionType === 'day' && selectedDate) {
              isSelected = isSameDay(date, selectedDate);
            } else if (selectionType === 'week' && selectedDate) {
              const weekStart = getStartOfWeek(selectedDate, 1); // Monday
              const weekEnd = getEndOfWeek(selectedDate, 1); // Sunday
              isInRange = isBetween(date, weekStart, weekEnd); // All days in the week
              // isSelected is true if it's within the selected week, effectively highlighting the whole week
              isSelected = isInRange;
            } else if (selectionType === 'range' && startDate && endDate) {
              isRangeStart = isSameDay(date, startDate);
              isRangeEnd = isSameDay(date, endDate);
              isInRange = isBetween(date, startDate, endDate);
            } else if (selectionType === 'range' && startDate && !endDate) {
              isSelected = isSameDay(date, startDate); // Highlight only start date when end is not yet selected
            }
          }

          const dayClasses: string[] = [];

          dayClasses.push('relative flex items-center justify-center h-8 w-8 text-sm transition-all duration-200');

          if (isCurrentMonth) {
            dayClasses.push('text-gray-900 dark:text-white');
          } else {
            dayClasses.push('text-gray-400 dark:text-slate-600');
          }

          if (selectionType === 'range' && startDate && endDate && isSameDay(startDate, endDate)) { // Single day range
            dayClasses.push('bg-indigo-600 dark:bg-indigo-500 text-white rounded-full');
          } else if (selectionType === 'range' && isRangeStart) {
            dayClasses.push('bg-indigo-600 dark:bg-indigo-500 text-white rounded-l-full');
          } else if (selectionType === 'range' && isRangeEnd) {
            dayClasses.push('bg-indigo-600 dark:bg-indigo-500 text-white rounded-r-full');
          } else if (selectionType === 'range' && isInRange) {
            dayClasses.push('bg-indigo-200 dark:bg-indigo-700 text-indigo-800 dark:text-indigo-100 rounded-none');
          } else if (isSelected) { // Single day or week selection
            dayClasses.push('bg-indigo-600 dark:bg-indigo-500 text-white rounded-full');
          } else {
            // Default hover state if not selected/ranged
            dayClasses.push('hover:bg-gray-100 dark:hover:bg-slate-700');
          }

          if (isToday && (!isSelected && !isInRange && !isRangeStart && !isRangeEnd)) {
            dayClasses.push('border border-indigo-500');
          }
          
          const finalDayClasses = dayClasses.join(' ');

          return (
            <button
              type="button"
              key={index}
              onClick={() => handleDayClick(dayNum)}
              disabled={!dayNum}
              className={finalDayClasses}
            >
              {dayNum}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default Calendar;