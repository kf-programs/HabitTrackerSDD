import { Navigate, Route, Routes } from 'react-router-dom';
import { BottomNavBar } from './BottomNavBar';
import { DashboardView } from '../components/DashboardView';
import { AllRoutinesView } from '../components/AllRoutinesView';
import { RoutineWorkspace } from '../components/RoutineWorkspace';
import { ImportRouteView } from '../components/ImportRouteView';
import type { RoutineRecord } from '../db/schema';

interface RouterProps {
  routines: RoutineRecord[];
}

export function Router({ routines }: RouterProps) {
  return (
    <div className="min-h-screen bg-paper text-ink">
      <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-4 pb-24 pt-6 sm:px-6 lg:px-8">
        <Routes>
          <Route path="/" element={<DashboardView routines={routines} />} />
          <Route path="/routines" element={<AllRoutinesView routines={routines} />} />
          <Route path="/routines/:routineId" element={<RoutineWorkspace />} />
          <Route path="/import" element={<ImportRouteView />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <BottomNavBar />
    </div>
  );
}
