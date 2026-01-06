// src/components/InlineCalendar.tsx
import React, { useState, useRef, useEffect, useCallback, useLayoutEffect, useMemo } from 'react';
import { type Goal, type Task, type DailyEvaluation } from '../db'; // Import types

interface InlineCalendarProps {
  onDateSelect: (date: Date) => void;
  onViewChange: (date: Date) => void; // New prop for reporting current view date
  selectedDateProp: Date;
  currentViewDateProp: Date; // New prop for the calendar's currently viewed date (from App.tsx)
  todayScrollTrigger: number;
  allGoals: Goal[];
  allTasks: Task[];
  allDailyEvaluations: DailyEvaluation[];
}

const DAY_WIDTH = 64; // Corresponds to Tailwind 'w-14' (56px) + 'mx-1' (2 * 4px) = 64px
const BUFFER_DAYS = 30; // Number of extra days to render on each side of the viewport

const isSameDay = (d1: Date, d2: Date) => {
  return d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate();
};

// Helper function to check if two dates are in the same month and year
const isSameMonthYear = (d1: Date, d2: Date) => {
  return d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth();
};

// Helper function to format date to YYYY-MM-DD
const formatDateToYYYYMMDD = (date: Date): string => {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
};


const InlineCalendar: React.FC<InlineCalendarProps> = ({ onDateSelect, onViewChange, selectedDateProp, currentViewDateProp, todayScrollTrigger, allGoals, allTasks, allDailyEvaluations }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // State to hold dates currently visible + buffer
  const [renderedDates, setRenderedDates] = useState<Date[]>([]);
  const [transformOffset, setTransformOffset] = useState(0);

  const lastScrolledSelectedDateRef = useRef<Date | null>(null); // To track the last selectedDateProp that caused a scroll
  const lastScrolledViewDateRef = useRef<Date | null>(null);

  // Conceptual total range of dates
  const START_YEAR = 1900;
  const END_YEAR = 2100;
  const startVirtualDate = useMemo(() => new Date(START_YEAR, 0, 1), []);
  const endVirtualDate = useMemo(() => new Date(END_YEAR, 11, 31), []);

  // Calculate total number of days in the virtual range
  const totalDays = useMemo(() => {
    const diffTime = Math.abs(endVirtualDate.getTime() - startVirtualDate.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) +1;
  }, [startVirtualDate, endVirtualDate]);

  // Total virtual scroll width
  const totalScrollWidth = useMemo(() => totalDays * DAY_WIDTH, [totalDays]);

  // Calculate visible dates based on scroll position
  const calculateVisibleDates = useCallback(() => {
    if (!scrollRef.current) return;

    const { scrollLeft, clientWidth } = scrollRef.current;

    let firstVisibleIndex = Math.floor(scrollLeft / DAY_WIDTH);
    let lastVisibleIndex = Math.ceil((scrollLeft + clientWidth) / DAY_WIDTH);

    firstVisibleIndex = Math.max(0, firstVisibleIndex - BUFFER_DAYS);
    lastVisibleIndex = Math.min(totalDays - 1, lastVisibleIndex + BUFFER_DAYS);

    const newRenderedDates: Date[] = [];
    for (let i = firstVisibleIndex; i <= lastVisibleIndex; i++) {
      const date = new Date(startVirtualDate);
      date.setDate(startVirtualDate.getDate() + i);
      newRenderedDates.push(date);
    }
    setRenderedDates(newRenderedDates);
    setTransformOffset(firstVisibleIndex * DAY_WIDTH);

    const centerScrollPosition = scrollLeft + clientWidth / 2;
    const centerDateGlobalIndex = Math.floor(centerScrollPosition / DAY_WIDTH);
    const centerDate = new Date(startVirtualDate);
    centerDate.setDate(startVirtualDate.getDate() + centerDateGlobalIndex);

    // Report the center date of the view
    onViewChange(centerDate);

  }, [startVirtualDate, totalDays, onViewChange]);


  // Scroll to a specific date (e.g., today or selected date)
  const scrollToDate = useCallback((date: Date, behavior: ScrollBehavior = 'smooth') => {
    if (scrollRef.current) {
      // Normalize the target date to midnight to ensure accurate diffDays calculation
      const normalizedTargetDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      const normalizedStartDate = new Date(startVirtualDate.getFullYear(), startVirtualDate.getMonth(), startVirtualDate.getDate());

      const targetTime = normalizedTargetDate.getTime();
      const startTime = normalizedStartDate.getTime();
      const diffDays = Math.round(Math.abs(targetTime - startTime) / (1000 * 60 * 60 * 24));

      const scrollPosition = diffDays * DAY_WIDTH - (scrollRef.current.clientWidth / 2) + (DAY_WIDTH / 2);

      scrollRef.current.scrollTo({
        left: scrollPosition,
        behavior: behavior
      });
    }
  }, [startVirtualDate]);


  // Effect to scroll to selectedDateProp when it changes (user clicks a date or 'Today')
  useEffect(() => {
    // Only scroll if selectedDateProp has genuinely changed its date value
    if (!lastScrolledSelectedDateRef.current || !isSameDay(selectedDateProp, lastScrolledSelectedDateRef.current)) {
      scrollToDate(selectedDateProp, 'auto');
      lastScrolledSelectedDateRef.current = selectedDateProp;
    }
  }, [selectedDateProp, scrollToDate]);

  // Effect to scroll to today when todayScrollTrigger changes
  useEffect(() => {
    if (todayScrollTrigger > 0) {
      scrollToDate(new Date(), 'smooth');
    }
  }, [todayScrollTrigger, scrollToDate]);


  // Effect to scroll to currentViewDateProp when it changes (from parent)
  useEffect(() => {
    // Only scroll if currentViewDateProp has genuinely changed its month/year value
    // and it's different from the last time we scrolled due to currentViewDateProp
    if (!lastScrolledViewDateRef.current || !isSameMonthYear(currentViewDateProp, lastScrolledViewDateRef.current)) {
      scrollToDate(currentViewDateProp, 'auto');
      lastScrolledViewDateRef.current = currentViewDateProp;
    }
  }, [currentViewDateProp, scrollToDate]);


  // Handle scroll event
  const handleScroll = useCallback(() => {
    calculateVisibleDates();
  }, [calculateVisibleDates]);


  // Effect to attach/detach scroll listener
  useEffect(() => {
    const currentScrollRef = scrollRef.current;
    if (currentScrollRef) {
      currentScrollRef.addEventListener('scroll', handleScroll);
      return () => {
        currentScrollRef.removeEventListener('scroll', handleScroll);
      };
    }
  }, [handleScroll]);

  // Initial calculation of visible dates on mount
  useEffect(() => {
    calculateVisibleDates();
  }, [calculateVisibleDates]);


  // Initial scroll on mount: to selectedDateProp if available, else today
  useLayoutEffect(() => {
    if (scrollRef.current && totalDays > 0) {
      // On initial load, scroll to selectedDateProp, or today if no selected date
      scrollToDate(selectedDateProp || new Date(), 'auto');
      lastScrolledSelectedDateRef.current = selectedDateProp || new Date(); // Initialize ref on mount
    }
  }, [totalDays, scrollToDate, selectedDateProp]);


  const handleDateClick = (date: Date) => {
    onDateSelect(date);
  };

  return (
    <div className="w-full bg-white dark:bg-gray-900 dark:border-slate-700">
      <div
        ref={scrollRef}
        className="flex overflow-x-auto custom-scrollbar-hide pb-2 px-2 relative"
        style={{ height: 'calc(1rem + 0.5rem + 1rem + 1.5rem + 1rem + 1rem)' }}
      >
        <div
          ref={contentRef}
          style={{
            width: totalScrollWidth,
            transform: `translateX(${transformOffset}px)`,
            position: 'absolute',
            left: 0,
            top: 0,
            height: '100%',
            display: 'flex',
            willChange: 'transform'
          }}
        >
          {renderedDates.map((date) => {
            const formattedDate = formatDateToYYYYMMDD(date);

            // Check for tasks
            const hasTasks = allTasks.some(task => task.date === formattedDate);

            // Check for evaluations
            const hasEvaluation = allDailyEvaluations.some(
              evaluation => evaluation.date === formattedDate && evaluation.evaluationText && evaluation.evaluationText.trim().length > 0
            );

            // Check for goals ending on this date
            const hasEndingGoals = allGoals.some(goal => {
              // Normalize goal.endDate to compare only date part
              const normalizedGoalEndDate = new Date(goal.endDate.getFullYear(), goal.endDate.getMonth(), goal.endDate.getDate());
              return isSameDay(normalizedGoalEndDate, date);
            });

            return (
              <div
                key={date.toISOString()}
                className={`flex-none w-14 text-center select-none cursor-pointer relative py-2 rounded-xl
                  ${isSameDay(date, new Date()) ? 'font-bold text-indigo-600 dark:text-indigo-400' : 'text-gray-700 dark:text-gray-300'}
                  ${isSameDay(date, selectedDateProp) ? 'bg-indigo-100 dark:bg-indigo-900' : ''}
                  hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200 p-1 mx-1
                `}
                onClick={() => handleDateClick(date)}
              >
                <div className="text-xs text-slate-500 dark:text-slate-400 h-4">
                  {date.getDate() === 1 && (
                    <span>{new Intl.DateTimeFormat('ko-KR', { month: 'numeric' }).format(date)}</span>
                  )}
                </div>
                <div className="text-xs mt-2">{new Intl.DateTimeFormat('ko-KR', { weekday: 'short' }).format(date)}</div>
                <div>{date.getDate()}</div>
                <div className="flex items-center justify-center gap-1 h-4 flex-none">
                  {hasTasks ? <span className="w-1.5 h-1.5 bg-blue-400 rounded-full"></span> : <span className="w-1.5 h-1.5 bg-slate-200/75 dark:bg-slate-700 rounded-full"></span>}
                  {hasEvaluation ? <span className="w-1.5 h-1.5 bg-green-400 rounded-full"></span> : <span className="w-1.5 h-1.5 bg-slate-200/75 dark:bg-slate-700 rounded-full"></span>}
                  {hasEndingGoals ? <span className="w-1.5 h-1.5 bg-red-400 rounded-full"></span> : <span className="w-1.5 h-1.5 bg-slate-200/75 dark:bg-slate-700 rounded-full"></span>}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default InlineCalendar;
