// src/db.ts
import Dexie, { type Table } from 'dexie';

export interface Project {
  id: string;
  name: string;
}

export interface Goal {
  id: string;
  projectId: string; // Link to Project
  name: string; // Renamed from title to name for consistency
  color: string;
  periodType: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'free';
  startDate: string;
  endDate: string;
  status: 'pending' | 'in_progress' | 'completed' | 'archived';
  createdAt?: Date; // Added createdAt
}

export interface Task {
  id: string;
  projectId: string; // Link to Project
  goalId?: string; // Optional link to Goal
  title: string;
  description?: string;
  dueDate?: string;
  completed: boolean;
  date: string; // Added date field
  createdAt?: Date; // It is present in App.tsx
  order: number; // New order field
}

export interface DailyEvaluation {
  id: string;
  projectId: string; // Link to Project
  date: string;
  evaluation: string;
  evaluationText?: string; // It is present in App.tsx
  createdAt?: Date;
  // Add other daily evaluation related properties as needed
}

export class AppDB extends Dexie {
  projects!: Table<Project>;
  goals!: Table<Goal>;
  tasks!: Table<Task>;
  dailyEvaluations!: Table<DailyEvaluation>;

  constructor() {
    super('PlanningJourneyDB');
    this.version(1).stores({
      projects: 'id, name',
      goals: 'id, projectId, title, startDate, endDate',
      tasks: 'id, projectId, goalId, title, completed, date, order', // Added order to index
      dailyEvaluations: 'id, projectId, date',
    });

    this.version(2).upgrade(async (tx) => {
      // Add 'order' field to existing tasks.
      // We'll give them an initial order to ensure they appear.
      // For tasks that don't have an order yet, assign a default.
      // For simplicity, we can assign a sequential order based on current retrieval.
      let order = 0;
      await tx.table('tasks').each((task) => {
        if (task && typeof task.order === 'undefined') {
          task.order = order++;
          tx.table('tasks').put(task); // Update the task in the transaction
        }
      });
    });
  }
}

export const db = new AppDB();