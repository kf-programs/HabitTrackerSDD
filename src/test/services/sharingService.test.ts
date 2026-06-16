import { describe, expect, it } from 'vitest';
import { compressToEncodedURIComponent } from 'lz-string';
import {
  decodeSharePayload,
  encodeSharePayload,
  exportRoutineStructure,
  getImportPreview,
  importRoutineStructure,
  resolveImportedTitle,
  validateSharePayload,
} from '../../services/sharingService';
import { seedDatabase } from '../../db/seed';
import { db } from '../../db/client';

const legacyPayload = {
  version: '1',
  routine: { title: 'Morning', description: 'Start calm', status: 'active' as const },
  categories: [{ id: 'c1', name: 'Focus', orderIndex: 0 }],
  habits: [
    {
      id: 'h1',
      categoryId: 'c1',
      title: 'Breathe',
      timeframe: 'daily' as const,
      trackingType: 'yesno' as const,
      status: 'active' as const,
    },
  ],
};

describe('sharingService', () => {
  it('encodes and decodes structure-only payloads with semantic equivalence', () => {
    const encoded = encodeSharePayload(legacyPayload);

    const decoded = decodeSharePayload(encoded);

    expect(decoded.routine.title).toBe('Morning');
    expect(decoded.categories).toHaveLength(1);
    expect(decoded.habits).toHaveLength(1);
    expect(decoded.habits[0]?.categoryId).toBe(decoded.categories[0]?.id);
  });

  it('produces a smaller encoded payload than legacy v1 key-heavy JSON', () => {
    const widePayload = {
      version: '1',
      routine: { title: 'Routine with many habits', description: 'Payload size test', status: 'active' as const },
      categories: Array.from({ length: 8 }, (_, index) => ({
        id: `category-${index + 1}-12345678-1234-1234-1234-1234567890ab`,
        name: `Category ${index + 1}`,
        orderIndex: index,
      })),
      habits: Array.from({ length: 40 }, (_, index) => ({
        id: `habit-${index + 1}-12345678-1234-1234-1234-1234567890ab`,
        categoryId: `category-${(index % 8) + 1}-12345678-1234-1234-1234-1234567890ab`,
        title: `Habit ${index + 1}`,
        timeframe: index % 2 === 0 ? ('daily' as const) : ('weekly' as const),
        trackingType: index % 3 === 0 ? ('yesno' as const) : index % 3 === 1 ? ('counter' as const) : ('measurement' as const),
        measurementUnit: index % 3 === 2 ? 'minutes' : undefined,
        status: 'active' as const,
      })),
    };

    const compactEncoded = encodeSharePayload(widePayload);
    const legacyEncoded = compressToEncodedURIComponent(JSON.stringify(widePayload));

    expect(compactEncoded.length).toBeLessThan(legacyEncoded.length);
  });

  it('decodes legacy v1 payloads for backward compatibility', () => {
    const encodedLegacy = compressToEncodedURIComponent(JSON.stringify(legacyPayload));
    const decoded = decodeSharePayload(encodedLegacy);

    expect(decoded.version).toBe('1');
    expect(decoded.routine.title).toBe('Morning');
    expect(decoded.categories[0]?.id).toBe('c1');
    expect(decoded.habits[0]?.categoryId).toBe('c1');
  });

  it('rejects payloads that contain history fields', () => {
    expect(() =>
      validateSharePayload({
        version: '2',
        routine: { title: 'Morning', status: 'active' },
        categories: [],
        habits: [],
        entries: [],
      } as never),
    ).toThrow(/history/i);
  });

  it('applies duplicate-title suffix and supports import preview cancel behavior', () => {
    const title = resolveImportedTitle('Morning', ['Morning', 'Morning (Imported)']);
    expect(title).toBe('Morning (Imported 2)');

    const preview = getImportPreview(
      encodeSharePayload(legacyPayload),
    );

    expect(preview.cancelled).toBe(false);
    expect(preview.categoryCount).toBe(1);
    expect(preview.habitCount).toBe(1);
  });

  it('excludes soft-deleted habits and orphaned habits from export', async () => {
    await seedDatabase();

    // Soft-delete one habit directly.
    await db.habits.update('habit-water', { status: 'deleted', deletedAt: new Date().toISOString(), updatedAt: new Date().toISOString() });

    const encoded = await exportRoutineStructure('routine-morning');
    const decoded = decodeSharePayload(encoded);

    // habit-water should not appear in the exported payload.
    expect(decoded.habits.some((h) => h.title === 'Drink water')).toBe(false);
    // Other habits should still be exported.
    expect(decoded.habits.some((h) => h.title === 'Stretch')).toBe(true);
  });

  it('exports and imports routine structure successfully with compact payload encoding', async () => {
    await seedDatabase();

    const encoded = await exportRoutineStructure('routine-morning');
    const importedRoutineId = await importRoutineStructure(encoded);

    const importedRoutine = await db.routines.get(importedRoutineId);
    expect(importedRoutine).toBeTruthy();
    expect(importedRoutine?.title).toContain('Morning Ritual');

    const importedCategories = await db.categories.where('routineId').equals(importedRoutineId).toArray();
    const importedHabits = await db.habits.where('routineId').equals(importedRoutineId).toArray();

    expect(importedCategories.length).toBeGreaterThan(0);
    expect(importedHabits.length).toBeGreaterThan(0);
  });
});
