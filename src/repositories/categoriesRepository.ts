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

export async function deleteCategoryForRoutine(categoryId: string, routineId: string) {
  const now = getNow();

  await db.transaction('rw', db.categories, db.habits, async () => {
    const category = await db.categories.get(categoryId);

    if (!category || category.routineId !== routineId) {
      throw new Error('Category not found for this routine.');
    }

    const habits = await db.habits.where('categoryId').equals(categoryId).toArray();
    const habitsInRoutine = habits.filter((habit) => habit.routineId === routineId);

    await Promise.all(
      habitsInRoutine.map((habit) =>
        db.habits.update(habit.id, {
          status: 'deleted',
          deletedAt: habit.deletedAt ?? now,
          updatedAt: now,
        }),
      ),
    );

    await db.categories.delete(categoryId);
  });
}
