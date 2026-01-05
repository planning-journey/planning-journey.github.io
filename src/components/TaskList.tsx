import React from 'react';
import { type Task } from '../db';
import TaskItem from './TaskItem';

interface TaskListProps {
  tasks: Task[];
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: number) => void;
  onToggleTaskComplete: (taskId: number, completed: boolean) => void;
}

const TaskList: React.FC<TaskListProps> = ({ tasks, onEditTask, onDeleteTask, onToggleTaskComplete }) => {
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
          onEdit={onEditTask}
          onDelete={onDeleteTask}
          onToggleComplete={onToggleTaskComplete}
        />
      ))}
    </div>
  );
};

export default TaskList;
