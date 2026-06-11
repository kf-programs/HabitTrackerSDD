import { useEffect, useState } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { Router } from './Router';
import { seedDatabase } from '../db/seed';
import { listRoutines } from '../repositories/routinesRepository';
import { isOfflineStartup } from '../services/offlineCache';
import { CalmingBackground } from '../components/CalmingBackgroud';

export function AppShell() {
  const [isOffline, setIsOffline] = useState(isOfflineStartup());

  useEffect(() => {
    void seedDatabase();
  }, []);

  useEffect(() => {
    const handleOffline = () => setIsOffline(true);
    const handleOnline = () => setIsOffline(false);

    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', handleOnline);

    return () => {
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online', handleOnline);
    };
  }, []);

  const routines = useLiveQuery(async () => listRoutines(), [], []);

  return (
    <BrowserRouter>
      <CalmingBackground />
      <div className="relative z-10">
        {isOffline ? (
          <div className="mx-auto mt-4 w-full max-w-6xl rounded-2xl bg-butter/80 px-4 py-3 text-sm text-ink/80 shadow-soft">
            Offline mode: local data is available and changes will stay on this device.
          </div>
        ) : null}
        <Router routines={routines} />
      </div>
    </BrowserRouter>
  );
}
