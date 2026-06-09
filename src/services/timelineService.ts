import type { HabitRecord } from '../db/schema';
import { getDayKey, getWeekKey, getRollingDayKeys } from '../utils/dateBoundaries';
import { pickPastelToken } from '../utils/pastelPalette';

export function buildDailyWindow(today = new Date()) {
  return getRollingDayKeys(120, today);
}

export function getPeriodKeyForHabit(habit: HabitRecord, date = new Date()) {
  return habit.timeframe === 'daily' ? getDayKey(date) : getWeekKey(date);
}

export function getTileToken(seed?: string) {
  return pickPastelToken(seed);
}
