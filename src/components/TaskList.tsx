import React, { useState } from 'react';
import { db, type Task } from '../db';
import TaskItem from './TaskItem';
import TaskEditorModal from './TaskEditorModal';

interface TaskListProps {
  tasks: Task[];
  onDeleteTask: (taskId: number) => void;
  onToggleTaskComplete: (taskId: number, completed: boolean) => void;
}

const TaskList: React.FC<TaskListProps> = ({ tasks, onEditTask, onDeleteTask, onToggleTaskComplete }) => {
  const [isTaskEditorModalOpen, setIsTaskEditorModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);

  const handleEditTask = (task: Task) => {
    setTaskToEdit(task);
    setIsTaskEditorModalOpen(true);
  };

  const handleSaveTask = async (task: Task) => {
    try {
      if (task.id) {
        // Update existing task
        await db.tasks.put(task);
      } else {
        // Add new task (shouldn't happen via edit modal, but good to have)
        await db.tasks.add(task);
      }
    } catch (error) {
      console.error("Failed to save task: ", error);
    }
  };

  if (tasks.length === 0) {
    return (
      <p className="text-center text-gray-500 dark:text-slate-400 mt-8">오늘 할 일을 추가해보세요!</p>
    );
  }

  return (
    <div className="divide-y divide-slate-200/50 dark:divide-slate-700 ">
      {tasks.map((task) => (
        <TaskItem
          key={task.id}
          task={task}
          onEdit={handleEditTask} // Use the new handler
          onDelete={onDeleteTask}
          onToggleComplete={onToggleTaskComplete}
        />
      ))}

      <TaskEditorModal
        isOpen={isTaskEditorModalOpen}
        onClose={() => setIsTaskEditorModalOpen(false)}
        taskToEdit={taskToEdit}
        onSave={handleSaveTask}
      />
    </div>
  );
};

export default TaskList;
