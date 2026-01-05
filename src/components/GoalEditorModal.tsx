import { useState, useEffect } from 'react';

import { db, type Goal } from '../db'; // Import Goal interface
import Calendar from './Calendar'; // Import the custom Calendar component

interface GoalEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  goalToEdit?: Goal | null; // New prop for editing
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

const GoalEditorModal = ({ isOpen, onClose, goalToEdit }: GoalEditorModalProps) => {
  const [name, setName] = useState('');
  const [color, setColor] = useState(presetColors[0]); // Default to first preset color
  const [periodType, setPeriodType] = useState<PeriodTypeOption>('daily');

  // State for date inputs
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1); // 1-indexed
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<Date | null>(new Date());
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  // Helper functions (re-implementing date-fns functionality using native Date methods)
  const getStartOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1);
  const getEndOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0);
  const getStartOfYear = (date: Date) => new Date(date.getFullYear(), 0, 1);
  const getEndOfYear = (date: Date) => new Date(date.getFullYear(), 11, 31);
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
  // Simple format function (not as robust as date-fns, but sufficient for display)
  const formatDate = (date: Date | null) => {
    if (!date) return '';
    return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`;
  };


  // Effect to populate form when goalToEdit changes
  useEffect(() => {
    if (goalToEdit) {
      setName(goalToEdit.name);
      setColor(goalToEdit.color);
      setPeriodType(goalToEdit.periodType);
      
      const editStartDate = new Date(goalToEdit.startDate);
      const editEndDate = new Date(goalToEdit.endDate);

      setYear(editStartDate.getFullYear());
      setMonth(editStartDate.getMonth() + 1);
      setSelectedCalendarDate(editStartDate); // For daily/weekly
      setStartDate(editStartDate);
      setEndDate(editEndDate);
    } else {
      // Reset form if no goalToEdit (for new goal)
      setName('');
      setColor(presetColors[0]);
      setPeriodType('daily');
      setSelectedCalendarDate(new Date());
      setYear(new Date().getFullYear());
      setMonth(new Date().getMonth() + 1);
      setStartDate(null);
      setEndDate(null);
    }
  }, [goalToEdit]);


  useEffect(() => {
    if (periodType === 'free') {
      // For 'free' type, startDate and endDate are managed by user interaction
      // with the Calendar component or initialized from goalToEdit.
      // This effect should not interfere.
      return;
    }

    let calculatedStartDate: Date | null = null;
    let calculatedEndDate: Date | null = null;

    if (periodType === 'yearly') {
      const yearDate = new Date(year, 0, 1);
      calculatedStartDate = getStartOfYear(yearDate);
      calculatedEndDate = getEndOfYear(yearDate);
    } else if (periodType === 'monthly') {
      const monthDate = new Date(year, month - 1, 1);
      calculatedStartDate = getStartOfMonth(monthDate);
      calculatedEndDate = getEndOfMonth(monthDate);
    } else if (periodType === 'weekly' && selectedCalendarDate) {
      calculatedStartDate = getStartOfWeek(selectedCalendarDate, 1); // Monday
      calculatedEndDate = getEndOfWeek(selectedCalendarDate, 1); // Sunday
    } else if (periodType === 'daily' && selectedCalendarDate) {
      calculatedStartDate = selectedCalendarDate;
      calculatedEndDate = selectedCalendarDate;
    }

    setStartDate(calculatedStartDate);
    setEndDate(calculatedEndDate);
  }, [periodType, year, month, selectedCalendarDate]);

  // Reset selectedCalendarDate when periodType changes to avoid weird state issues
  useEffect(() => {
    // Only reset if not currently editing, to prevent overwriting existing goal's dates
    if (!goalToEdit) {
      setSelectedCalendarDate(new Date());
      if (periodType === 'free') { 
          setStartDate(null);
          setEndDate(null);
      }
    }
  }, [periodType, goalToEdit]);


  if (!isOpen) return null;

  const handleSave = async () => {
    if (!name.trim() || !startDate || !endDate) {
      return;
    }

    const goalData: Goal = {
      name,
      color,
      periodType,
      startDate,
      endDate,
      createdAt: goalToEdit ? goalToEdit.createdAt : new Date(), // Keep original createdAt for edits
      ...(goalToEdit && { id: goalToEdit.id }) // Include id for updates
    };
    
    try {
      if (goalToEdit) {
        await db.goals.put(goalData); // Update existing goal
      } else {
        await db.goals.add(goalData); // Add new goal
      }
      
      // Reset form fields after successful save
      setName('');
      setColor(presetColors[0]);
      setPeriodType('daily');
      setSelectedCalendarDate(new Date());
      setYear(new Date().getFullYear());
      setMonth(new Date().getMonth() + 1);
      setStartDate(null);
      setEndDate(null);
      
      onClose(); 
    } catch (error) {
      console.error("Failed to save goal: ", error);
    }
  };

  const handleCalendarDateSelect = (date: Date) => {
    setSelectedCalendarDate(date);
  };

  const handleCalendarRangeSelect = (start: Date | null, end: Date | null) => {
    setStartDate(start);
    setEndDate(end);
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
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">{goalToEdit ? '목표 수정' : '신규 목표 추가'}</h2>
          <button onClick={onClose} className="text-gray-400 dark:text-slate-400 hover:text-gray-600 dark:hover:text-white transition-colors text-2xl leading-none">&times;</button>
        </div>
        
        <form onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
          <div className="space-y-6">
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
                    placeholder="예: 매일 30분 운동하기"
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
                  <Calendar
                    selectionType={periodType === 'free' ? 'range' : (periodType === 'weekly' ? 'week' : 'day')}
                    selectedDate={selectedCalendarDate}
                    startDate={startDate}
                    endDate={endDate}
                    onSelectDate={handleCalendarDateSelect}
                    onSelectRange={handleCalendarRangeSelect}
                  />
                </div>
              )}

              {/* Display calculated date range */}
              {(startDate && endDate) && (
                <div className="text-sm text-gray-500 dark:text-slate-400 mt-2">
                  <p>시작일: {formatDate(startDate)}</p>
                  <p>종료일: {formatDate(endDate)}</p>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex justify-end mt-8">
            <button type="submit" className="w-full px-5 py-3 text-sm font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-500 transition-all duration-300 shadow-md">
              {goalToEdit ? '목표 수정' : '목표 생성'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GoalEditorModal;