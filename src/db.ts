// src/db.ts
import Dexie, { Table } from 'dexie';

export interface Project {
  id: string;
  name: string;
}

export interface Goal {
  id: string;
  projectId: string; // Link to Project
  title: string;
  startDate: string;
  endDate: string;
  status: 'pending' | 'in_progress' | 'completed' | 'archived';
  // Add other goal-related properties as needed
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
  text?: string; // It is present in App.tsx
}

export interface DailyEvaluation {
  id: string;
  projectId: string; // Link to Project
  date: string;
  evaluation: string;
  evaluationText?: string; // It is present in App.tsx
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
      tasks: 'id, projectId, goalId, title, completed, date', // Added date to index
      dailyEvaluations: 'id, projectId, date',
    });
  }
}

export const db = new AppDB();