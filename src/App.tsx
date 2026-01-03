import { useState } from 'react';
import Header from './components/Header';
import GoalManagementModal from './components/GoalManagementModal';
import GoalEditorModal from './components/GoalEditorModal';
import { ThemeProvider } from './contexts/ThemeContext'; // Import ThemeProvider

function App() {
  const [isGoalManagementModalOpen, setGoalManagementModalOpen] = useState(false);
  const [isGoalEditorModalOpen, setGoalEditorModalOpen] = useState(false);

  const openGoalManagementModal = () => setGoalManagementModalOpen(true);
  const closeGoalManagementModal = () => setGoalManagementModalOpen(false);

  const openGoalEditorModal = () => {
    setGoalManagementModalOpen(false); // Close management modal
    setGoalEditorModalOpen(true);
  };
  const closeGoalEditorModal = () => {
    setGoalEditorModalOpen(false);
    setGoalManagementModalOpen(true); // Re-open management modal
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
          onAddNewGoal={openGoalEditorModal}
        />
        <GoalEditorModal 
          isOpen={isGoalEditorModalOpen} 
          onClose={closeGoalEditorModal}
        />
      </div>
    </ThemeProvider>
  );
}

export default App;