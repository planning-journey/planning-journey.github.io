// src/components/InlineCalendar.tsx
import React, { useState, useRef, useEffect, useCallback, useLayoutEffect, useMemo } from 'react';

interface InlineCalendarProps {
  onDateSelect: (date: Date) => void;
}

const DAY_WIDTH = 56; // Corresponds to Tailwind 'w-14' (14 * 4 = 56px)
const BUFFER_DAYS = 30; // Number of extra days to render on each side of the viewport

// Helper function to get the number of days in a month - not directly used in this virtualized version, but good to keep
const getDaysInMonth = (year: number, month: number): number => {
  return new Date(year, month + 1, 0).getDate();
};

const InlineCalendar: React.FC<InlineCalendarProps> = ({ onDateSelect }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null); // Ref for the virtualized content container

  const [currentMonthYear, setCurrentMonthYear] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  
  // Conceptual total range of dates
  const START_YEAR = 1900;
  const END_YEAR = 2100;
  const startVirtualDate = useMemo(() => new Date(START_YEAR, 0, 1), []);
  const endVirtualDate = useMemo(() => new Date(END_YEAR, 11, 31), []);
  
  // Calculate total number of days in the virtual range
  const totalDays = useMemo(() => {
    const diffTime = Math.abs(endVirtualDate.getTime() - startVirtualDate.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) +1; // +1 to include both start and end days
  }, [startVirtualDate, endVirtualDate]);

  // Total virtual scroll width
  const totalScrollWidth = useMemo(() => totalDays * DAY_WIDTH, [totalDays]);

  // State to hold dates currently visible + buffer
  const [renderedDates, setRenderedDates] = useState<Date[]>([]);
  const [transformOffset, setTransformOffset] = useState(0); // For positioning the rendered block

  // Calculate visible dates based on scroll position
  const calculateVisibleDates = useCallback(() => {
    if (!scrollRef.current) return;

    const { scrollLeft, clientWidth } = scrollRef.current;

    // Calculate the start and end index of dates that *could* be visible
    let firstVisibleIndex = Math.floor(scrollLeft / DAY_WIDTH);
    let lastVisibleIndex = Math.ceil((scrollLeft + clientWidth) / DAY_WIDTH);

    // Apply buffer
    firstVisibleIndex = Math.max(0, firstVisibleIndex - BUFFER_DAYS);
    lastVisibleIndex = Math.min(totalDays - 1, lastVisibleIndex + BUFFER_DAYS);

    const newRenderedDates: Date[] = [];
    for (let i = firstVisibleIndex; i <= lastVisibleIndex; i++) {
      const date = new Date(startVirtualDate);
      date.setDate(startVirtualDate.getDate() + i); // Add 'i' days to the startVirtualDate
      newRenderedDates.push(date);
    }
    setRenderedDates(newRenderedDates);
    setTransformOffset(firstVisibleIndex * DAY_WIDTH);

    // Update current month/year display from the center of the viewport
    const centerScrollPosition = scrollLeft + clientWidth / 2;
    const centerDateGlobalIndex = Math.floor(centerScrollPosition / DAY_WIDTH);
    const centerDate = new Date(startVirtualDate);
    centerDate.setDate(startVirtualDate.getDate() + centerDateGlobalIndex);

    setCurrentMonthYear(
      new Intl.DateTimeFormat('ko-KR', { year: 'numeric', month: 'long' }).format(centerDate)
    );

  }, [startVirtualDate, totalDays]);

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
      // After scrolling, recalculate visible dates
      requestAnimationFrame(() => calculateVisibleDates());
    }
  }, [startVirtualDate, calculateVisibleDates]);


  // Initial scroll to today's date after initial render
  useLayoutEffect(() => {
    if (scrollRef.current && totalDays > 0) {
      scrollToDate(new Date(), 'auto'); // Scroll instantly on initial load
    }
  }, [totalDays, scrollToDate]);


  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    onDateSelect(date);
    scrollToDate(date);
  };

  const isSameDay = (d1: Date, d2: Date) => {
    return d1.getFullYear() === d2.getFullYear() &&
           d1.getMonth() === d2.getMonth() &&
           d1.getDate() === d2.getDate();
  };

  return (
    <div className="w-full bg-white dark:bg-gray-900 border-b border-slate-200/50 dark:border-slate-700">
      <div className="py-2 px-4 text-center text-sm font-semibold text-gray-800 dark:text-gray-100">
        {currentMonthYear}
      </div>
      <div
        ref={scrollRef}
        className="flex overflow-x-auto custom-scrollbar-hide pb-2 px-2 relative" // Removed snap-x, snap-mandatory
        style={{ height: '70px' }} // Fixed height for calendar
      >
        <div 
          ref={contentRef}
          style={{ 
            width: totalScrollWidth, // Virtual width for the entire scrollable area
            transform: `translateX(${transformOffset}px)`, // Position the visible block
            position: 'absolute',
            left: 0,
            top: 0,
            height: '100%',
            display: 'flex',
            willChange: 'transform' // Optimize for transform changes
          }}
        >
          {renderedDates.map((date) => (
            <div
              key={date.toISOString()}
              className={`flex-none w-14 text-center cursor-pointer
                ${isSameDay(date, new Date()) ? 'font-bold text-indigo-600 dark:text-indigo-400' : 'text-gray-700 dark:text-gray-300'}
                ${isSameDay(date, selectedDate) ? 'bg-indigo-100 dark:bg-indigo-900 rounded-lg' : ''}
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
