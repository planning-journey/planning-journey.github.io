import {useState, useCallback, useRef, useEffect} from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import Header from './components/Header';
import GoalManagementModal from './components/GoalManagementModal';
import GoalEditorModal from './components/GoalEditorModal';
import ConfirmDeleteModal from './components/ConfirmDeleteModal';
import OngoingGoalsHeader from './components/OngoingGoalsHeader';
import GoalDetailModal from './components/GoalDetailModal';
import DailyDetailArea from './components/DailyDetailArea';
import EvaluationHeader from './components/EvaluationHeader';
import DailyDetailForm from './components/DailyDetailForm'; // Import DailyDetailForm
import GoalSelectionBottomSheet from './components/GoalSelectionBottomSheet'; // Import GoalSelectionBottomSheet
import EvaluationOverlay from './components/EvaluationOverlay';
import Sidebar from './components/Sidebar'; // Import Sidebar component
import AddProjectModal from './components/AddProjectModal'; // Import AddProjectModal
import EditProjectModal from './components/EditProjectModal'; // Import EditProjectModal
import { ThemeProvider } from './contexts/ThemeContext';
import { db, type Goal, type Task } from './db';
import {formatDateToYYYYMMDD} from './utils/dateUtils.ts';
import type { Project } from './types/project'; // Import Project interface
import { v4 as uuidv4 } from 'uuid'; // Import uuid for unique IDs

// Helper function to check if two dates are in the same month and year
const isSameMonthYear = (d1: Date, d2: Date) => {
  return d1.getFullYear() === d2.getFullYear() &&
         d1.getMonth() === d2.getMonth();
};

