import React from 'react'
import ReactDOM from 'react-dom/client'
import App from '@/App.jsx'
import '@/index.css'
import { registerServiceWorker } from '@/lib/registerSW'

console.log("React loaded", React.version);

// Always unregister stale service workers and purge caches before React mounts.
// This prevents duplicate-React / null-hook crashes from cached stale chunks.
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(regs => {
    if (regs.length > 0) {
      console.log(`[SW] Unregistering ${regs.length} service worker(s) to prevent stale cache issues`);
      regs.forEach(r => r.unregister());
    }
  });
}
if ('caches' in window) {
  caches.keys().then(keys => {
    if (keys.length > 0) {
      console.log(`[SW] Purging ${keys.length} cache(s)`, keys);
      keys.forEach(k => caches.delete(k));
    }
  });
}

// Register service worker for PWA / offline support (no-op in dev)
registerServiceWorker();

ReactDOM.createRoot(document.getElementById('root')).render(
  // <React.StrictMode>
  <App />
  // </React.StrictMode>,
)

if (import.meta.hot) {
  import.meta.hot.on('vite:beforeUpdate', () => {
    window.parent?.postMessage({ type: 'sandbox:beforeUpdate' }, '*');
  });
  import.meta.hot.on('vite:afterUpdate', () => {
    window.parent?.postMessage({ type: 'sandbox:afterUpdate' }, '*');
  });
}