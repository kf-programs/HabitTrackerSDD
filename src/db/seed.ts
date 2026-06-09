import { db } from './client';

export async function seedDatabase() {
  const routineCount = await db.routines.count();
  if (routineCount > 0) {
    return;
  }

  const now = new Date().toISOString();
  await db.routines.bulkAdd([
    {
      id: 'routine-morning',
      title: 'Morning Ritual',
      description: 'A gentle start to the day.',
      status: 'active',
      createdAt: now,
      updatedAt: now,
      lastAccessedAt: now,
    },
  ]);
}
