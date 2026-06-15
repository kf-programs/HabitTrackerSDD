import { db } from './client';

export async function seedDatabase() {
  const routineCount = await db.routines.count();
  if (routineCount > 0) {
    return;
  }

  const now = new Date().toISOString();
  const routineId = 'routine-morning';
  const categoryHydration = 'category-hydration';
  const categoryMovement = 'category-movement';

  await db.routines.add({
    id: routineId,
    title: 'Morning Ritual',
    description: 'A gentle start to the day.',
    status: 'active',
    createdAt: now,
    updatedAt: now,
    lastAccessedAt: now,
  });

  await db.categories.bulkAdd([
    {
      id: categoryHydration,
      routineId,
      name: 'Gentle Start',
      description: 'Small habits that ease into the day.',
      orderIndex: 0,
      isExpandedDefault: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: categoryMovement,
      routineId,
      name: 'Movement',
      description: 'Light physical activity to wake up the body.',
      orderIndex: 1,
      isExpandedDefault: false,
      createdAt: now,
      updatedAt: now,
    },
  ]);

  await db.habits.bulkAdd([
    {
      id: 'habit-water',
      routineId,
      categoryId: categoryHydration,
      title: 'Drink water',
      timeframe: 'daily',
      trackingType: 'yesno',
      status: 'active',
      deletedAt: undefined,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'habit-stretch',
      routineId,
      categoryId: categoryMovement,
      title: 'Stretch',
      timeframe: 'daily',
      trackingType: 'counter',
      status: 'active',
      deletedAt: undefined,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'habit-mood',
      routineId,
      categoryId: categoryHydration,
      title: 'Mood check',
      timeframe: 'daily',
      trackingType: 'measurement',
      status: 'active',
      deletedAt: undefined,
      createdAt: now,
      updatedAt: now,
    },
  ]);
}
