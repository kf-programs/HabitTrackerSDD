import { Navigate, Route, Routes } from 'react-router-dom';
import { BottomNavBar } from './BottomNavBar';
import { DashboardView } from '../components/DashboardView';
import { AllRoutinesView } from '../components/AllRoutinesView';
import { RoutineWorkspace } from '../components/RoutineWorkspace';

export function Router() {
  return (
    <div className="min-h-screen bg-paper text-ink">
      <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-4 pb-24 pt-6 sm:px-6 lg:px-8">
        <Routes>
          <Route path="/" element={<DashboardView />} />
          <Route path="/routines" element={<AllRoutinesView />} />
          <Route path="/routines/:routineId" element={<RoutineWorkspace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <BottomNavBar />
    </div>
  );
}
