import { compressToEncodedURIComponent, decompressFromEncodedURIComponent } from 'lz-string';
import type { RoutineRecord, CategoryRecord, HabitRecord } from '../db/schema';
import { db } from '../db/client';

export interface SharePayload {
  version: string;
  routine: Pick<RoutineRecord, 'title' | 'description' | 'status'>;
  categories: Pick<CategoryRecord, 'id' | 'name' | 'orderIndex'>[];
  habits: Pick<HabitRecord, 'id' | 'categoryId' | 'title' | 'timeframe' | 'trackingType' | 'measurementUnit' | 'status'>[];
}

interface CompactSharePayloadV2 {
  v: '2';
  // routine tuple: [title, description?, statusCode]
  r: [string, string | undefined, 'a' | 'p'];
  // category tuple: [shortId, name, orderIndex]
  c: Array<[string, string, number]>;
  // habit tuple: [categoryShortId, title, timeframeCode, trackingCode, measurementUnit?, statusCode]
  h: Array<[string, string, 'd' | 'w', 'y' | 'c' | 'm', string | undefined, 'a' | 'r' | 'd']>;
}

interface LegacySharePayloadV1 {
  version: '1';
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

const LATEST_VERSION = '2';

function hasForbiddenHistoryFields(payload: unknown) {
  if (!payload || typeof payload !== 'object') {
    return false;
  }

  const keys = Object.keys(payload);
  return keys.includes('entries') || keys.includes('timelineTiles') || keys.includes('history');
}

function isLegacyV1Payload(payload: unknown): payload is LegacySharePayloadV1 {
  if (!payload || typeof payload !== 'object') {
    return false;
  }

  const candidate = payload as Partial<LegacySharePayloadV1>;
  return candidate.version === '1' && Array.isArray(candidate.categories) && Array.isArray(candidate.habits);
}

function isCompactV2Payload(payload: unknown): payload is CompactSharePayloadV2 {
  if (!payload || typeof payload !== 'object') {
    return false;
  }

  const candidate = payload as Partial<CompactSharePayloadV2>;
  return candidate.v === '2' && Array.isArray(candidate.c) && Array.isArray(candidate.h) && Array.isArray(candidate.r);
}

function toStatusCode(status: RoutineRecord['status']): 'a' | 'p' {
  return status === 'paused' ? 'p' : 'a';
}

function fromStatusCode(code: 'a' | 'p'): RoutineRecord['status'] {
  return code === 'p' ? 'paused' : 'active';
}

function toHabitStatusCode(status: HabitRecord['status']): 'a' | 'r' | 'd' {
  if (status === 'archived') {
    return 'r';
  }
  if (status === 'deleted') {
    return 'd';
  }
  return 'a';
}

function fromHabitStatusCode(code: 'a' | 'r' | 'd'): HabitRecord['status'] {
  if (code === 'r') {
    return 'archived';
  }
  if (code === 'd') {
    return 'deleted';
  }
  return 'active';
}

function toTimeframeCode(timeframe: HabitRecord['timeframe']): 'd' | 'w' {
  return timeframe === 'weekly' ? 'w' : 'd';
}

function fromTimeframeCode(code: 'd' | 'w'): HabitRecord['timeframe'] {
  return code === 'w' ? 'weekly' : 'daily';
}

function toTrackingCode(trackingType: HabitRecord['trackingType']): 'y' | 'c' | 'm' {
  if (trackingType === 'counter') {
    return 'c';
  }
  if (trackingType === 'measurement') {
    return 'm';
  }
  return 'y';
}

function fromTrackingCode(code: 'y' | 'c' | 'm'): HabitRecord['trackingType'] {
  if (code === 'c') {
    return 'counter';
  }
  if (code === 'm') {
    return 'measurement';
  }
  return 'yesno';
}

function createCompactPayload(payload: SharePayload): CompactSharePayloadV2 {
  const categoryIdToShortId = new Map<string, string>();

  const compactCategories: CompactSharePayloadV2['c'] = payload.categories.map((category, index) => {
    const shortId = index.toString(36);
    categoryIdToShortId.set(category.id, shortId);
    return [shortId, category.name, category.orderIndex];
  });

  const compactHabits: CompactSharePayloadV2['h'] = payload.habits.map((habit) => {
    const compactCategoryId = categoryIdToShortId.get(habit.categoryId);
    if (!compactCategoryId) {
      throw new Error('Share payload references an unknown category.');
    }

    return [
      compactCategoryId,
      habit.title,
      toTimeframeCode(habit.timeframe),
      toTrackingCode(habit.trackingType),
      habit.measurementUnit,
      toHabitStatusCode(habit.status),
    ];
  });

  return {
    v: '2',
    r: [payload.routine.title, payload.routine.description, toStatusCode(payload.routine.status)],
    c: compactCategories,
    h: compactHabits,
  };
}

function normalizeLegacyPayload(payload: LegacySharePayloadV1): SharePayload {
  return {
    version: payload.version,
    routine: payload.routine,
    categories: payload.categories,
    habits: payload.habits,
  };
}

function normalizeCompactPayload(payload: CompactSharePayloadV2): SharePayload {
  const categoryMap = new Map<string, string>();

  const categories: SharePayload['categories'] = payload.c.map(([compactId, name, orderIndex], index) => {
    const categoryId = `c${index + 1}`;
    categoryMap.set(compactId, categoryId);
    return {
      id: categoryId,
      name,
      orderIndex,
    };
  });

  const habits: SharePayload['habits'] = payload.h.map(
    ([compactCategoryId, title, timeframeCode, trackingCode, measurementUnit, statusCode], index) => {
      const categoryId = categoryMap.get(compactCategoryId);
      if (!categoryId) {
        throw new Error('Share payload references an unknown category.');
      }

      return {
        id: `h${index + 1}`,
        categoryId,
        title,
        timeframe: fromTimeframeCode(timeframeCode),
        trackingType: fromTrackingCode(trackingCode),
        measurementUnit,
        status: fromHabitStatusCode(statusCode),
      };
    },
  );

  return {
    version: '2',
    routine: {
      title: payload.r[0],
      description: payload.r[1],
      status: fromStatusCode(payload.r[2]),
    },
    categories,
    habits,
  };
}

export function validateSharePayload(payload: SharePayload) {
  if (hasForbiddenHistoryFields(payload)) {
    throw new Error('Share payload includes history fields and is not allowed.');
  }

  if (!payload.version || !['1', '2'].includes(payload.version)) {
    throw new Error('Unsupported share payload version.');
  }

  if (!payload.routine?.title) {
    throw new Error('Share payload is missing routine metadata.');
  }
}

export function encodeSharePayload(payload: SharePayload) {
  validateSharePayload(payload);
  const compact = createCompactPayload(payload);
  return compressToEncodedURIComponent(JSON.stringify(compact));
}

export function decodeSharePayload(encoded: string) {
  const json = decompressFromEncodedURIComponent(encoded);
  if (!json) {
    throw new Error('Invalid share payload');
  }

  const parsed = JSON.parse(json) as unknown;

  if (isLegacyV1Payload(parsed)) {
    const payload = normalizeLegacyPayload(parsed);
    validateSharePayload(payload);
    return payload;
  }

  if (isCompactV2Payload(parsed)) {
    const payload = normalizeCompactPayload(parsed);
    validateSharePayload(payload);
    return payload;
  }

  throw new Error('Unsupported share payload version.');
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
  const allHabits = await db.habits.where('routineId').equals(routineId).toArray();

  // Exclude deleted habits and habits whose category has been hard-deleted.
  const existingCategoryIds = new Set(categories.map((c) => c.id));
  const habits = allHabits.filter(
    (habit) => habit.status !== 'deleted' && existingCategoryIds.has(habit.categoryId),
  );

  const payload: SharePayload = {
    version: LATEST_VERSION,
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
