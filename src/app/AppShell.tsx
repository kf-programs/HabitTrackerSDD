import { useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { Router } from './Router';
import { seedDatabase } from '../db/seed';
import { listRoutines } from '../repositories/routinesRepository';

export function AppShell() {
  useEffect(() => {
    void seedDatabase();
  }, []);

  const routines = useLiveQuery(async () => listRoutines(), [], []);

  return (
    <BrowserRouter>
      <Router routines={routines} />
    </BrowserRouter>
  );
}
