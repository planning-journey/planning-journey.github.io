import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import DailyDetailForm from './DailyDetailForm';
import GoalSelectionBottomSheet from './GoalSelectionBottomSheet';
import TaskList from './TaskList'; // Import TaskList
import { db, type Task } from '../db';
import TaskEditorModal from './TaskEditorModal'; // Import TaskEditorModal
import TaskDetailModal from './TaskDetailModal'; // Import TaskDetailModal
import { formatDateToYYYYMMDD } from '../utils/dateUtils'; // Assuming a date utility

interface DailyDetailAreaProps {
  selectedDate: Date;
}

const DailyDetailArea: React.FC<DailyDetailAreaProps> = ({ selectedDate }) => {
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);
  const [currentTaskText, setCurrentTaskText] = useState('');
  const [selectedGoalId, setSelectedGoalId] = useState<number | null>(null);
  const [isTaskEditorModalOpen, setIsTaskEditorModalOpen] = useState(false); // State for TaskEditorModal
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null); // State for task being edited
  const [isTaskDetailModalOpen, setIsTaskDetailModalOpen] = useState(false); // State for TaskDetailModal
  const [taskToView, setTaskToView] = useState<Task | null>(null); // State for task being viewed

  const formattedSelectedDate = formatDateToYYYYMMDD(selectedDate);

  const tasks = useLiveQuery(() =>
    db.tasks
      .where('date')
      .equals(formattedSelectedDate)
      .toArray(),
    [formattedSelectedDate] // Re-run query when formattedSelectedDate changes
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
      date: formattedSelectedDate, // Use the formattedSelectedDate for new tasks
      createdAt: new Date(), // Set createdAt to current timestamp
    };
    await db.tasks.add(newTask);
    setCurrentTaskText(''); // Clear current task text after adding
  };

  const handleEditTask = (task: Task) => {
    setTaskToEdit(task);
    setIsTaskEditorModalOpen(true);
  };

  const handleViewTaskDetail = (task: Task) => {
    setTaskToView(task);
    setIsTaskDetailModalOpen(true);
  };

  const handleSaveEditedTask = async (updatedTask: Task) => {
    try {
      if (updatedTask.id) {
        await db.tasks.put(updatedTask);
      } else {
        // This case should ideally not happen if we're only editing existing tasks
        await db.tasks.add(updatedTask);
      }
    } catch (error) {
      console.error("Failed to save edited task: ", error);
    } finally {
      setTaskToEdit(null);
      setIsTaskEditorModalOpen(false);
    }
  };

  const handleDeleteTask = async (taskId: number) => {
    await db.tasks.delete(taskId);
  };

  const handleToggleTaskComplete = async (taskId: number, completed: boolean) => {
    await db.tasks.update(taskId, { completed });
  };

  return (
    <div className="flex flex-col bg-slate-50 dark:bg-slate-800 flex-1">
      <div className="flex-1 overflow-y-auto">
        {/* 할 일 목록 표시 공간 */}
        <TaskList
          tasks={tasks || []}
          onViewTaskDetail={handleViewTaskDetail} // Pass handler for viewing task details


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
      <TaskEditorModal
        isOpen={isTaskEditorModalOpen}
        onClose={() => {
          setIsTaskEditorModalOpen(false); // Corrected setter
          setTaskToEdit(null); // Clear taskToEdit when modal closes
        }}
        taskToEdit={taskToEdit}
        onSave={handleSaveEditedTask}
      />
      <TaskDetailModal
        isOpen={isTaskDetailModalOpen}
        onClose={() => {
          setIsTaskDetailModalOpen(false);
          setTaskToView(null);
        }}
        task={taskToView}
        onEditTask={handleEditTask} // Pass handleEditTask to detail modal
        onDeleteTask={handleDeleteTask} // Pass handleDeleteTask to detail modal
      />
    </div>
  );
};

export default DailyDetailArea;
