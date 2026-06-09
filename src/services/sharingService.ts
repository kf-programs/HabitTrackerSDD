import { compressToEncodedURIComponent, decompressFromEncodedURIComponent } from 'lz-string';
import type { RoutineRecord, CategoryRecord, HabitRecord } from '../db/schema';
import { db } from '../db/client';

export interface SharePayload {
  version: string;
  routine: Pick<RoutineRecord, 'title' | 'description' | 'status'>;
  categories: Pick<CategoryRecord, 'id' | 'name' | 'orderIndex'>[];
  habits: Pick<HabitRecord, 'id' | 'categoryId' | 'title' | 'timeframe' | 'trackingType' | 'measurementUnit' | 'status'>[];
}

interface ImportPreview {
  cancelled: boolean;
  title: string;
  description?: string;
  categoryCount: number;
  habitCount: number;
}

const SUPPORTED_VERSION = '1';

function hasForbiddenHistoryFields(payload: unknown) {
  if (!payload || typeof payload !== 'object') {
    return false;
  }

  const keys = Object.keys(payload);
  return keys.includes('entries') || keys.includes('timelineTiles') || keys.includes('history');
}

export function validateSharePayload(payload: SharePayload) {
  if (hasForbiddenHistoryFields(payload)) {
    throw new Error('Share payload includes history fields and is not allowed.');
  }

  if (!payload.version || payload.version !== SUPPORTED_VERSION) {
    throw new Error('Unsupported share payload version.');
  }

  if (!payload.routine?.title) {
    throw new Error('Share payload is missing routine metadata.');
  }
}

export function encodeSharePayload(payload: SharePayload) {
  return compressToEncodedURIComponent(JSON.stringify(payload));
}

export function decodeSharePayload(encoded: string) {
  const json = decompressFromEncodedURIComponent(encoded);
  if (!json) {
    throw new Error('Invalid share payload');
  }

  const payload = JSON.parse(json) as SharePayload;
  validateSharePayload(payload);
  return payload;
}

export function resolveImportedTitle(baseTitle: string, existingTitles: string[]) {
  if (!existingTitles.includes(baseTitle)) {
    return baseTitle;
  }

  const firstSuffix = `${baseTitle} (Imported)`;
  if (!existingTitles.includes(firstSuffix)) {
    return firstSuffix;
  }

  let index = 2;
  while (existingTitles.includes(`${baseTitle} (Imported ${index})`)) {
    index += 1;
  }

  return `${baseTitle} (Imported ${index})`;
}

export function getImportPreview(encodedPayload: string): ImportPreview {
  const payload = decodeSharePayload(encodedPayload);
  return {
    cancelled: false,
    title: payload.routine.title,
    description: payload.routine.description,
    categoryCount: payload.categories.length,
    habitCount: payload.habits.length,
  };
}

export async function exportRoutineStructure(routineId: string) {
  const routine = await db.routines.get(routineId);
  if (!routine) {
    throw new Error('Routine not found');
  }

  const categories = await db.categories.where('routineId').equals(routineId).sortBy('orderIndex');
  const habits = await db.habits.where('routineId').equals(routineId).toArray();

  const payload: SharePayload = {
    version: SUPPORTED_VERSION,
    routine: {
      title: routine.title,
      description: routine.description,
      status: routine.status,
    },
    categories: categories.map((category) => ({
      id: category.id,
      name: category.name,
      orderIndex: category.orderIndex,
    })),
    habits: habits.map((habit) => ({
      id: habit.id,
      categoryId: habit.categoryId,
      title: habit.title,
      timeframe: habit.timeframe,
      trackingType: habit.trackingType,
      measurementUnit: habit.measurementUnit,
      status: habit.status,
    })),
  };

  return encodeSharePayload(payload);
}

export async function importRoutineStructure(encodedPayload: string) {
  const payload = decodeSharePayload(encodedPayload);
  const existingTitles = (await db.routines.toArray()).map((routine) => routine.title);
  const now = new Date().toISOString();

  const importedRoutineId = crypto.randomUUID();
  const importedTitle = resolveImportedTitle(payload.routine.title, existingTitles);
  const categoryIdMap = new Map<string, string>();

  await db.transaction('rw', db.routines, db.categories, db.habits, async () => {
    const routineRecord: RoutineRecord = {
      id: importedRoutineId,
      title: importedTitle,
      description: payload.routine.description,
      status: payload.routine.status,
      createdAt: now,
      updatedAt: now,
      lastAccessedAt: now,
    };

    await db.routines.add(routineRecord);

    for (const category of payload.categories) {
      const newCategoryId = crypto.randomUUID();
      categoryIdMap.set(category.id, newCategoryId);

      const categoryRecord: CategoryRecord = {
        id: newCategoryId,
        routineId: importedRoutineId,
        name: category.name,
        orderIndex: category.orderIndex,
        isExpandedDefault: category.orderIndex === 0,
        createdAt: now,
        updatedAt: now,
      };

      await db.categories.add(categoryRecord);
    }

    for (const habit of payload.habits) {
      const mappedCategoryId = categoryIdMap.get(habit.categoryId);
      if (!mappedCategoryId) {
        throw new Error('Share payload references an unknown category.');
      }

      const habitRecord: HabitRecord = {
        id: crypto.randomUUID(),
        routineId: importedRoutineId,
        categoryId: mappedCategoryId,
        title: habit.title,
        timeframe: habit.timeframe,
        trackingType: habit.trackingType,
        measurementUnit: habit.measurementUnit,
        status: habit.status,
        createdAt: now,
        updatedAt: now,
      };

      await db.habits.add(habitRecord);
    }
  });

  return importedRoutineId;
}
