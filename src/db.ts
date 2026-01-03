import Dexie, { type Table } from 'dexie';

export interface Goal {
  id?: number;
  name: string;
  color: string;
  periodType: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'free';
  createdAt: Date;
}

export class MySubClassedDexie extends Dexie {
  goals!: Table<Goal>; 

  constructor() {
    super('planningJourneyDB');
    this.version(1).stores({
      goals: '++id, name, createdAt' // Primary key and indexed props
    });
  }
}

export const db = new MySubClassedDexie();
