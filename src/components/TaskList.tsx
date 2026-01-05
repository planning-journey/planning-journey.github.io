import React from 'react';
import { type Task } from '../db';
import TaskItem from './TaskItem';

interface TaskListProps {
  tasks: Task[];
  onViewTaskDetail: (task: Task) => void; // New prop for viewing task details
  onDeleteTask: (taskId: number) => void;
  onToggleTaskComplete: (taskId: number, completed: boolean) => void;
  onEditTask: (task: Task) => void; // Keep onEditTask for the edit button within TaskItem
}

const TaskList: React.FC<TaskListProps> = ({ tasks, onViewTaskDetail, onDeleteTask, onToggleTaskComplete, onEditTask }) => {

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
          onView={onViewTaskDetail} // Pass the new onViewTaskDetail prop
          onDelete={onDeleteTask}
          onToggleComplete={onToggleTaskComplete}
          onEdit={onEditTask} // Pass onEditTask to TaskItem
        />
      ))}
    </div>
  );
};

export default TaskList;
