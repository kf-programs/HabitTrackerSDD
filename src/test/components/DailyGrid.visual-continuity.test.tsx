import React from 'react';
import { describe, expect, it } from 'vitest';
import { renderWithProviders } from '../utils';
import { DailyGrid } from '../../components/DailyGrid';

describe('DailyGrid visual continuity', () => {
  it('applies consistent completion styling and selected day highlighting', () => {
    renderWithProviders(
      <DailyGrid
        dailyTiles={[
          { periodKey: '2026-06-08', completed: true, pastelToken: 'mist-2' },
          { periodKey: '2026-06-09', completed: true, pastelToken: 'mist-2' },
        ]}
        weeklyTiles={[]}
        startLabel="Jun 8, 2026"
        endLabel="Jun 9, 2026"
        selectedDayKey="2026-06-09"
      />,
    );

    const selected = document.querySelector('[title="2026-06-09"]');
    expect(selected?.className).toContain('ring-2');
  });
});
