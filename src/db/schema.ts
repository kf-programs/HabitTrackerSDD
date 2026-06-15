export type RoutineStatus = 'active' | 'paused';
export type HabitTimeframe = 'daily' | 'weekly';
export type HabitTrackingType = 'yesno' | 'counter' | 'measurement';
export type HabitStatus = 'active' | 'archived' | 'deleted';

export interface RoutineRecord {
  id: string;
  title: string;
  description?: string;
  status: RoutineStatus;
  createdAt: string;
  updatedAt: string;
  lastAccessedAt: string;
}

export interface CategoryRecord {
  id: string;
  routineId: string;
  name: string;
  description?: string;
  orderIndex: number;
  isExpandedDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface HabitRecord {
  id: string;
  routineId: string;
  categoryId: string;
  title: string;
  timeframe: HabitTimeframe;
  trackingType: HabitTrackingType;
  measurementUnit?: string;
  status: HabitStatus;
  deletedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface EntryRecord {
  id: string;
  habitId: string;
  timeframe: HabitTimeframe;
  // Daily records use logDate semantics while preserving the existing periodKey model.
  logDate?: string;
  periodKey: string;
  valueType: 'boolean' | 'integer' | 'string';
  boolValue?: boolean;
  intValue?: number;
  textValue?: string;
  recordedAt: string;
  source: 'user' | 'import';
}

export interface RoutineJournalEntryRecord {
  id: string;
  routineId: string;
  dayKey: string;
  text: string;
  createdAt: string;
  updatedAt: string;
}
