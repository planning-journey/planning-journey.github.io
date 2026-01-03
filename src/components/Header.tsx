import { useState, useRef, useEffect } from 'react';
import { Settings, Flag, Sun, Moon, Monitor } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext'; // Import useTheme hook

interface HeaderProps {
  onOpenModal: () => void;
}

const Header = ({ onOpenModal }: HeaderProps) => {
  const [isSettingsMenuOpen, setSettingsMenuOpen] = useState(false);
  const { theme, setTheme } = useTheme(); // Use the theme context
  const settingsButtonRef = useRef<HTMLButtonElement>(null);
  const settingsMenuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        settingsMenuRef.current &&
        !settingsMenuRef.current.contains(event.target as Node) &&
        settingsButtonRef.current &&
        !settingsButtonRef.current.contains(event.target as Node)
      ) {
        setSettingsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleThemeChange = (selectedTheme: 'light' | 'dark' | 'system') => {
    setTheme(selectedTheme);
    setSettingsMenuOpen(false); // Close menu after selection
  };

  return (
    <header className="flex items-center justify-between p-4 border-b border-slate-800 dark:border-slate-700 bg-slate-900 dark:bg-gray-900 shadow-md">
      <h1 className="text-lg font-bold tracking-wider text-slate-200 dark:text-gray-100">PLANNING JOURNEY</h1>
      <div className="flex items-center gap-4 relative">
        {/* Settings Button */}
        <button
          ref={settingsButtonRef}
          className="p-2 rounded-full hover:bg-slate-800 dark:hover:bg-gray-800 transition-all duration-300 relative z-20"
          onClick={() => setSettingsMenuOpen(!isSettingsMenuOpen)}
        >
          <Settings className="w-5 h-5 text-slate-400 dark:text-gray-400" />
        </button>

        {/* Settings Context Menu */}
        {isSettingsMenuOpen && (
          <div
            ref={settingsMenuRef}
            className="absolute top-full right-0 mt-2 w-40 bg-slate-800 dark:bg-gray-800 rounded-xl shadow-lg border border-slate-700 dark:border-gray-700 z-30 overflow-hidden"
          >
            <button
              className="flex items-center gap-2 w-full px-4 py-2 text-sm text-slate-300 dark:text-gray-300 hover:bg-slate-700 dark:hover:bg-gray-700 transition-colors duration-200"
              onClick={() => handleThemeChange('light')}
            >
              <Sun className="w-4 h-4" />
              <span>Light</span>
              {theme === 'light' && <span className="ml-auto text-indigo-400">&check;</span>}
            </button>
            <button
              className="flex items-center gap-2 w-full px-4 py-2 text-sm text-slate-300 dark:text-gray-300 hover:bg-slate-700 dark:hover:bg-gray-700 transition-colors duration-200"
              onClick={() => handleThemeChange('dark')}
            >
              <Moon className="w-4 h-4" />
              <span>Dark</span>
              {theme === 'dark' && <span className="ml-auto text-indigo-400">&check;</span>}
            </button>
            <button
              className="flex items-center gap-2 w-full px-4 py-2 text-sm text-slate-300 dark:text-gray-300 hover:bg-slate-700 dark:hover:bg-gray-700 transition-colors duration-200"
              onClick={() => handleThemeChange('system')}
            >
              <Monitor className="w-4 h-4" />
              <span>System</span>
              {theme === 'system' && <span className="ml-auto text-indigo-400">&check;</span>}
            </button>
          </div>
        )}

        {/* Goal Management Button */}
        <button
          onClick={onOpenModal}
          className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-500 transition-all duration-300 shadow-md relative z-10"
        >
          <Flag className="w-4 h-4" />
          <span>목표 관리</span>
        </button>
      </div>
    </header>
  );
};

export default Header;
