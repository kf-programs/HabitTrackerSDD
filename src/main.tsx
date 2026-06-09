import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import { AppShell } from './app/AppShell';
import { registerServiceWorker } from './services/offlineCache';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <AppShell />
  </React.StrictMode>,
);

void registerServiceWorker();
