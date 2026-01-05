import React from 'react';
import { Check } from 'lucide-react';

interface CheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  className?: string;
}

const Checkbox: React.FC<CheckboxProps> = ({ checked, onChange, className }) => {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`
        relative flex items-center justify-center
        h-4.5 w-4.5 rounded-xl border
        transition-all duration-300
        ${checked
          ? 'bg-indigo-600 border-indigo-600 shadow-md'
          : 'bg-white border-slate-300 dark:bg-slate-700 dark:border-slate-600'
        }
        ${className}
      `}
    >
      {checked && (
        <Check className="h-3 w-3 text-white" strokeWidth={2} />
      )}
      <input
        type="checkbox"
        className="sr-only" // Visually hide the native checkbox
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
    </button>
  );
};

export default Checkbox;
