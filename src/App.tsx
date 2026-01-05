import { useState, useCallback } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import Header from './components/Header';
import GoalManagementModal from './components/GoalManagementModal';
import GoalEditorModal from './components/GoalEditorModal';
import ConfirmDeleteModal from './components/ConfirmDeleteModal';
import OngoingGoalsHeader from './components/OngoingGoalsHeader';
import GoalDetailModal from './components/GoalDetailModal';
import DailyDetailForm from './components/DailyDetailForm'; // Import new form component
import EvaluationHeader from './components/EvaluationHeader'; // Import new evaluation component
import { ThemeProvider } from './contexts/ThemeContext';
import { db, type Goal } from './db';

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

  const handleDateSelect = useCallback((date: Date) => {
    setSelectedDate(date);
    setCurrentCalendarViewDate(date);
  }, []); // Empty dependency array as setters are stable

  const handleCalendarViewChange = useCallback((date: Date) => {
    // Only update if the month/year is actually different
    if (!isSameMonthYear(date, currentCalendarViewDate)) {
      setCurrentCalendarViewDate(date);
    }
  }, [currentCalendarViewDate]); // Dependency on currentCalendarViewDate to ensure accurate comparison

  const handleSelectToday = useCallback(() => {
    setSelectedDate(new Date());
    setCurrentCalendarViewDate(new Date());
    setTodayScrollTrigger(prev => prev + 1);
  }, []); // Empty dependency array as setters are stable

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
        <Header 
          onOpenModal={openGoalManagementModal} 
          onDateSelect={handleDateSelect} 
          currentCalendarViewDate={currentCalendarViewDate}
          onCalendarViewChange={handleCalendarViewChange}
          onSelectToday={handleSelectToday}
          selectedDate={selectedDate}
          todayScrollTrigger={todayScrollTrigger}
        />
        <main className="flex-grow overflow-y-auto"> {/* Main content area takes remaining space and scrolls */}
          <OngoingGoalsHeader 
            goals={goals} 
            selectedDate={selectedDate} 
            onGoalSelect={openGoalDetailModal} 
          />
          <div className="flex-grow p-4"> {/* Daily Detail Area */}
            {/* Daily tasks will be listed here */}
            <h1 className="text-4xl font-bold text-gray-800 dark:text-white">Welcome to Planning Journey</h1>
            <p className="text-gray-600 dark:text-slate-400 mt-2">Your journey starts here. Define your goals and track your progress.</p>
          </div>
        </main>
        
        {/* Fixed bottom section for DailyDetailForm and EvaluationHeader */}
        <div className="sticky bottom-0 z-10 bg-white dark:bg-slate-900 shadow-lg">
          <DailyDetailForm />
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
      </div>
    </ThemeProvider>
  );
}

export default App;