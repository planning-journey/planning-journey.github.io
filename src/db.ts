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

export class MySubClassedDexie extends Dexie {
  goals!: Table<Goal>; 

  constructor() {
    super('planningJourneyDB');
    this.version(2).stores({
      goals: '++id, name, startDate, endDate, createdAt' // Primary key and indexed props
    });
  }
}

export const db = new MySubClassedDexie();
