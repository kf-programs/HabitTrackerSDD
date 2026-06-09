import { describe, expect, it } from 'vitest';
import {
  decodeSharePayload,
  encodeSharePayload,
  getImportPreview,
  resolveImportedTitle,
  validateSharePayload,
} from '../../services/sharingService';

describe('sharingService', () => {
  it('encodes and decodes structure-only payloads', () => {
    const encoded = encodeSharePayload({
      version: '1',
      routine: { title: 'Morning', description: 'Start calm', status: 'active' },
      categories: [{ id: 'c1', name: 'Focus', orderIndex: 0 }],
      habits: [{ id: 'h1', categoryId: 'c1', title: 'Breathe', timeframe: 'daily', trackingType: 'yesno', status: 'active' }],
    });

    const decoded = decodeSharePayload(encoded);

    expect(decoded.routine.title).toBe('Morning');
    expect(decoded.categories).toHaveLength(1);
    expect(decoded.habits).toHaveLength(1);
  });

  it('rejects payloads that contain history fields', () => {
    expect(() =>
      validateSharePayload({
        version: '1',
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
      encodeSharePayload({
        version: '1',
        routine: { title: 'Morning', status: 'active' },
        categories: [{ id: 'c1', name: 'Focus', orderIndex: 0 }],
        habits: [{ id: 'h1', categoryId: 'c1', title: 'Breathe', timeframe: 'daily', trackingType: 'yesno', status: 'active' }],
      }),
    );

    expect(preview.cancelled).toBe(false);
    expect(preview.categoryCount).toBe(1);
    expect(preview.habitCount).toBe(1);
  });
});
