import { BrowserRouter } from 'react-router-dom';
import { Router } from './Router';

export function AppShell() {
  return (
    <BrowserRouter>
      <Router />
    </BrowserRouter>
  );
}
