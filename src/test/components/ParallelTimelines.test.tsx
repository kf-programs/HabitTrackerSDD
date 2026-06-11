import React from 'react';
import { describe, expect, it } from 'vitest';
import { renderWithProviders } from '../utils';
import { DailyGrid } from '../../components/DailyGrid';
import { WeeklyRibbon } from '../../components/WeeklyRibbon';
import type { TimelineTileSnapshot } from '../../services/timelineService';

function makeDailyTiles(): TimelineTileSnapshot[] {
  return Array.from({ length: 14 }, (_, index) => ({
    periodKey: `2026-06-${String(index + 1).padStart(2, '0')}`,
    completed: index % 2 === 0,
    pastelToken: 'mist-2',
  }));
}

describe('Timeline layout', () => {
  it('renders the daily grid with weekday rows and axis labels', () => {
    renderWithProviders(<DailyGrid tiles={makeDailyTiles()} />);

    expect(document.body.textContent).toContain('Days');
    expect(document.body.textContent).toContain('Weeks');
    expect(document.body.textContent).toContain('Sun');
    expect(document.body.textContent).toContain('Sat');
  });

  it('renders compact daily tiles', () => {
    renderWithProviders(<DailyGrid tiles={makeDailyTiles()} />);

    const items = document.querySelectorAll('[role="listitem"]');
    expect(items[0]?.className).toContain('h-2');
    expect(items[0]?.className).toContain('w-2');
  });

  it('aligns weekly pills to an explicit week-column grid', () => {
    renderWithProviders(
      <WeeklyRibbon
        tiles={[
          { periodKey: '2026-06-01-SUN', completed: true, pastelToken: 'mist-2' },
          { periodKey: '2026-06-08-SUN', completed: false, pastelToken: 'mist-2' },
        ]}
        columnCount={2}
      />,
    );

    expect(document.body.textContent).toContain('Weekly');
    expect(document.querySelector('[data-week-columns="2"]')).toBeTruthy();
  });
});