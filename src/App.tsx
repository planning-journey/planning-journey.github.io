import { useState } from 'react';
import Header from './components/Header';
import GoalManagementModal from './components/GoalManagementModal';
import GoalEditorModal from './components/GoalEditorModal';

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
    <div className="font-sans text-white min-h-screen bg-slate-900">
      <Header onOpenModal={openGoalManagementModal} />
      <main className="p-8">
        <h1 className="text-4xl font-bold">Welcome to Planning Journey</h1>
        <p className="text-slate-400 mt-2">Your journey starts here. Define your goals and track your progress.</p>
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
  );
}

export default App;