function App() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [currentCalendarViewDate, setCurrentCalendarViewDate] = useState<Date>(new Date());
  const [todayScrollTrigger, setTodayScrollTrigger] = useState(0);
  const [showSidebar, setShowSidebar] = useState(false); // State for sidebar visibility

  const projects = useLiveQuery(() => db.projects.toArray(), []) || [];
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [isAddProjectModalOpen, setIsAddProjectModalOpen] = useState(false);
  const [isEditProjectModalOpen, setIsEditProjectModalOpen] = useState(false);
  const [projectToEdit, setProjectToEdit] = useState<Project | null>(null);

  // Migration Effect from localStorage to IndexedDB
  useEffect(() => {
    const migrateProjects = async () => {
      const savedProjects = localStorage.getItem('projects');
      if (savedProjects) {
        const parsedProjects: Project[] = JSON.parse(savedProjects);
        if (parsedProjects.length > 0) {
          await db.projects.bulkAdd(parsedProjects);
          localStorage.removeItem('projects');
          console.log('Migrated projects from localStorage to IndexedDB.');
        }
      }
    };
    migrateProjects();
  }, []);

  // Effect to manage selected project
  useEffect(() => {
    if (projects.length > 0 && !selectedProjectId) {
      setSelectedProjectId(projects[0].id); // Select the first project by default
    } else if (projects.length === 0) {
      setSelectedProjectId(null); // No projects, no selection
    }
  }, [projects, selectedProjectId]);

  // Project Management States



  const goals = useLiveQuery(() => db.goals.toArray());
  const tasks = useLiveQuery(() => db.tasks.toArray());
  const dailyEvaluations = useLiveQuery(() => db.dailyEvaluations.toArray());
  const hasEvaluation = useLiveQuery(async () => {
    if (!selectedProjectId) return false;
    const formatted = formatDateToYYYYMMDD(selectedDate);
    const evaluation = await db.dailyEvaluations
      .where({ date: formatted, projectId: selectedProjectId })
      .first();
    return !!evaluation && !!evaluation.evaluationText && evaluation.evaluationText.trim().length > 0;
  }, [selectedDate, selectedProjectId]);

  const [isGoalManagementModalOpen, setGoalManagementModalOpen] = useState(false);
  const [isGoalEditorModalOpen, setGoalEditorModalOpen] = useState(false);
  const [isConfirmDeleteModalOpen, setConfirmDeleteModalOpen] = useState(false);
  const [isGoalDetailModalOpen, setGoalDetailModalOpen] = useState(false);

  const [goalToEdit, setGoalToEdit] = useState<Goal | null>(null);
  const [goalToDeleteId, setGoalToDeleteId] = useState<string | null>(null); // Changed to string for project/goal IDs
  const [projectToDeleteId, setProjectToDeleteId] = useState<string | null>(null); // New state for project deletion
  const [goalForDetail, setGoalForDetail] = useState<Goal | null>(null);
  const [isEvaluationOverlayOpen, setIsEvaluationOverlayOpen] = useState(false);



  // States lifted from DailyDetailArea
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);
  const [currentTaskText, setCurrentTaskText] = useState('');
  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(null);
  const dailyDetailFormInputRef = useRef<HTMLInputElement>(null);
  const stickyHeaderRef = useRef<HTMLDivElement>(null);
  const dailyDetailFormWrapperRef = useRef<HTMLDivElement>(null);

  const [toastMessage, setToastMessage] = useState('');
  const [isToastVisible, setIsToastVisible] = useState(false);

  // New state for scrolling
  const [latestAddedTaskId, setLatestAddedTaskId] = useState<string | null>(null);
  const [stickyHeaderHeight, setStickyHeaderHeight] = useState(0);
  const [dailyDetailFormHeight, setDailyDetailFormHeight] = useState(0);

  const showToast = useCallback((message: string) => {
    setToastMessage(message);
    setIsToastVisible(true);
    const timer = setTimeout(() => {
      setIsToastVisible(false);
      setToastMessage('');
    }, 3000); // 3 seconds
    return () => clearTimeout(timer);
  }, []);

  const formattedSelectedDate = formatDateToYYYYMMDD(selectedDate); // Define formattedSelectedDate here

  // Project Management Handlers
  const handleAddProject = useCallback(async (name: string) => {
    const newProject: Project = { id: uuidv4(), name };
    await db.projects.add(newProject);
    setSelectedProjectId(newProject.id); // Select the newly added project
    showToast(`'${name}' 프로젝트가 추가되었습니다.`);
  }, [showToast]);

  const handleEditProject = useCallback(async (id: string, newName: string) => {
    await db.projects.update(id, { name: newName });
    showToast(`프로젝트가 '${newName}'으로 수정되었습니다.`);
  }, [showToast]);



  const handleSelectProject = useCallback((id: string) => {
    setSelectedProjectId(id);
    setShowSidebar(false); // Close sidebar on project selection
  }, []);

  const addOrUpdateTask = useCallback(async (title: string, goalId: string | null | undefined, date: string) => {
    const existingTasks = await db.tasks
      .where({ date: date, projectId: selectedProjectId as string })
      .toArray();

    const maxOrder = existingTasks.length > 0
      ? Math.max(...existingTasks.map(task => task.order))
      : -1; // Start with -1 so first task gets order 0

    const newTask: Task = {
      id: uuidv4(), // Generate unique ID
      title: title,
      goalId: goalId === null ? undefined : goalId, // Assign undefined if null
      completed: false,
      date: date,
      createdAt: new Date(),
      projectId: selectedProjectId as string, // Assign current selected project ID
      order: maxOrder + 1, // Assign order
    };
    await db.tasks.add(newTask);
    setLatestAddedTaskId(newTask.id); // Set the ID of the newly added task
    setCurrentTaskText('');
    if (dailyDetailFormInputRef.current) {
      dailyDetailFormInputRef.current.focus();
    }
  }, [dailyDetailFormInputRef, selectedProjectId]);

  useEffect(() => {
    if (stickyHeaderRef.current) {
      setStickyHeaderHeight(stickyHeaderRef.current.offsetHeight);
    }
    if (dailyDetailFormWrapperRef.current) {
      setDailyDetailFormHeight(dailyDetailFormWrapperRef.current.offsetHeight);
    }
  }, [goals, selectedDate, currentCalendarViewDate, todayScrollTrigger]);
  const handleClearScrollToTask = useCallback(() => {
    setLatestAddedTaskId(null);
  }, []);

  const handleAddTask = useCallback(async (text: string) => {
    setCurrentTaskText(text); // Store the text for later use

    if (!goals || goals.length === 0) { // Check if goals array is empty
      await addOrUpdateTask(text, undefined, formattedSelectedDate);
      showToast('목표가 없습니다'); // Display toast message
    } else {
      setIsBottomSheetOpen(true); // Open bottom sheet if goals exist
    }
  }, [goals, addOrUpdateTask, showToast, formattedSelectedDate]);

  const handleSelectGoal = useCallback((goalId: string | null) => {
    setSelectedGoalId(goalId);
    setIsBottomSheetOpen(false);
    addOrUpdateTask(currentTaskText, goalId, formattedSelectedDate);
  }, [currentTaskText, formattedSelectedDate, addOrUpdateTask]);

  const handleDateSelect = useCallback((date: Date) => {
    setSelectedDate(date);
    setCurrentCalendarViewDate(date);
  }, [handleSelectProject]);

  const handleCalendarViewChange = useCallback((date: Date) => {
    if (!isSameMonthYear(date, currentCalendarViewDate)) {
      setCurrentCalendarViewDate(date);
    }
  }, [currentCalendarViewDate]);

  const handleSelectToday = useCallback(() => {
    setSelectedDate(new Date());
    setCurrentCalendarViewDate(new Date());
    setTodayScrollTrigger(prev => prev + 1);
  }, []);

  const openGoalManagementModal = () => setGoalManagementModalOpen(true);
  const closeGoalManagementModal = () => {
    setGoalManagementModalOpen(false);
    setGoalToEdit(null);
  };

  const openNewGoalEditorModal = () => {
    setGoalToEdit(null);
    setGoalManagementModalOpen(false);
    setGoalEditorModalOpen(true);
  };

  const openEditGoalEditorModal = (goal: Goal) => {
    setGoalToEdit(goal);
    setGoalManagementModalOpen(false);
    setGoalEditorModalOpen(true);
  };

  const closeGoalEditorModal = () => {
    setGoalEditorModalOpen(false);
    setGoalToEdit(null);
    setGoalManagementModalOpen(true);
  };

  const openConfirmDeleteModal = (id: string) => {
    setGoalToDeleteId(id);
    setConfirmDeleteModalOpen(true);
  };

  const closeConfirmDeleteModal = () => {
    setConfirmDeleteModalOpen(false);
    setGoalToDeleteId(null);
    setProjectToDeleteId(null); // Clear project to delete ID
  };

  const openGoalDetailModal = (goal: Goal) => {
    setGoalForDetail(goal);
    setGoalDetailModalOpen(true);
  };

  const closeGoalDetailModal = () => {
    setGoalDetailModalOpen(false);
    setGoalForDetail(null);
  };

  const openEvaluationOverlay = () => {
    setIsEvaluationOverlayOpen(true);
  };

  const closeEvaluationOverlay = () => {
    setIsEvaluationOverlayOpen(false);
  };

  const handleConfirmDelete = async () => {
    if (goalToDeleteId !== null) {
      try {
        await db.goals.delete(goalToDeleteId);
        showToast('목표가 삭제되었습니다.');
        closeConfirmDeleteModal();
      } catch (error) {
        console.error("Failed to delete goal: ", error);
        showToast('목표 삭제에 실패했습니다.');
      }
    } else if (projectToDeleteId !== null) {
      try {
        // Delete project
        await db.projects.delete(projectToDeleteId);
        // Delete associated goals
        await db.goals.where({ projectId: projectToDeleteId }).delete();
        // Delete associated tasks
        await db.tasks.where({ projectId: projectToDeleteId }).delete();
        // Delete associated daily evaluations
        await db.dailyEvaluations.where({ projectId: projectToDeleteId }).delete();

        showToast('프로젝트 및 모든 관련 데이터가 삭제되었습니다.');
        closeConfirmDeleteModal();
      } catch (error) {
        console.error("Failed to delete project and associated data: ", error);
        showToast('프로젝트 삭제에 실패했습니다.');
      }
    }
  };

  const toggleSidebar = useCallback(() => {
    setShowSidebar(prev => !prev);
  }, []);

  const selectedProject = projects.find(p => p.id === selectedProjectId);
  const selectedProjectName = selectedProject ? selectedProject.name : null;

  return (
    <ThemeProvider>
      <div className="text-gray-900 dark:text-white min-h-screen bg-gray-100 dark:bg-slate-900 flex">
        <Sidebar
          isOpen={showSidebar}
          onClose={() => setShowSidebar(false)}
          projects={projects}
          onAddProjectClick={() => setIsAddProjectModalOpen(true)}
          onEditProjectClick={(project) => {
            setProjectToEdit(project);
            setIsEditProjectModalOpen(true);
          }}
          onDeleteProjectRequest={(projectId) => {
            setProjectToDeleteId(projectId);
            setConfirmDeleteModalOpen(true);
          }}
          onSelectProject={handleSelectProject}
          selectedProjectId={selectedProjectId}
        />

        {selectedProjectId ? (
          <div className="flex-1 flex flex-col md:pl-64"> {/* Main content area */}
            <div ref={stickyHeaderRef} className="sticky top-0 z-10">
              <Header
                onOpenModal={openGoalManagementModal}
                onDateSelect={handleDateSelect}
                currentCalendarViewDate={currentCalendarViewDate}
                onCalendarViewChange={handleCalendarViewChange}
                onSelectToday={handleSelectToday}
                selectedDate={selectedDate}
                todayScrollTrigger={todayScrollTrigger}
                allGoals={goals || []}
                allTasks={tasks || []}
                allDailyEvaluations={dailyEvaluations || []}
                onToggleSidebar={toggleSidebar} // Pass toggle function to Header
                selectedProjectName={selectedProjectName}
                selectedProjectId={selectedProjectId}
              />
              <OngoingGoalsHeader
                goals={goals}
                selectedDate={selectedDate}
                onGoalSelect={openGoalDetailModal}
                selectedProjectId={selectedProjectId}
              />
            </div>

            <main className="flex-1 overflow-y-auto flex flex-col items-stretch">
              <DailyDetailArea
                formattedSelectedDate={formattedSelectedDate}
                scrollToTaskId={latestAddedTaskId}
                onClearScrollToTask={handleClearScrollToTask}
                selectedProjectId={selectedProjectId} // Pass selected project ID
              />
            </main>

            <div ref={dailyDetailFormWrapperRef} className="sticky bottom-0 z-10 bg-white dark:bg-slate-900 shadow-lg">
              <DailyDetailForm onAddTask={handleAddTask} selectedDate={selectedDate} ref={dailyDetailFormInputRef} />
              <EvaluationHeader stickyHeaderHeight={stickyHeaderHeight} dailyDetailFormHeight={dailyDetailFormHeight} hasEvaluation={hasEvaluation || false} onOpenEvaluationOverlay={openEvaluationOverlay} />
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500 dark:text-slate-400 text-lg md:pl-64">
            프로젝트를 생성하거나 선택하세요.
          </div>
        )}

        <GoalManagementModal
          isOpen={isGoalManagementModalOpen}
          onClose={closeGoalManagementModal}
          onAddNewGoal={openNewGoalEditorModal}
          onEditGoal={openEditGoalEditorModal}
          onDeleteGoal={openConfirmDeleteModal}
          selectedProjectId={selectedProjectId}
        />
        <GoalEditorModal
          isOpen={isGoalEditorModalOpen}
          onClose={closeGoalEditorModal}
          goalToEdit={goalToEdit}
          selectedProjectId={selectedProjectId}
        />
        <ConfirmDeleteModal
          isOpen={isConfirmDeleteModalOpen}
          onClose={closeConfirmDeleteModal}
          onConfirm={handleConfirmDelete}
        />
        <GoalDetailModal
          isOpen={isGoalDetailModalOpen}
          onClose={closeGoalDetailModal}
          goal={goalForDetail}
        />
        <GoalSelectionBottomSheet
          isOpen={isBottomSheetOpen}
          onClose={() => setIsBottomSheetOpen(false)}
          onSelectGoal={handleSelectGoal}
          selectedGoalId={selectedGoalId}
          selectedDate={selectedDate}
          selectedProjectId={selectedProjectId}
        />
        {isToastVisible && (
          <div className="fixed bottom-4 left-1/2 -translate-x-1/2 p-3 bg-gray-800 text-white rounded-xl shadow-lg transition-all duration-300 z-50">
            {toastMessage}
          </div>
        )}
        {/* Evaluation Overlay */}
        <EvaluationOverlay
          isOpen={isEvaluationOverlayOpen}
          onClose={closeEvaluationOverlay}
          selectedDate={selectedDate}
          hasEvaluation={hasEvaluation || false}
          selectedProjectId={selectedProjectId}
        />
        {/* Project Modals */}
        <AddProjectModal
          isOpen={isAddProjectModalOpen}
          onClose={() => setIsAddProjectModalOpen(false)}
          onAddProject={handleAddProject}
        />
        {projectToEdit && (
          <EditProjectModal
            isOpen={isEditProjectModalOpen}
            onClose={() => setIsEditProjectModalOpen(false)}
            onEditProject={(id, newName) => handleEditProject(id, newName)}
            projectId={projectToEdit.id}
            projectName={projectToEdit.name}
          />
        )}
      </div>
    </ThemeProvider>
  );
}

export default App;
