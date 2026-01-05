import React from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import TaskList from './TaskList'; // Import TaskList
import { db, type Task } from '../db';
import TaskEditorModal from './TaskEditorModal'; // Import TaskEditorModal
import TaskDetailModal from './TaskDetailModal'; // Import TaskDetailModal

interface DailyDetailAreaProps {
  selectedDate: Date;
  formattedSelectedDate: string;
  scrollToTaskId: number | null;
  onClearScrollToTask: () => void; // New prop to clear scroll request
}

const DailyDetailArea: React.FC<DailyDetailAreaProps> = ({ selectedDate, formattedSelectedDate, scrollToTaskId, onClearScrollToTask }) => {
  // States related to task editing/viewing, not moved
  const [isTaskEditorModalOpen, setIsTaskEditorModalOpen] = React.useState(false); // State for TaskEditorModal
  const [taskToEdit, setTaskToEdit] = React.useState<Task | null>(null); // State for task being edited
  const [isTaskDetailModalOpen, setIsTaskDetailModalOpen] = React.useState(false); // State for TaskDetailModal
  const [taskToView, setTaskToView] = React.useState<Task | null>(null); // State for task being viewed

  const tasks = useLiveQuery(() =>
    db.tasks
      .where('date')
      .equals(formattedSelectedDate)
      .toArray(),
    [formattedSelectedDate] // Re-run query when formattedSelectedDate changes
  );

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
          onViewTaskDetail={handleViewTaskDetail}
          onToggleTaskComplete={handleToggleTaskComplete}
          scrollToTaskId={scrollToTaskId}
          onClearScrollToTask={onClearScrollToTask} // Pass onClearScrollToTask to TaskList
        />
      </div>
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
