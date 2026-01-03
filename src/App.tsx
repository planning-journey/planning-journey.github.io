import { useState } from 'react';
import Header from './components/Header';
import GoalManagementModal from './components/GoalManagementModal';
import GoalEditorModal from './components/GoalEditorModal';
import ConfirmDeleteModal from './components/ConfirmDeleteModal'; // New: Import ConfirmDeleteModal
import { ThemeProvider } from './contexts/ThemeContext';
import { db, type Goal } from './db'; // New: Import db and Goal type

function App() {
  const [isGoalManagementModalOpen, setGoalManagementModalOpen] = useState(false);
  const [isGoalEditorModalOpen, setGoalEditorModalOpen] = useState(false);
  const [isConfirmDeleteModalOpen, setConfirmDeleteModalOpen] = useState(false); // New: State for delete confirmation modal

  const [goalToEdit, setGoalToEdit] = useState<Goal | null>(null); // New: State for goal being edited
  const [goalToDeleteId, setGoalToDeleteId] = useState<number | null>(null); // New: State for goal ID to delete

  const openGoalManagementModal = () => setGoalManagementModalOpen(true);
  const closeGoalManagementModal = () => {
    setGoalManagementModalOpen(false);
    setGoalToEdit(null); // Clear goalToEdit when closing management modal
  };

  const openNewGoalEditorModal = () => { // New: Function to open editor for new goal
    setGoalToEdit(null); // Ensure no goal is being edited
    setGoalManagementModalOpen(false);
    setGoalEditorModalOpen(true);
  };

  const openEditGoalEditorModal = (goal: Goal) => { // New: Function to open editor for existing goal
    setGoalToEdit(goal);
    setGoalManagementModalOpen(false);
    setGoalEditorModalOpen(true);
  };

  const closeGoalEditorModal = () => {
    setGoalEditorModalOpen(false);
    setGoalToEdit(null); // Clear goalToEdit after closing editor
    setGoalManagementModalOpen(true); // Re-open management modal
  };

  const openConfirmDeleteModal = (id: number) => { // New: Function to open delete confirmation
    setGoalToDeleteId(id);
    setConfirmDeleteModalOpen(true);
  };

  const closeConfirmDeleteModal = () => { // New: Function to close delete confirmation
    setConfirmDeleteModalOpen(false);
    setGoalToDeleteId(null);
  };

  const handleConfirmDelete = async () => { // New: Function to handle actual deletion
    if (goalToDeleteId !== null) {
      try {
        await db.goals.delete(goalToDeleteId);
        closeConfirmDeleteModal();
      } catch (error) {
        console.error("Failed to delete goal: ", error);
        // Optionally, show an error message
      }
    }
  };

  return (
    <ThemeProvider>
      <div className="font-sans text-gray-900 dark:text-white min-h-screen bg-gray-100 dark:bg-slate-900">
        <Header onOpenModal={openGoalManagementModal} />
        <main className="p-8">
          <h1 className="text-4xl font-bold text-gray-800 dark:text-white">Welcome to Planning Journey</h1>
          <p className="text-gray-600 dark:text-slate-400 mt-2">Your journey starts here. Define your goals and track your progress.</p>
        </main>
        
        <GoalManagementModal 
          isOpen={isGoalManagementModalOpen} 
          onClose={closeGoalManagementModal}
          onAddNewGoal={openNewGoalEditorModal} // Updated to new function
          onEditGoal={openEditGoalEditorModal} // New prop
          onDeleteGoal={openConfirmDeleteModal} // New prop
        />
        <GoalEditorModal 
          isOpen={isGoalEditorModalOpen} 
          onClose={closeGoalEditorModal}
          goalToEdit={goalToEdit} // New prop
        />
        <ConfirmDeleteModal
          isOpen={isConfirmDeleteModalOpen}
          onClose={closeConfirmDeleteModal}
          onConfirm={handleConfirmDelete}
        />
      </div>
    </ThemeProvider>
  );
}

export default App;