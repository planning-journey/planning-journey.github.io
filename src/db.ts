import Dexie, { type Table } from 'dexie';

export interface Goal {
  id?: number;
  name: string;
  color: string;
  periodType: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'free';
  startDate: Date;
  endDate: Date;
  createdAt: Date;
}

export interface Task {
  id?: number;
  text: string;
  goalId: number | null;
  completed: boolean;
  date: string; // YYYY-MM-DD format
  description?: string; // Optional description for the task
  createdAt: Date;
}

export interface DailyEvaluation {
  date: string; // YYYY-MM-DD format, primary key
  evaluationText: string;
  createdAt: Date;
}

export class MySubClassedDexie extends Dexie {
  goals!: Table<Goal>;
  tasks!: Table<Task>;
  dailyEvaluations!: Table<DailyEvaluation>;

  constructor() {
    super('planningJourneyDB');
    this.version(2).stores({
      goals: '++id, name, startDate, endDate, createdAt' // Primary key and indexed props
    });
    this.version(3).stores({
      goals: '++id, name, startDate, endDate, createdAt',
      tasks: '++id, goalId, createdAt'
    });
    this.version(4).stores({
      goals: '++id, name, startDate, endDate, createdAt',
      tasks: '++id, goalId, date, createdAt' // Add date to tasks store
    });
    this.version(5).stores({
      goals: '++id, name, startDate, endDate, createdAt',
      tasks: '++id, goalId, date, description, createdAt' // Add description to tasks store
    });
    this.version(6).stores({
      goals: '++id, name, startDate, endDate, createdAt',
      tasks: '++id, goalId, date, description, createdAt',
      dailyEvaluations: '&date, createdAt' // Primary key is date, createdAt is indexed
    });
  }
}

export const db = new MySubClassedDexie();
