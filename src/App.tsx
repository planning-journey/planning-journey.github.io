import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import Header from './components/Header';
import GoalManagementModal from './components/GoalManagementModal';
import GoalEditorModal from './components/GoalEditorModal';
import ConfirmDeleteModal from './components/ConfirmDeleteModal';
import OngoingGoalsHeader from './components/OngoingGoalsHeader';
import GoalDetailModal from './components/GoalDetailModal'; // Import the new modal
import { ThemeProvider } from './contexts/ThemeContext';
import { db, type Goal } from './db';

function App() {
  const goals = useLiveQuery(() => db.goals.toArray());

  const [isGoalManagementModalOpen, setGoalManagementModalOpen] = useState(false);
  const [isGoalEditorModalOpen, setGoalEditorModalOpen] = useState(false);
  const [isConfirmDeleteModalOpen, setConfirmDeleteModalOpen] = useState(false);
  const [isGoalDetailModalOpen, setGoalDetailModalOpen] = useState(false); // State for new modal

  const [goalToEdit, setGoalToEdit] = useState<Goal | null>(null);
  const [goalToDeleteId, setGoalToDeleteId] = useState<number | null>(null);
  const [goalForDetail, setGoalForDetail] = useState<Goal | null>(null); // State for goal to show in detail
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [currentMonthYear, setCurrentMonthYear] = useState('');
  const [todayScrollTrigger, setTodayScrollTrigger] = useState(0);

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
  };

  const handleMonthYearChange = (monthYear: string) => {
    setCurrentMonthYear(monthYear);
  };

  const handleSelectToday = () => {
    setSelectedDate(new Date());
    setTodayScrollTrigger(prev => prev + 1);
  };

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

  // Handlers for GoalDetailModal
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
      <div className="font-sans text-gray-900 dark:text-white min-h-screen bg-gray-100 dark:bg-slate-900">
        <Header 
          onOpenModal={openGoalManagementModal} 
          onDateSelect={handleDateSelect} 
          currentMonthYear={currentMonthYear}
          onMonthYearChange={handleMonthYearChange}
          onSelectToday={handleSelectToday}
          selectedDate={selectedDate}
          todayScrollTrigger={todayScrollTrigger}
        />
        <main>
          <OngoingGoalsHeader 
            goals={goals} 
            selectedDate={selectedDate} 
            onGoalSelect={openGoalDetailModal} 
          />
          <div>
            <h1 className="text-4xl font-bold text-gray-800 dark:text-white">Welcome to Planning Journey</h1>
            <p className="text-gray-600 dark:text-slate-400 mt-2">Your journey starts here. Define your goals and track your progress.</p>
          </div>
        </main>
        
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