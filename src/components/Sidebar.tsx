import React from 'react';
import { X, Plus, Edit, Trash2, Sun, Moon, Monitor } from 'lucide-react'; // Import theme icons
import { type Project } from '../types/project'; // Import Project interface
import { useTheme } from '../contexts/ThemeContext'; // Import useTheme hook

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  projects: Project[];
  onAddProjectClick: () => void;
  onEditProjectClick: (project: Project) => void;
  onDeleteProjectRequest: (projectId: string) => void; // New prop for delete request
  onSelectProject: (projectId: string) => void;
  selectedProjectId: string | null;
}

const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  projects,
  onAddProjectClick,
  onEditProjectClick,
  onDeleteProjectRequest, // Changed prop name
  onSelectProject,
  selectedProjectId,
}) => {
  const { theme, setTheme } = useTheme();

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={onClose}
        ></div>
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 w-64 bg-white dark:bg-slate-800 shadow-lg z-40 top-0 bottom-0
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0 md:shadow-none flex flex-col md:border-r md:border-slate-200/50 dark:md:border-slate-700 md:fixed md:top-0 md:bottom-0`}
      >
        <div className="p-4 flex items-center justify-between border-b border-slate-200/50 dark:border-slate-700 md:hidden">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">메뉴</h2>
          <button onClick={onClose} className="p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors duration-200">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <div className="mt-4">
            <button
              onClick={onAddProjectClick}
              className="w-full text-left p-2 flex items-center justify-center text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-slate-700 hover:bg-indigo-100 dark:hover:bg-slate-600 rounded-xl transition-all duration-300 shadow-sm"
            >
              <Plus className="w-5 h-5 mr-2" />
              프로젝트 추가
            </button>
            <div className="mt-2 space-y-2">
              {projects.map((project) => (
                <div
                  key={project.id}
                  className={`flex items-center justify-between p-2 rounded-xl transition-colors duration-200 cursor-pointer
                    ${selectedProjectId === project.id
                      ? 'bg-indigo-100 dark:bg-indigo-700 text-indigo-800 dark:text-white'
                      : 'text-gray-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                    }`}
                  onClick={() => onSelectProject(project.id)}
                >
                  <span>{project.name}</span>
                  <div className="flex space-x-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent selecting project when clicking edit
                        onEditProjectClick(project);
                      }}
                      className="p-1 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-md transition-colors duration-200"
                    >
                      <Edit className="w-4 h-4 text-slate-500" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent selecting project when clicking delete
                        onDeleteProjectRequest(project.id); // Call new prop
                      }}
                      className="p-1 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-md transition-colors duration-200"
                    >
                      <Trash2 className="w-4 h-4 text-slate-500" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </nav>
        {/* Theme selection buttons at the bottom */}
        <div className="p-4 border-t border-slate-200/50 dark:border-slate-700 flex justify-around gap-2">
          <button
            onClick={() => setTheme('light')}
            className={`flex-1 p-2 rounded-xl flex items-center justify-center transition-colors duration-200
              ${theme === 'light'
                ? 'bg-indigo-100 dark:bg-indigo-700 text-indigo-800 dark:text-white'
                : 'text-gray-700 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            aria-label="Light theme"
          >
            <Sun className="w-5 h-5" />
          </button>
          <button
            onClick={() => setTheme('dark')}
            className={`flex-1 p-2 rounded-xl flex items-center justify-center transition-colors duration-200
              ${theme === 'dark'
                ? 'bg-indigo-100 dark:bg-indigo-700 text-indigo-800 dark:text-white'
                : 'text-gray-700 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            aria-label="Dark theme"
          >
            <Moon className="w-5 h-5" />
          </button>
          <button
            onClick={() => setTheme('system')}
            className={`flex-1 p-2 rounded-xl flex items-center justify-center transition-colors duration-200
              ${theme === 'system'
                ? 'bg-indigo-100 dark:bg-indigo-700 text-indigo-800 dark:text-white'
                : 'text-gray-700 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            aria-label="System theme"
          >
            <Monitor className="w-5 h-5" />
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
