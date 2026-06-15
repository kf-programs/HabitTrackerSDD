import React from 'react';
import { describe, expect, it } from 'vitest';
import { renderWithProviders } from '../utils';
import { DailyGrid } from '../../components/DailyGrid';
import type { TimelineTileSnapshot } from '../../services/timelineService';

function makeDailyTiles(): TimelineTileSnapshot[] {
  return Array.from({ length: 14 }, (_, index) => ({
    periodKey: `2026-06-${String(index + 1).padStart(2, '0')}`,
    completed: index % 2 === 0,
    pastelToken: 'mist-2',
  }));
}

describe('Timeline layout', () => {
  it('renders the unified grid with weekday labels and timeline bounds', () => {
    renderWithProviders(
      <DailyGrid
        dailyTiles={makeDailyTiles()}
        weeklyTiles={[
          { periodKey: '2026-06-01-SUN', completed: true, pastelToken: 'mist-2' },
          { periodKey: '2026-06-08-SUN', completed: false, pastelToken: 'mist-2' },
        ]}
        startLabel="Jun 1, 2026"
        endLabel="Jun 14, 2026"
        selectedDayKey="2026-06-09"
      />,
    );

    expect(document.body.textContent).toContain('Days');
    expect(document.body.textContent).toContain('Jun 1, 2026');
    expect(document.body.textContent).toContain('Jun 14, 2026');
    expect(document.body.textContent).toContain('Sun');
    expect(document.body.textContent).toContain('Week');
  });

  it('renders larger daily tiles and distinct weekly pill shape', () => {
    renderWithProviders(
      <DailyGrid
        dailyTiles={makeDailyTiles()}
        weeklyTiles={[{ periodKey: '2026-05-31-SUN', completed: true, pastelToken: 'mist-2' }]}
        startLabel="Jun 1, 2026"
        endLabel="Jun 14, 2026"
        selectedDayKey="2026-06-07"
      />,
    );

    const items = document.querySelectorAll('[role="listitem"]');
    expect(items[0]?.className).toContain('h-full');
    expect(items[0]?.className).toContain('w-full');

    const timeline = document.querySelector('[role="list"]');
    expect((timeline as HTMLElement | null)?.style.gridTemplateRows).toContain('1.25rem');
    expect((timeline as HTMLElement | null)?.style.gridTemplateColumns).toContain('1.25rem');

    const weeklyPill = document.querySelector('[data-shape="weekly-pill"]');
    expect(weeklyPill).toBeTruthy();
  });
});