import { db } from '../db/client';
import type { CategoryRecord } from '../db/schema';

function getNow() {
  return new Date().toISOString();
}

export async function listCategoriesForRoutine(routineId: string) {
  return db.categories.where('routineId').equals(routineId).sortBy('orderIndex');
}

export async function saveCategory(category: CategoryRecord) {
  await db.categories.put(category);
}

export async function createCategory(routineId: string, name: string, orderIndex: number, description?: string) {
  const now = new Date().toISOString();
  const category: CategoryRecord = {
    id: crypto.randomUUID(),
    routineId,
    name: name.trim(),
    description: description?.trim() || undefined,
    orderIndex,
    isExpandedDefault: orderIndex === 0,
    createdAt: now,
    updatedAt: now,
  };

  await db.categories.add(category);
  return category;
}

export async function updateCategory(
  categoryId: string,
  updates: Partial<Pick<CategoryRecord, 'name' | 'description' | 'isExpandedDefault'>>,
) {
  await db.categories.update(categoryId, {
    ...updates,
    updatedAt: getNow(),
  });
}

export async function listCategories() {
  return db.categories.toArray();
}
