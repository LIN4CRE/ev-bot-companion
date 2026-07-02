import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import { ErrorBoundary } from './components/ErrorBoundary';
import './index.css';

// Initialize Capacitor for mobile apps
if (typeof window !== 'undefined' && window.location.protocol === 'capacitor://') {
  import('./services/capacitorBridge').then(({ CapacitorBridge }) => {
    CapacitorBridge.initialize().catch(console.error);
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
);
