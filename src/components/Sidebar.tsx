import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Plus, Edit, Trash2, Sun, Moon, Monitor, GripVertical } from 'lucide-react';
import { type Project } from '../../src/types/project';
import { useTheme } from '../contexts/ThemeContext';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  type DragStartEvent,
  type DragEndEvent,
  defaultDropAnimationSideEffects,
  type DropAnimation
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  projects: Project[];
  onAddProjectClick: () => void;
  onEditProjectClick: (project: Project) => void;
  onDeleteProjectRequest: (projectId: string) => void;
  onSelectProject: (projectId: string) => void;
  onReorderProjects: (projectIds: string[]) => void;
  selectedProjectId: string | null;
}

interface SortableProjectItemProps {
  project: Project;
  isSelected: boolean;
  onSelect: () => void;
  onEdit: (e: React.MouseEvent) => void;
  onDelete: (e: React.MouseEvent) => void;
}

const SortableProjectItem = ({ project, isSelected, onSelect, onEdit, onDelete }: SortableProjectItemProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: project.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center justify-between p-2 rounded-xl transition-colors duration-200 cursor-pointer group relative
        ${isSelected
          ? 'bg-indigo-100 dark:bg-indigo-700 text-indigo-800 dark:text-white'
          : 'text-gray-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
        }`}
      onClick={onSelect}
    >
      <div className="flex items-center gap-2 flex-1 min-w-0">
         <div 
            {...attributes} 
            {...listeners}
            className="cursor-grab active:cursor-grabbing text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 flex-shrink-0"
            onClick={(e) => e.stopPropagation()} 
         >
            <GripVertical className="w-4 h-4" />
         </div>
         <span className="truncate">{project.name}</span>
      </div>
      
      <div className={`flex space-x-1 transition-opacity ${isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEdit(e);
          }}
          className="p-1 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-md transition-colors duration-200"
        >
          <Edit className="w-4 h-4 text-slate-500" />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(e);
          }}
          className="p-1 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-md transition-colors duration-200"
        >
          <Trash2 className="w-4 h-4 text-slate-500" />
        </button>
      </div>
    </div>
  );
};

// Item for Drag Overlay (Presentational only)
const ProjectItemOverlay = ({ project }: { project: Project }) => {
    return (
        <div
          className="flex items-center justify-between p-2 rounded-xl bg-white dark:bg-slate-800 shadow-xl border border-indigo-200 dark:border-indigo-700 cursor-grabbing w-full"
        >
          <div className="flex items-center gap-2 flex-1 min-w-0">
             <div className="text-indigo-500">
                <GripVertical className="w-4 h-4" />
             </div>
             <span className="truncate font-medium text-gray-900 dark:text-white">{project.name}</span>
          </div>
        </div>
    );
};

const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  projects,
  onAddProjectClick,
  onEditProjectClick,
  onDeleteProjectRequest,
  onSelectProject,
  onReorderProjects,
  selectedProjectId,
}) => {
  const { theme, setTheme } = useTheme();
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = projects.findIndex((p) => p.id === active.id);
      const newIndex = projects.findIndex((p) => p.id === over.id);

      const newProjects = arrayMove(projects, oldIndex, newIndex);
      onReorderProjects(newProjects.map(p => p.id));
    }

    setActiveId(null);
  };
  
  const dropAnimation: DropAnimation = {
      sideEffects: defaultDropAnimationSideEffects({
        styles: {
          active: {
            opacity: '0.5',
          },
        },
      }),
  };

  const activeProject = activeId ? projects.find(p => p.id === activeId) : null;

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
        <div className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200 dark:shadow-none">
              <span className="text-white font-bold text-lg">P</span>
            </div>
            <div className="flex flex-col justify-center">
              <h1 className="text-[13px] font-black tracking-tighter text-slate-900 dark:text-white leading-[1.1]">
                <div>PLANNING</div>
                <div className="text-indigo-600 dark:text-indigo-400">JOURNEY</div>
              </h1>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-all duration-300 md:hidden">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>
        
        <nav className="flex-1 p-4 pt-0 space-y-2 overflow-y-auto">
          <div className="mt-4">
            <button
              onClick={onAddProjectClick}
              className="w-full text-left p-2 flex items-center justify-center text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-slate-700 hover:bg-indigo-100 dark:hover:bg-slate-600 rounded-xl transition-all duration-300 shadow-sm mb-4"
            >
              <Plus className="w-5 h-5 mr-2" />
              프로젝트 추가
            </button>
            
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
            >
              <SortableContext 
                items={projects.map(p => p.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-1">
                  {projects.map((project) => (
                    <SortableProjectItem
                      key={project.id}
                      project={project}
                      isSelected={selectedProjectId === project.id}
                      onSelect={() => onSelectProject(project.id)}
                      onEdit={() => onEditProjectClick(project)}
                      onDelete={() => onDeleteProjectRequest(project.id)}
                    />
                  ))}
                </div>
              </SortableContext>
              
              {createPortal(
                <DragOverlay dropAnimation={dropAnimation}>
                  {activeProject ? (
                    <ProjectItemOverlay project={activeProject} />
                  ) : null}
                </DragOverlay>,
                document.body
              )}
            </DndContext>
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