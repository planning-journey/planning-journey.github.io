import { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import {
  format,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
} from 'date-fns';
import { ko } from 'date-fns/locale'; // Import Korean locale for date-fns

import { db, type Goal } from '../db'; // Import Goal interface

interface GoalEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const presetColors = [
  '#4f46e5', // Indigo-600
  '#dc2626', // Red-600
  '#ea580c', // Orange-600
  '#d97706', // Amber-600
  '#059669', // Emerald-600
  '#0d9488', // Teal-600
  '#1d4ed8', // Blue-700
  '#8b5cf6', // Violet-500
];

type PeriodTypeOption = 'daily' | 'weekly' | 'monthly' | 'yearly' | 'free';

const periodTypeOptions = [
  { value: 'yearly', label: '연간' },
  { value: 'monthly', label: '월간' },
  { value: 'weekly', label: '주간' },
  { value: 'daily', label: '일간' },
  { value: 'free', label: '자유' },
];

const GoalEditorModal = ({ isOpen, onClose }: GoalEditorModalProps) => {
  const [name, setName] = useState('');
  const [color, setColor] = useState(presetColors[0]); // Default to first preset color
  const [periodType, setPeriodType] = useState<PeriodTypeOption>('daily');

  // State for date inputs
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1); // 1-indexed
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<Date | null>(new Date());
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  useEffect(() => {
    // Calculate startDate and endDate based on periodType and inputs
    let calculatedStartDate: Date | null = null;
    let calculatedEndDate: Date | null = null;

    if (periodType === 'yearly') {
      const yearDate = new Date(year, 0, 1);
      calculatedStartDate = startOfYear(yearDate);
      calculatedEndDate = endOfYear(yearDate);
    } else if (periodType === 'monthly') {
      const monthDate = new Date(year, month - 1, 1);
      calculatedStartDate = startOfMonth(monthDate);
      calculatedEndDate = endOfMonth(monthDate);
    } else if (periodType === 'weekly' && selectedCalendarDate) {
      calculatedStartDate = startOfWeek(selectedCalendarDate, { weekStartsOn: 1 }); // Monday
      calculatedEndDate = endOfWeek(selectedCalendarDate, { weekStartsOn: 1 }); // Sunday
    } else if (periodType === 'daily' && selectedCalendarDate) {
      calculatedStartDate = selectedCalendarDate;
      calculatedEndDate = selectedCalendarDate;
    } else if (periodType === 'free') {
      // For 'free', startDate and endDate are set directly by DatePicker
    }

    setStartDate(calculatedStartDate);
    setEndDate(calculatedEndDate);
  }, [periodType, year, month, selectedCalendarDate]); // Removed startDate, endDate from deps to avoid infinite loop

  // Reset selectedCalendarDate when periodType changes to avoid weird state issues
  useEffect(() => {
    setSelectedCalendarDate(new Date());
    if (periodType === 'free') { // For free type, we don't have a single selected calendar date
        setStartDate(null);
        setEndDate(null);
    }
  }, [periodType]);

  if (!isOpen) return null;

  const handleSave = async () => {
    if (!name.trim() || !startDate || !endDate) {
      // Add more specific error handling for missing dates
      return;
    }
    try {
      await db.goals.add({
        name,
        color,
        periodType,
        startDate,
        endDate,
        createdAt: new Date(),
      } as Goal); // Cast to Goal to ensure type compatibility
      
      // Reset form fields after successful save
      setName('');
      setColor(presetColors[0]);
      setPeriodType('daily');
      setSelectedCalendarDate(new Date());
      setYear(new Date().getFullYear());
      setMonth(new Date().getMonth() + 1);
      setStartDate(null);
      setEndDate(null);
      
      onClose(); // Close modal on success
    } catch (error) {
      console.error("Failed to save goal: ", error);
      // Optionally, show an error message to the user
    }
  };




  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-60 dark:bg-opacity-70 z-50 flex items-center justify-center"
      onClick={onClose}
    >
      <div 
        className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-md m-4 p-6 border border-gray-200 dark:border-slate-700"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-start">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">신규 목표 추가</h2>
          <button onClick={onClose} className="text-gray-400 dark:text-slate-400 hover:text-gray-600 dark:hover:text-white transition-colors text-2xl leading-none">&times;</button>
        </div>
        
        <form onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
          <div className="space-y-6"> {/* Increased spacing */}
            <div>
              <label htmlFor="goalName" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">목표 이름</label>
              <input
                type="text"
                id="goalName"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 bg-gray-100 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="예: 매일 30분 운동하기"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">목표 색상</label>
              <div className="flex flex-wrap gap-3">
                {presetColors.map((pc) => (
                  <button
                    key={pc}
                    type="button"
                    className={`w-8 h-8 rounded-full border-2 ${color === pc ? 'border-indigo-500 ring-2 ring-indigo-500' : 'border-gray-300 dark:border-transparent'}`}
                    style={{ backgroundColor: pc }}
                    onClick={() => setColor(pc)}
                    title={pc}
                  ></button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">목표 기간 유형</label>
              <div className="flex flex-wrap gap-2">
                {periodTypeOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setPeriodType(option.value as PeriodTypeOption)}
                    className={`
                      px-4 py-2 text-sm font-semibold rounded-xl transition-all duration-300
                      ${periodType === option.value
                        ? 'bg-indigo-600 text-white shadow-md'
                        : 'bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-slate-300 hover:bg-gray-300 dark:hover:bg-slate-600 border border-gray-300 dark:border-slate-600'
                      }
                    `}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Dynamic Date Inputs based on periodType */}
            <div className="date-inputs space-y-4">
              {(periodType === 'yearly' || periodType === 'monthly') && (
                <div>
                  <label htmlFor="goalYear" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">연도</label>
                  <input
                    type="number"
                    id="goalYear"
                    value={year}
                    onChange={(e) => setYear(parseInt(e.target.value))}
                    className="w-full px-3 py-2 bg-gray-100 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="예: 2024"
                    min="1900"
                    max="2100"
                  />
                </div>
              )}

              {periodType === 'monthly' && (
                <div>
                  <label htmlFor="goalMonth" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">월</label>
                  <select
                    id="goalMonth"
                    value={month}
                    onChange={(e) => setMonth(parseInt(e.target.value))}
                    className="w-full px-3 py-2 bg-gray-100 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {[...Array(12)].map((_, i) => (
                      <option key={i + 1} value={i + 1}>{i + 1}월</option>
                    ))}
                  </select>
                </div>
              )}

              {(periodType === 'daily' || periodType === 'weekly' || periodType === 'free') && (
                <div className="flex flex-col items-center">
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                    {periodType === 'daily' && '목표일 선택'}
                    {periodType === 'weekly' && '주 선택'}
                    {periodType === 'free' && '기간 선택'}
                  </label>
                  {periodType === 'free' ? (
                    <DatePicker
                      selected={startDate} // For selectsRange, 'selected' prop is usually the start date
                      onChange={(dates: [Date | null, Date | null]) => {
                        setStartDate(dates[0]);
                        setEndDate(dates[1]);
                      }}
                      startDate={startDate}
                      endDate={endDate}
                      selectsRange={true}
                      inline
                      showWeekNumbers
                      locale={ko} // Apply Korean locale
                      wrapperClassName="w-full"
                      className="w-full px-3 py-2 bg-gray-100 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  ) : (
                    <DatePicker
                      selected={selectedCalendarDate}
                      onChange={(date: Date | null) => setSelectedCalendarDate(date)}
                      selectsRange={false} // Explicitly false for single date selection
                      inline
                      showWeekNumbers
                      locale={ko} // Apply Korean locale
                      wrapperClassName="w-full"
                      className="w-full px-3 py-2 bg-gray-100 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      dayClassName={(date) => {
                        if (periodType === 'weekly' && selectedCalendarDate) {
                          const start = startOfWeek(selectedCalendarDate, { weekStartsOn: 1 });
                          const end = endOfWeek(selectedCalendarDate, { weekStartsOn: 1 });
                          if (date >= start && date <= end) {
                            return 'react-datepicker__day--selected-range';
                          }
                        }
                        return ''; // Return empty string instead of undefined
                      }}
                    />
                  )}
                  {/* Custom styling for react-datepicker to match theme */}
                  <style>{`
                    .react-datepicker {
                      font-family: 'Inter', sans-serif;
                      border: 1px solid #d1d5db; /* gray-300 */
                      background-color: #ffffff; /* white */
                      color: #1f2937; /* gray-900 */
                      border-radius: 0.75rem; /* rounded-xl */
                      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); /* shadow-md */
                      padding: 1rem;
                    }
                    .dark .react-datepicker {
                      border: 1px solid #334155; /* slate-700 */
                      background-color: #1e293b; /* slate-800 */
                      color: #f8fafc; /* slate-50 */
                    }
                    .react-datepicker__header {
                      background-color: #ffffff; /* white */
                      border-bottom: 1px solid #e5e7eb; /* gray-200 */
                      padding-top: 0.8em;
                    }
                    .dark .react-datepicker__header {
                      background-color: #1e293b; /* slate-800 */
                      border-bottom: 1px solid #334155; /* slate-700 */
                    }
                    .react-datepicker__current-month,
                    .react-datepicker__day-name,
                    .react-datepicker__time-name {
                      color: #1f2937; /* gray-900 */
                    }
                    .dark .react-datepicker__current-month,
                    .dark .react-datepicker__day-name,
                    .dark .react-datepicker__time-name {
                      color: #f8fafc; /* slate-50 */
                    }
                    .react-datepicker__day {
                      color: #1f2937; /* gray-900 */
                      transition: background-color 0.3s;
                    }
                    .dark .react-datepicker__day {
                      color: #f8fafc; /* slate-50 */
                    }
                    .react-datepicker__day--outside-month {
                      color: #9ca3af; /* gray-400 */
                    }
                    .dark .react-datepicker__day--outside-month {
                      color: #64748b; /* slate-400 */
                    }
                    .react-datepicker__day--selected,
                    .react-datepicker__day--in-selecting-range,
                    .react-datepicker__day--in-range {
                      background-color: #4f46e5; /* indigo-600 */
                      color: white;
                      border-radius: 0.5rem;
                    }
                     .react-datepicker__day--keyboard-selected {
                      background-color: #6366f1; /* indigo-500 */
                      color: white;
                      border-radius: 0.5rem;
                    }
                    .react-datepicker__day--selected-range {
                      background-color: #4f46e5; /* indigo-600 */
                      color: white;
                    }
                    .react-datepicker__navigation-icon::before {
                      border-color: #1f2937; /* gray-900 */
                    }
                    .dark .react-datepicker__navigation-icon::before {
                      border-color: #f8fafc; /* slate-50 */
                    }
                    .react-datepicker__day:hover {
                      background-color: #e5e7eb; /* gray-200 */
                      border-radius: 0.5rem;
                    }
                    .dark .react-datepicker__day:hover {
                      background-color: #334155; /* slate-700 */
                    }
                    .react-datepicker__close-icon::after {
                      background-color: #4f46e5; /* indigo-600 */
                    }
                    .react-datepicker__week-number {
                      color: #4b5563; /* gray-700 */
                    }
                    .dark .react-datepicker__week-number {
                      color: #cbd5e1; /* slate-300 */
                    }
                    .react-datepicker__month-read-view--down-arrow,
                    .react-datepicker__year-read-view--down-arrow {
                      border-color: #1f2937; /* gray-900 */
                    }
                    .dark .react-datepicker__month-read-view--down-arrow,
                    .dark .react-datepicker__year-read-view--down-arrow {
                      border-color: #f8fafc; /* slate-50 */
                    }
                  `}</style>
                </div>
              )}

              {/* Display calculated date range */}
              {(startDate && endDate) && (
                <div className="text-sm text-gray-500 dark:text-slate-400 mt-2">
                  <p>시작일: {format(startDate, 'yyyy년 MM월 dd일', { locale: ko })}</p>
                  <p>종료일: {format(endDate, 'yyyy년 MM월 dd일', { locale: ko })}</p>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex justify-end mt-8">
            <button type="submit" className="w-full px-5 py-3 text-sm font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-500 transition-all duration-300 shadow-md">
              목표 생성
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GoalEditorModal;