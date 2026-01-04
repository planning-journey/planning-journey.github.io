// src/components/InlineCalendar.tsx
import React, { useState, useRef, useEffect, useCallback, useLayoutEffect } from 'react';

interface InlineCalendarProps {
  onDateSelect: (date: Date) => void;
}

// Helper function to get the number of days in a month
const getDaysInMonth = (year: number, month: number): number => {
  return new Date(year, month + 1, 0).getDate();
};

// Helper function to generate dates for a specific month (without padding from prev/next months)
const generateDatesForMonth = (year: number, month: number): Date[] => {
  const datesInMonth: Date[] = [];
  const days = getDaysInMonth(year, month);
  for (let i = 1; i <= days; i++) {
    datesInMonth.push(new Date(year, month, i));
  }
  return datesInMonth;
};

// Helper to generate dates for a full week row (Monday to Sunday) - currently not used in this continuous stream calendar
const generateWeekRowDates = (date: Date): Date[] => {
  const weekDates: Date[] = [];
  const dayOfWeek = date.getDay(); // 0 for Sunday, 1 for Monday
  const startDate = new Date(date);
  startDate.setDate(date.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1)); // Set to Monday of the week

  for (let i = 0; i < 7; i++) {
    const d = new Date(startDate);
    d.setDate(startDate.getDate() + i);
    weekDates.push(d);
  }
  return weekDates;
};


const InlineCalendar: React.FC<InlineCalendarProps> = ({ onDateSelect }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [currentMonthYear, setCurrentMonthYear] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  
  // dates will store all currently rendered dates
  const [dates, setDates] = useState<Date[]>([]);
  
  // These will track the first and last *full month* (or chunk) generated
  const [firstRenderedMonth, setFirstRenderedMonth] = useState<Date | null>(null);
  const [lastRenderedMonth, setLastRenderedMonth] = useState<Date | null>(null);

  // Function to load a new month (either previous or next)
  const loadMonth = useCallback((direction: 'prev' | 'next', currentRefDate: Date) => {
    let year = currentRefDate.getFullYear();
    let month = currentRefDate.getMonth();

    if (direction === 'prev') {
      month--;
      if (month < 0) {
        month = 11;
        year--;
      }
    } else { // 'next'
      month++;
      if (month > 11) {
        month = 0;
        year++;
      }
    }
    
    const newMonthDates = generateDatesForMonth(year, month);
    return { dates: newMonthDates, monthRef: new Date(year, month, 1) };
  }, []);


  // Initial dates generation: Load a few months around today
  useEffect(() => {
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth();

    const initialDates: Date[] = [];
    
    // Load 2 months before, current month, and 2 months after
    for (let i = -2; i <= 2; i++) {
      initialDates.push(...generateDatesForMonth(currentYear, currentMonth + i));
    }
    
    setDates(initialDates);
    setFirstRenderedMonth(new Date(currentYear, currentMonth - 2, 1));
    setLastRenderedMonth(new Date(currentYear, currentMonth + 2, 1));
    
    setCurrentMonthYear(
      new Intl.DateTimeFormat('ko-KR', { year: 'numeric', month: 'long' }).format(today)
    );
  }, [generateDatesForMonth]);


  // Scroll to a specific date (e.g., today or selected date)
  const scrollToDate = useCallback((date: Date, behavior: ScrollBehavior = 'smooth') => {
    if (scrollRef.current && dates.length > 0) {
      const targetDateString = date.toDateString();
      // Find the index of the first occurrence of the target date
      const targetIndex = dates.findIndex(d => d.toDateString() === targetDateString);

      if (targetIndex !== -1) {
        // Approximate width of a day. This is critical for scroll calculations.
        // Assume all days have roughly the same width in the flex container.
        const dayElement = scrollRef.current.children[targetIndex] as HTMLElement;
        const dayWidth = dayElement ? dayElement.offsetWidth : 56; // 56px (w-14) is default in Tailwind

        const scrollPosition = targetIndex * dayWidth - (scrollRef.current.clientWidth / 2) + (dayWidth / 2);
        
        scrollRef.current.scrollTo({
          left: scrollPosition,
          behavior: behavior
        });
      }
    }
  }, [dates]);

  // Initial scroll to today's date after initial render
  useLayoutEffect(() => {
    if (dates.length > 0) {
      scrollToDate(new Date(), 'auto'); // Scroll instantly on initial load
    }
  }, [dates, scrollToDate]); // Re-run if dates change significantly (e.g., initial load)


  // Infinite scroll logic
  const handleScroll = useCallback(() => {
    if (!scrollRef.current || dates.length === 0 || !firstRenderedMonth || !lastRenderedMonth) return;

    const { scrollLeft, clientWidth, scrollWidth } = scrollRef.current;
    
    // Determine current month/year in viewport center
    const dayWidth = scrollWidth / dates.length; // Approximate width of a day
    const centerScrollPosition = scrollLeft + clientWidth / 2;
    const centerDateIndex = Math.floor(centerScrollPosition / dayWidth);
    
    if (dates[centerDateIndex]) {
      setCurrentMonthYear(
        new Intl.DateTimeFormat('ko-KR', { year: 'numeric', month: 'long' }).format(dates[centerDateIndex])
      );
    }

    const scrollThreshold = clientWidth * 0.2; // Load new months when 20% from edge

    // Load previous month
    if (scrollLeft < scrollThreshold) {
      const { dates: newDates, monthRef } = loadMonth('prev', firstRenderedMonth);
      setDates(prevDates => [...newDates, ...prevDates]);
      setFirstRenderedMonth(monthRef);

      // Adjust scroll position to prevent jump
      const prevScrollWidth = scrollRef.current.scrollWidth;
      requestAnimationFrame(() => { // Use requestAnimationFrame for DOM updates
        if (scrollRef.current) {
          scrollRef.current.scrollLeft += (scrollRef.current.scrollWidth - prevScrollWidth);
        }
      });
    } 
    // Load next month
    else if (scrollLeft + clientWidth > scrollWidth - scrollThreshold) {
      const { dates: newDates, monthRef } = loadMonth('next', lastRenderedMonth);
      setDates(prevDates => [...prevDates, ...newDates]);
      setLastRenderedMonth(monthRef);
    }
  }, [dates, loadMonth, firstRenderedMonth, lastRenderedMonth]); // generateDatesForMonth was removed, loadMonth covers it


  // Attach/detach scroll listener
  useEffect(() => {
    const currentScrollRef = scrollRef.current;
    if (currentScrollRef) {
      currentScrollRef.addEventListener('scroll', handleScroll);
      return () => {
        currentScrollRef.removeEventListener('scroll', handleScroll);
      };
    }
  }, [handleScroll]);


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
        className="flex overflow-x-auto custom-scrollbar-hide pb-2 px-2 snap-x snap-mandatory"
      >
        {dates.map((date) => (
          <div
            key={date.toISOString()} // Use date.toISOString() alone as key since dates are now unique
            className={`flex-none w-14 text-center cursor-pointer snap-center
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
  );
};

export default InlineCalendar;