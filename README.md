# Mindful Routine Tracker

A privacy-first, collaborative mindful routine tracker built with TypeScript, React, Vite, and IndexedDB (Dexie).
Created using Spec Driven Development facilitated by GitHub SpecKit agentic workflows.
https://habittracker.kfranzsolutions.com/

## Stack
- TypeScript + React 18 + Vite 5
- Tailwind CSS
- Dexie + dexie-react-hooks
- Vitest + React Testing Library
- PWA via vite-plugin-pwa

## Getting Started
1. Install dependencies:
   npm install
2. Start the development server:
   npm run dev
3. Run tests:
   npm run test -- --run
4. Run lint checks:
   npm run lint
5. Build production assets:
   npm run build

## Core Flows
- Create routines with categories and habits (yes/no, counter, measurement)
- Track daily and weekly progress with timeline visuals
- Export and import structure-only routine links

## Quality Gate
Run before integration:
- npm run lint
- npm run test -- --run
- npm run build
