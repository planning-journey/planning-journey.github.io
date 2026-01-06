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
          .where({ date: formattedSelectedDate, projectId: selectedProjectId })
          .toArray()
      : Promise.resolve([]) as Promise<Task[]>, // If no project selected, return empty array
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

  const handleSaveEditedTask = async (task: Task) => {
    try {
      await db.transaction('rw', db.tasks, async () => {
        const originalTask = await db.tasks.get(task.id);

        if (originalTask && originalTask.date !== task.date) {
          // Date changed: Handle reordering
          // 1. Calculate new order for the new date
          const tasksInNewDate = await db.tasks
            .where({ date: task.date, projectId: task.projectId })
            .toArray();
          const maxOrder = tasksInNewDate.length > 0
            ? Math.max(...tasksInNewDate.map(t => t.order))
            : -1;
          task.order = maxOrder + 1;

          // 2. Update the task
          await db.tasks.put(task);

          // 3. Reorder tasks in the old date
          const tasksInOldDate = await db.tasks
            .where({ date: originalTask.date, projectId: originalTask.projectId })
            .sortBy('order');
          
          for (let i = 0; i < tasksInOldDate.length; i++) {
            if (tasksInOldDate[i].order !== i) {
              await db.tasks.update(tasksInOldDate[i].id, { order: i });
            }
          }
        } else {
          // Date not changed: Just update
          await db.tasks.put(task);
        }
      });
    } catch (error) {
      console.error("Failed to save task: ", error);
    } finally {
      setTaskToEdit(null);
      setIsTaskEditorModalOpen(false);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      await db.transaction('rw', db.tasks, async () => {
        const taskToDelete = await db.tasks.get(taskId);
        if (!taskToDelete) return;

        const { date, projectId } = taskToDelete;
        await db.tasks.delete(taskId);

        const remainingTasks = await db.tasks
          .where({ date, projectId })
          .sortBy('order');

        for (let i = 0; i < remainingTasks.length; i++) {
          if (remainingTasks[i].order !== i) {
            await db.tasks.update(remainingTasks[i].id, { order: i });
          }
        }
      });
    } catch (error) {
      console.error("Failed to delete task:", error);
    }
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
        selectedProjectId={selectedProjectId as string} // Pass selectedProjectId
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
