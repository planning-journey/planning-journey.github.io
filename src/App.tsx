import { useState, useCallback } from 'react';
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
import { ThemeProvider } from './contexts/ThemeContext';
import { db, type Goal, type Task } from './db';
import { formatDateToYYYYMMDD } from './utils/dateUtils'; // Import formatDateToYYYYMMDD

// Helper function to check if two dates are in the same month and year
const isSameMonthYear = (d1: Date, d2: Date) => {
  return d1.getFullYear() === d2.getFullYear() &&
         d1.getMonth() === d2.getMonth();
};

function App() {
  const goals = useLiveQuery(() => db.goals.toArray());

  const [isGoalManagementModalOpen, setGoalManagementModalOpen] = useState(false);
  const [isGoalEditorModalOpen, setGoalEditorModalOpen] = useState(false);
  const [isConfirmDeleteModalOpen, setConfirmDeleteModalOpen] = useState(false);
  const [isGoalDetailModalOpen, setGoalDetailModalOpen] = useState(false);

  const [goalToEdit, setGoalToEdit] = useState<Goal | null>(null);
  const [goalToDeleteId, setGoalToDeleteId] = useState<number | null>(null);
  const [goalForDetail, setGoalForDetail] = useState<Goal | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [currentCalendarViewDate, setCurrentCalendarViewDate] = useState<Date>(new Date());
  const [todayScrollTrigger, setTodayScrollTrigger] = useState(0);

  // States lifted from DailyDetailArea
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);
  const [currentTaskText, setCurrentTaskText] = useState('');
  const [selectedGoalId, setSelectedGoalId] = useState<number | null>(null);

  const formattedSelectedDate = formatDateToYYYYMMDD(selectedDate); // Define formattedSelectedDate here

  const handleAddTask = useCallback((text: string) => {
    setCurrentTaskText(text);
    setIsBottomSheetOpen(true);
  }, []);

  const handleSelectGoal = useCallback(async (goalId: number | null) => {
    setSelectedGoalId(goalId);
    setIsBottomSheetOpen(false);

    const newTask: Task = {
      text: currentTaskText,
      goalId: goalId,
      completed: false,
      date: formattedSelectedDate,
      createdAt: new Date(),
    };
    await db.tasks.add(newTask);
    setCurrentTaskText('');
  }, [currentTaskText, formattedSelectedDate]);

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

  return (
    <ThemeProvider>
      <div className="font-sans text-gray-900 dark:text-white min-h-screen bg-gray-100 dark:bg-slate-900 flex flex-col">
        <div className="sticky top-0 z-10">
          <Header
            onOpenModal={openGoalManagementModal}
            onDateSelect={handleDateSelect}
            currentCalendarViewDate={currentCalendarViewDate}
            onCalendarViewChange={handleCalendarViewChange}
            onSelectToday={handleSelectToday}
            selectedDate={selectedDate}
            todayScrollTrigger={todayScrollTrigger}
          />
          <OngoingGoalsHeader
            goals={goals}
            selectedDate={selectedDate}
            onGoalSelect={openGoalDetailModal}
          />
        </div>

        <main className="flex-1 overflow-y-auto flex flex-col items-stretch">
          <DailyDetailArea selectedDate={selectedDate} formattedSelectedDate={formattedSelectedDate} />
        </main>

        <div className="sticky bottom-0 z-10 bg-white dark:bg-slate-900 shadow-lg">
          {/* DailyDetailForm moved here, before EvaluationHeader */}
          <DailyDetailForm onAddTask={handleAddTask} selectedDate={selectedDate} />
          <EvaluationHeader />
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
      </div>
    </ThemeProvider>
  );
}

export default App;
