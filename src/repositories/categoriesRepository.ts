import { db } from '../db/client';
import type { CategoryRecord } from '../db/schema';

export async function listCategoriesForRoutine(routineId: string) {
  return db.categories.where('routineId').equals(routineId).sortBy('orderIndex');
}

export async function saveCategory(category: CategoryRecord) {
  await db.categories.put(category);
}
