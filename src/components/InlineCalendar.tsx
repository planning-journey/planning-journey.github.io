// src/components/InlineCalendar.tsx
import React, { useState, useRef, useEffect, useCallback } from 'react';

interface InlineCalendarProps {
  onDateSelect: (date: Date) => void;
}

const InlineCalendar: React.FC<InlineCalendarProps> = ({ onDateSelect }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [currentMonthYear, setCurrentMonthYear] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [dates, setDates] = useState<Date[]>([]);

  // Function to generate dates for a given month and year
  const generateDates = useCallback((year: number, month: number, daysInMonth: number): Date[] => {
    const newDates: Date[] = [];
    const startOfMonth = new Date(year, month, 1);
    // Adjust to make Monday the start of the week (0=Sunday, 1=Monday... 6=Saturday)
    // If startOfMonth.getDay() is 0 (Sunday), daysToAddBefore becomes 6.
    // If startOfMonth.getDay() is 1 (Monday), daysToAddBefore becomes 0.
    const daysToAddBefore = startOfMonth.getDay() === 0 ? 6 : startOfMonth.getDay() - 1; 

    // Add days from the previous month to fill the first week
    for (let i = daysToAddBefore; i > 0; i--) {
      newDates.push(new Date(year, month, 1 - i));
    }

    // Add days for the current month
    for (let i = 1; i <= daysInMonth; i++) {
      newDates.push(new Date(year, month, i));
    }
    return newDates;
  }, []);

  const getDaysInMonth = (year: number, month: number): number => {
    return new Date(year, month + 1, 0).getDate();
  };

  useEffect(() => {
    const today = new Date();
    const initialDates: Date[] = [];
    // Generate dates for current month +/- 2 months
    for (let i = -2; i <= 2; i++) { 
      const year = today.getFullYear();
      const month = today.getMonth() + i;
      initialDates.push(...generateDates(year, month, getDaysInMonth(year, month)));
    }
    setDates(initialDates);

    setCurrentMonthYear(
      new Intl.DateTimeFormat('ko-KR', { year: 'numeric', month: 'long' }).format(today)
    );
  }, [generateDates]);

  const handleScroll = useCallback(() => {
    if (scrollRef.current && dates.length > 0) {
      const { scrollLeft, clientWidth, scrollWidth } = scrollRef.current;
      const dayWidth = scrollWidth / dates.length;
      const centerScrollPosition = scrollLeft + clientWidth / 2;
      const centerDateIndex = Math.floor(centerScrollPosition / dayWidth);
      
      if (dates[centerDateIndex]) {
        setCurrentMonthYear(
          new Intl.DateTimeFormat('ko-KR', { year: 'numeric', month: 'long' }).format(dates[centerDateIndex])
        );
      }

      // Basic infinite scroll logic - load more dates when approaching ends
      // This is a simplified version and needs refinement for smooth virtualization/infinite loading
      if (scrollLeft < clientWidth * 0.5) { // Near start, load previous month
        // To implement full infinite scroll, you'd calculate the earliest date
        // currently displayed and prepend a new month's worth of data.
        // For simplicity, we'll just log for now.
        // console.log("Load previous dates (implement prepend logic)");
      } else if (scrollLeft > scrollWidth - clientWidth * 1.5) { // Near end, load next month
        // Similar to above, calculate the latest date and append new data.
        // console.log("Load next dates (implement append logic)");
      }
    }
  }, [dates]);

  useEffect(() => {
    const currentScrollRef = scrollRef.current;
    if (currentScrollRef) {
      currentScrollRef.addEventListener('scroll', handleScroll);
      return () => {
        currentScrollRef.removeEventListener('scroll', handleScroll);
      };
    }
  }, [handleScroll]);

  const scrollToDate = useCallback((date: Date) => {
    if (scrollRef.current && dates.length > 0) {
      const targetIndex = dates.findIndex(d => d.toDateString() === date.toDateString());
      if (targetIndex !== -1) {
        // Calculate average width of a day to position correctly
        // This is a simplification; actual width may vary slightly
        const averageDayWidth = scrollRef.current.scrollWidth / dates.length;
        const scrollPosition = targetIndex * averageDayWidth - (scrollRef.current.clientWidth / 2) + (averageDayWidth / 2);
        
        scrollRef.current.scrollTo({
          left: scrollPosition,
          behavior: 'smooth'
        });
      }
    }
  }, [dates]);

  useEffect(() => {
    // Initial scroll to today's date
    scrollToDate(new Date());
  }, [scrollToDate, dates]); // Dependency on dates ensures it runs after dates are set

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
        {dates.map((date, index) => (
          <div
            key={date.toISOString() + index} // Use index as well to ensure unique keys for duplicate dates
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
