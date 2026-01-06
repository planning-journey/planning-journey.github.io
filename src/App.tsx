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
import { ThemeProvider } from './contexts/ThemeContext';
import { db, type Goal, type Task } from './db';
import {formatDateToYYYYMMDD} from './utils/dateUtils.ts';

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

  const goals = useLiveQuery(() => db.goals.toArray());
  const tasks = useLiveQuery(() => db.tasks.toArray());
  const dailyEvaluations = useLiveQuery(() => db.dailyEvaluations.toArray());
  const hasEvaluation = useLiveQuery(async () => {
    const formatted = formatDateToYYYYMMDD(selectedDate);
    const evaluation = await db.dailyEvaluations.get(formatted);
    return !!evaluation && !!evaluation.evaluationText && evaluation.evaluationText.trim().length > 0;
  }, [selectedDate]);

  const [isGoalManagementModalOpen, setGoalManagementModalOpen] = useState(false);
  const [isGoalEditorModalOpen, setGoalEditorModalOpen] = useState(false);
  const [isConfirmDeleteModalOpen, setConfirmDeleteModalOpen] = useState(false);
  const [isGoalDetailModalOpen, setGoalDetailModalOpen] = useState(false);

  const [goalToEdit, setGoalToEdit] = useState<Goal | null>(null);
  const [goalToDeleteId, setGoalToDeleteId] = useState<number | null>(null);
  const [goalForDetail, setGoalForDetail] = useState<Goal | null>(null);
  const [isEvaluationOverlayOpen, setIsEvaluationOverlayOpen] = useState(false);



  // States lifted from DailyDetailArea
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);
  const [currentTaskText, setCurrentTaskText] = useState('');
  const [selectedGoalId, setSelectedGoalId] = useState<number | null>(null);
  const dailyDetailFormInputRef = useRef<HTMLInputElement>(null);
  const stickyHeaderRef = useRef<HTMLDivElement>(null);
  const dailyDetailFormWrapperRef = useRef<HTMLDivElement>(null);

  const [toastMessage, setToastMessage] = useState('');
  const [isToastVisible, setIsToastVisible] = useState(false);

  // New state for scrolling
  const [latestAddedTaskId, setLatestAddedTaskId] = useState<number | null>(null);
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

  const addOrUpdateTask = useCallback(async (text: string, goalId: number | null, date: string) => {
    const newTask: Task = {
      text: text,
      goalId: goalId,
      completed: false,
      date: date,
      createdAt: new Date(),
    };
    const newTaskId = await db.tasks.add(newTask);
    setLatestAddedTaskId(newTaskId); // Set the ID of the newly added task
    setCurrentTaskText('');
    if (dailyDetailFormInputRef.current) {
      dailyDetailFormInputRef.current.focus();
    }
  }, [dailyDetailFormInputRef]);

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
      await addOrUpdateTask(text, null, formattedSelectedDate);
      showToast('목표가 없습니다'); // Display toast message
    } else {
      setIsBottomSheetOpen(true); // Open bottom sheet if goals exist
    }
  }, [goals, addOrUpdateTask, showToast, formattedSelectedDate]);

  const handleSelectGoal = useCallback(async (goalId: number | null) => {
    setSelectedGoalId(goalId);
    setIsBottomSheetOpen(false);
    await addOrUpdateTask(currentTaskText, goalId, formattedSelectedDate);
  }, [currentTaskText, formattedSelectedDate, addOrUpdateTask]);

  const handleDateSelect = useCallback((date: Date) => {
    setSelectedDate(date);
    setCurrentCalendarViewDate(date);
  }, []);

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

  const openConfirmDeleteModal = (id: number) => {
    setGoalToDeleteId(id);
    setConfirmDeleteModalOpen(true);
  };

  const closeConfirmDeleteModal = () => {
    setConfirmDeleteModalOpen(false);
    setGoalToDeleteId(null);
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
        closeConfirmDeleteModal();
      } catch (error) {
        console.error("Failed to delete goal: ", error);
      }
    }
  };

  const toggleSidebar = useCallback(() => {
    setShowSidebar(prev => !prev);
  }, []);

  return (
    <ThemeProvider>
      <div className="font-sans text-gray-900 dark:text-white min-h-screen bg-gray-100 dark:bg-slate-900 flex">
        <Sidebar isOpen={showSidebar} onClose={() => setShowSidebar(false)} />

        <div className="flex-1 flex flex-col overflow-hidden"> {/* Main content area */}
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
            />
            <OngoingGoalsHeader
              goals={goals}
              selectedDate={selectedDate}
              onGoalSelect={openGoalDetailModal}
            />
          </div>

          <main className="flex-1 overflow-y-auto flex flex-col items-stretch">
            <DailyDetailArea
              formattedSelectedDate={formattedSelectedDate}
              scrollToTaskId={latestAddedTaskId}
              onClearScrollToTask={handleClearScrollToTask}
            />
          </main>

          <div ref={dailyDetailFormWrapperRef} className="sticky bottom-0 z-10 bg-white dark:bg-slate-900 shadow-lg">
            <DailyDetailForm onAddTask={handleAddTask} selectedDate={selectedDate} ref={dailyDetailFormInputRef} />
            <EvaluationHeader stickyHeaderHeight={stickyHeaderHeight} dailyDetailFormHeight={dailyDetailFormHeight} hasEvaluation={hasEvaluation || false} onOpenEvaluationOverlay={openEvaluationOverlay} />
          </div>
        </div>

        <GoalManagementModal
          isOpen={isGoalManagementModalOpen}
          onClose={closeGoalManagementModal}
          onAddNewGoal={openNewGoalEditorModal}
          onEditGoal={openEditGoalEditorModal}
          onDeleteGoal={openConfirmDeleteModal}
        />
        <GoalEditorModal
          isOpen={isGoalEditorModalOpen}
          onClose={closeGoalEditorModal}
          goalToEdit={goalToEdit}
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
        />
      </div>
    </ThemeProvider>
  );
}

export default App;
