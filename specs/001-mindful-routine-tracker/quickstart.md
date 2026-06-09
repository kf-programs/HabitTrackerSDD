# Quickstart: Mindful Routine Tracker

## Prerequisites
- Node.js 20+
- npm 10+

## Install
```bash
npm install
```

## Run Development Server
```bash
npm run dev
```

## Run Unit and Component Tests
```bash
npm run test
```

## Run Lint
```bash
npm run lint
```

## Validate CI Gate Locally
```bash
npm run lint && npm run test -- --run && npm run build
```

## Implementation Sequence
1. Phase 1: Create Dexie schema, tables, indexes, and seed data in `src/db`.
2. Phase 2: Implement app shell, bottom nav, and view routing in `src/app` and `src/components`.
3. Phase 3: Build routine workspace interactions including accordion and measurement auto-save behavior.
4. Phase 4: Implement `ParallelTimelines`, `DailyGrid`, and `WeeklyRibbon` with pastel token assignment and history continuity logic.
5. Phase 5: Implement share/export compression and import parse/preview/confirm flow using `src/utils/urlCodec.ts` and sharing services.
6. Phase 6: Configure PWA manifest, service worker caching, and icons.

## Manual Acceptance Smoke Checks
1. Create routine/category/habits without authentication and reload to confirm local persistence.
2. Go offline and verify navigation and tracking continue to work.
3. Complete daily and weekly habits and verify timeline updates in expected periods.
4. Edit/archive/delete habits and verify historical tiles remain unchanged.
5. Export routine and confirm shared link omits historical logs.
6. Open import link, confirm preview, import copy, and verify duplicate-title suffix behavior.
7. Build production output and verify generated PWA artifacts (`dist/sw.js`, `dist/manifest.webmanifest`).
