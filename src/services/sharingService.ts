import { compressToEncodedURIComponent, decompressFromEncodedURIComponent } from 'lz-string';
import type { RoutineRecord, CategoryRecord, HabitRecord } from '../db/schema';

export interface SharePayload {
  version: string;
  routine: Pick<RoutineRecord, 'title' | 'description' | 'status'>;
  categories: Pick<CategoryRecord, 'id' | 'name' | 'orderIndex'>[];
  habits: Pick<HabitRecord, 'id' | 'categoryId' | 'title' | 'timeframe' | 'trackingType' | 'measurementUnit' | 'status'>[];
}

export function encodeSharePayload(payload: SharePayload) {
  return compressToEncodedURIComponent(JSON.stringify(payload));
}

export function decodeSharePayload(encoded: string) {
  const json = decompressFromEncodedURIComponent(encoded);
  if (!json) {
    throw new Error('Invalid share payload');
  }
  return JSON.parse(json) as SharePayload;
}
