// src/components/InlineCalendar.tsx
import React, { useState, useRef, useEffect, useCallback, useLayoutEffect, useMemo } from 'react';

interface InlineCalendarProps {
  onDateSelect: (date: Date) => void;
  onViewChange: (date: Date) => void; // New prop for reporting current view date
  selectedDateProp: Date;
  todayScrollTrigger: number;
}

const DAY_WIDTH = 64; // Corresponds to Tailwind 'w-14' (56px) + 'mx-1' (2 * 4px) = 64px
const BUFFER_DAYS = 30; // Number of extra days to render on each side of the viewport

const getDaysInMonth = (year: number, month: number): number => {
  return new Date(year, month + 1, 0).getDate();
};

const isSameDay = (d1: Date, d2: Date) => {
  return d1.getFullYear() === d2.getFullYear() &&
         d1.getMonth() === d2.getMonth() &&
         d1.getDate() === d2.getDate();
};


const InlineCalendar: React.FC<InlineCalendarProps> = ({ onDateSelect, onViewChange, selectedDateProp, todayScrollTrigger }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

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
      const targetTime = date.getTime();
      const startTime = startVirtualDate.getTime();
      const diffDays = Math.round(Math.abs(targetTime - startTime) / (1000 * 60 * 60 * 24));

      const scrollPosition = diffDays * DAY_WIDTH - (scrollRef.current.clientWidth / 2) + (DAY_WIDTH / 2);

      scrollRef.current.scrollTo({
        left: scrollPosition,
        behavior: behavior
      });
    }
  }, [startVirtualDate, calculateVisibleDates]);


  // Effect to scroll to selectedDateProp when it changes (user clicks a date or 'Today')
  useEffect(() => {
    scrollToDate(selectedDateProp);
  }, [selectedDateProp, scrollToDate]);
  
  // Effect to scroll to today when todayScrollTrigger changes
  useEffect(() => {
    if (todayScrollTrigger > 0) {
      scrollToDate(new Date(), 'smooth');
    }
  }, [todayScrollTrigger, scrollToDate]);


  // State to hold dates currently visible + buffer
  const [renderedDates, setRenderedDates] = useState<Date[]>([]);
  const [transformOffset, setTransformOffset] = useState(0);


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
      scrollToDate(selectedDateProp || new Date(), 'auto'); // Scroll instantly on initial load
    }
  }, [totalDays, scrollToDate, selectedDateProp]);


  const handleDateClick = (date: Date) => {
    onDateSelect(date);
  };

  return (
    <div className="w-full bg-white dark:bg-gray-900 border-b border-slate-200/50 dark:border-slate-700">
      <div
        ref={scrollRef}
        className="flex overflow-x-auto custom-scrollbar-hide pb-2 px-2 relative"
        style={{ height: '70px' }}
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
          {renderedDates.map((date) => (
            <div
              key={date.toISOString()}
              className={`flex-none w-14 text-center cursor-pointer
                ${isSameDay(date, new Date()) ? 'font-bold text-indigo-600 dark:text-indigo-400' : 'text-gray-700 dark:text-gray-300'}
                ${isSameDay(date, selectedDateProp) ? 'bg-indigo-100 dark:bg-indigo-900 rounded-lg' : ''}
                hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200 p-1 mx-1
              `}
              onClick={() => handleDateClick(date)}
            >
              <div className="text-xs">{new Intl.DateTimeFormat('ko-KR', { weekday: 'short' }).format(date)}</div>
              <div className="text-lg leading-none">{date.getDate()}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default InlineCalendar;