import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import DailyDetailForm from './DailyDetailForm';
import GoalSelectionBottomSheet from './GoalSelectionBottomSheet';
import TaskList from './TaskList'; // Import TaskList
import { db, Task } from '../db'; // Import Task interface

const DailyDetailArea: React.FC = () => {
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);
  const [currentTaskText, setCurrentTaskText] = useState('');
  const [selectedGoalId, setSelectedGoalId] = useState<number | null>(null);

  const tasks = useLiveQuery(() => db.tasks.orderBy('createdAt').toArray(), []);

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
      createdAt: new Date(),
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
    <div className="flex flex-col bg-slate-50 dark:bg-slate-900 flex-1">
      <div className="flex-1 p-4 overflow-y-auto">
        {/* 할 일 목록 표시 공간 */}
        <TaskList
          tasks={tasks || []}
          onEditTask={handleEditTask}
          onDeleteTask={handleDeleteTask}
          onToggleTaskComplete={handleToggleTaskComplete}
        />
      </div>
      <DailyDetailForm onAddTask={handleAddTask} />
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
