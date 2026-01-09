import React, { useState, useEffect } from 'react';
import { formatDateToYYYYMMDD, formateYYYYMMDDToDate } from '../utils/dateUtils';

interface DateInputProps {
  label?: string;
  value: Date | null;
  onChange: (date: Date | null) => void;
  placeholder?: string;
}

const DateInput: React.FC<DateInputProps> = ({ label, value, onChange, placeholder = "YYYY-MM-DD" }) => {
  const [inputValue, setInputValue] = useState('');

  // Sync internal state with props
  useEffect(() => {
    if (value) {
      setInputValue(formatDateToYYYYMMDD(value));
    } else {
      setInputValue('');
    }
  }, [value]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleBlur = () => {
    // Basic validation logic
    const datePattern = /^\d{4}-\d{2}-\d{2}$/;
    if (datePattern.test(inputValue)) {
      const newDate = formateYYYYMMDDToDate(inputValue);
      if (!isNaN(newDate.getTime())) {
          onChange(newDate);
          return;
      }
    }
    // Handle YYYYMMDD format for convenience
    const compactPattern = /^\d{8}$/;
    if (compactPattern.test(inputValue)) {
        const y = inputValue.substring(0, 4);
        const m = inputValue.substring(4, 6);
        const d = inputValue.substring(6, 8);
        const formatted = `${y}-${m}-${d}`;
        const newDate = formateYYYYMMDDToDate(formatted);
        if (!isNaN(newDate.getTime())) {
            onChange(newDate);
            setInputValue(formatted); // Auto-format
            return;
        }
    }

    // If invalid or empty, revert to prop value or clear
    if (inputValue.trim() === '') {
        onChange(null);
    } else {
        // Revert to last valid value
        if (value) {
            setInputValue(formatDateToYYYYMMDD(value));
        } else {
            setInputValue('');
        }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      // Prevent form submission if inside a form
      e.preventDefault();
      handleBlur();
      // Remove focus
      e.currentTarget.blur();
    }
  };

  return (
    <div className="flex flex-col w-full">
      {label && <label className="text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">{label}</label>}
      <input
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors text-center font-mono"
        maxLength={10}
      />
    </div>
  );
};

export default DateInput;
