import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { type Goal } from '../db';

interface GoalAutocompleteProps {
  goals: Goal[];
  selectedGoalId: number | null | undefined;
  onSelectGoal: (goalId: number | null | undefined) => void;
}

const GoalAutocomplete: React.FC<GoalAutocompleteProps> = ({ goals, selectedGoalId, onSelectGoal }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState<'above' | 'below'>('below');
  const [highlightedIndex, setHighlightedIndex] = useState(-1); // New state for keyboard navigation
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null); // Ref for the ul element

  useEffect(() => {
    const newSearchTerm = selectedGoalId
      ? goals.find(g => g.id === selectedGoalId)?.name || ''
      : '';
    if (newSearchTerm !== searchTerm) {
      setSearchTerm(newSearchTerm);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedGoalId, goals]); // Removed 'searchTerm' from dependencies to avoid infinite loop when setSearchTerm is called.



  const filteredGoals = useMemo(() => {
    return goals.filter(goal =>
      goal.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, goals]);

  // Handle click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [wrapperRef]);

  // Dynamic positioning logic
  useEffect(() => {
    if (isOpen && inputRef.current) {
      const inputRect = inputRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
      const spaceBelow = viewportHeight - inputRect.bottom;
      const spaceAbove = inputRect.top;

      const requiredSpace = Math.min(filteredGoals.length * 40, 200) + 10;
      let newPosition: 'above' | 'below';

      if (spaceBelow < requiredSpace && spaceAbove > requiredSpace) {
        newPosition = 'above';
      } else {
        newPosition = 'below';
      }

      if (newPosition !== dropdownPosition) {
        setDropdownPosition(newPosition);
      }
    }
  }, [isOpen, filteredGoals.length, dropdownPosition]);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    setIsOpen(true);
  };

  const selectGoal = useCallback((goal: Goal) => {
    setSearchTerm(goal.name);
    onSelectGoal(goal.id);
    setIsOpen(false);
    inputRef.current?.focus(); // Keep focus on input after selection
  }, [onSelectGoal]);

  const handleGoalClick = (goal: Goal) => {
    selectGoal(goal);
  };

  const handleClearSelection = useCallback(() => {
    setSearchTerm('');
    onSelectGoal(undefined);
    setIsOpen(false);
    inputRef.current?.focus();
  }, [onSelectGoal]);

  // Keyboard navigation
  const handleKeyDown = useCallback((event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setHighlightedIndex(prevIndex =>
        prevIndex < filteredGoals.length - 1 ? prevIndex + 1 : prevIndex
      );
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setHighlightedIndex(prevIndex => (prevIndex > 0 ? prevIndex - 1 : 0));
    } else if (event.key === 'Enter') {
      event.preventDefault();
      if (highlightedIndex !== -1 && filteredGoals[highlightedIndex]) {
        selectGoal(filteredGoals[highlightedIndex]);
      } else if (filteredGoals.length === 1 && searchTerm.toLowerCase() === filteredGoals[0].name.toLowerCase()) {
        // If only one filtered result and it exactly matches the search term, select it
        selectGoal(filteredGoals[0]);
      } else if (!searchTerm && selectedGoalId) {
        // If enter is pressed on empty search term and a goal is already selected, clear it
        handleClearSelection();
      } else if (searchTerm && filteredGoals.length === 0) {
        // If enter is pressed with search term but no results, clear search and selection
        handleClearSelection();
      }
    } else if (event.key === 'Escape') {
      event.preventDefault();
      setIsOpen(false);
      inputRef.current?.blur(); // Remove focus from input
    }
  }, [filteredGoals, highlightedIndex, selectGoal, searchTerm, selectedGoalId, handleClearSelection]);

  // Scroll highlighted item into view
  useEffect(() => {
    if (listRef.current && highlightedIndex !== -1) {
      const highlightedItem = listRef.current.children[highlightedIndex] as HTMLLIElement;
      if (highlightedItem) {
        highlightedItem.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [highlightedIndex]);

  return (
    <div className="relative" ref={wrapperRef}>
      <input
        type="text"
        ref={inputRef}
        className="w-full px-3 py-2 bg-gray-100 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
        placeholder="목표 검색 또는 선택"
        value={searchTerm}
        onChange={handleInputChange}
        onFocus={() => setIsOpen(true)}
        onKeyDown={handleKeyDown} // Add keyboard handler
      />
      {selectedGoalId && (
        <button
          type="button"
          onClick={handleClearSelection}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:text-slate-400 dark:hover:text-slate-200"
        >
          &times;
        </button>
      )}


      {isOpen && filteredGoals.length > 0 && (
        <ul
          ref={listRef} // Attach ref to ul
          className={`absolute z-10 w-full bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg shadow-lg mt-1 max-h-60 overflow-y-auto
          ${dropdownPosition === 'above' ? 'bottom-full mb-1' : 'top-full mt-1'}`
        }>
          {filteredGoals.map((goal, index) => (
            <li
              key={goal.id}
              className={`px-3 py-2 cursor-pointer flex items-center gap-2 ${
                index === highlightedIndex
                  ? 'bg-indigo-500 text-white' // Highlighted style
                  : 'hover:bg-gray-100 dark:hover:bg-slate-600 text-gray-900 dark:text-white'
              }`}
              onClick={() => handleGoalClick(goal)}
              onMouseEnter={() => setHighlightedIndex(index)} // Highlight on hover
              onMouseLeave={() => setHighlightedIndex(-1)} // Remove highlight on mouse leave
            >
              <span
                className="block h-3 w-3 rounded-full"
                style={{ backgroundColor: goal.color }}
              ></span>
              {goal.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default GoalAutocomplete;
