import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import DailyDetailForm from './DailyDetailForm';
import GoalSelectionBottomSheet from './GoalSelectionBottomSheet';
import TaskList from './TaskList'; // Import TaskList
import { db, Task } from '../db'; // Import Task interface

interface DailyDetailAreaProps {
  selectedDate: Date;
}

const DailyDetailArea: React.FC<DailyDetailAreaProps> = ({ selectedDate }) => {
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);
  const [currentTaskText, setCurrentTaskText] = useState('');
  const [selectedGoalId, setSelectedGoalId] = useState<number | null>(null);

  const startOfDay = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());
  const endOfDay = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate() + 1, -1); // End of the selected day

  const tasks = useLiveQuery(() =>
    db.tasks
      .where('createdAt')
      .between(startOfDay, endOfDay, true, true)
      .toArray(),
    [selectedDate] // Re-run query when selectedDate changes
  );

  const handleAddTask = (text: string) => {
    setCurrentTaskText(text);
    setIsBottomSheetOpen(true);
  };

  const handleSelectGoal = async (goalId: number | null) => {
    setSelectedGoalId(goalId);
    setIsBottomSheetOpen(false);

    const newTask: Task = {
      text: currentTaskText,
      goalId: goalId,
      completed: false,
      createdAt: selectedDate, // Use the selectedDate for new tasks
    };
    await db.tasks.add(newTask);
    setCurrentTaskText(''); // Clear current task text after adding
  };

  const handleEditTask = (task: Task) => {
    // TODO: Implement task editing functionality (e.g., open a modal)
    console.log('Edit task:', task);
  };

  const handleDeleteTask = async (taskId: number) => {
    await db.tasks.delete(taskId);
  };

  const handleToggleTaskComplete = async (taskId: number, completed: boolean) => {
    await db.tasks.update(taskId, { completed });
  };

  return (
    <div className="flex flex-col bg-white dark:bg-slate-800 flex-1">
      <div className="flex-1 overflow-y-auto">
        {/* 할 일 목록 표시 공간 */}
        <TaskList
          tasks={tasks || []}
          onEditTask={handleEditTask}
          onDeleteTask={handleDeleteTask}
          onToggleTaskComplete={handleToggleTaskComplete}
        />
      </div>
      <DailyDetailForm onAddTask={handleAddTask} selectedDate={selectedDate} />
      <GoalSelectionBottomSheet
        isOpen={isBottomSheetOpen}
        onClose={() => setIsBottomSheetOpen(false)}
        onSelectGoal={handleSelectGoal}
        selectedGoalId={selectedGoalId}
      />
    </div>
  );
};

export default DailyDetailArea;
