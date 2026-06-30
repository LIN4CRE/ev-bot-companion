import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Initialize Capacitor for mobile apps
if (typeof window !== 'undefined' && window.location.protocol === 'capacitor://') {
  import('./services/capacitorBridge').then(({ CapacitorBridge }) => {
    CapacitorBridge.initialize().catch(console.error);
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
