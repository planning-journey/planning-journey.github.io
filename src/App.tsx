import { useState } from 'react';
import Header from './components/Header';
import GoalManagementModal from './components/GoalManagementModal';

function App() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="font-sans text-white">
      <Header onOpenModal={() => setIsModalOpen(true)} />
      <main className="p-8">
        <h1 className="text-4xl font-bold">Welcome to Planning Journey</h1>
        <p className="text-slate-400 mt-2">Your journey starts here. Define your goals and track your progress.</p>
      </main>
      <GoalManagementModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}

export default App;