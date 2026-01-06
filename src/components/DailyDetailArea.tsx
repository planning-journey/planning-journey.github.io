import React from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import TaskList from './TaskList'; // Import TaskList
import { db, type Task } from '../db';
import TaskEditorModal from './TaskEditorModal'; // Import TaskEditorModal
import TaskDetailModal from './TaskDetailModal'; // Import TaskDetailModal

interface DailyDetailAreaProps {
  formattedSelectedDate: string;
  scrollToTaskId: string | null;
  onClearScrollToTask: () => void; // New prop to clear scroll request
  selectedProjectId: string | null; // Add selectedProjectId prop
}

const DailyDetailArea: React.FC<DailyDetailAreaProps> = ({ formattedSelectedDate, scrollToTaskId, onClearScrollToTask, selectedProjectId }) => {
  // States related to task editing/viewing, not moved
  const [isTaskEditorModalOpen, setIsTaskEditorModalOpen] = React.useState(false); // State for TaskEditorModal
  const [taskToEdit, setTaskToEdit] = React.useState<Task | null>(null); // State for task being edited
  const [isTaskDetailModalOpen, setIsTaskDetailModalOpen] = React.useState(false); // State for TaskDetailModal
  const [taskToView, setTaskToView] = React.useState<Task | null>(null); // State for task being viewed

  const tasks = useLiveQuery(() =>
    selectedProjectId
      ? db.tasks
          .where('date')
          .equals(formattedSelectedDate)
          .and(task => task.projectId === selectedProjectId)
          .toArray()
      : Promise.resolve([]), // If no project selected, return empty array
    [formattedSelectedDate, selectedProjectId] // Re-run query when formattedSelectedDate or selectedProjectId changes
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
        // For new tasks, generate a UUID and assign projectId
        const newTaskWithId: Task = {
          ...updatedTask,
          id: crypto.randomUUID(),
          projectId: selectedProjectId!, // Ensure projectId is assigned for new tasks
        };
        await db.tasks.add(newTaskWithId);
      }
    } catch (error) {
      console.error("Failed to save task: ", error);
    } finally {
      setTaskToEdit(null);
      setIsTaskEditorModalOpen(false);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    await db.tasks.delete(taskId);
  };

  const handleToggleTaskComplete = async (taskId: string, completed: boolean) => {
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
