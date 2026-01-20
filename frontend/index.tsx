import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

console.log('index.tsx: Starting React app...');

// #region agent log
// Simple startup ping to verify debug ingest is reachable
fetch('http://127.0.0.1:7242/ingest/3b5466ef-e4ad-485a-98f1-d363bc9e423a', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    sessionId: 'debug-session',
    runId: 'pre-fix',
    hypothesisId: 'PING',
    location: 'index.tsx:startup',
    message: 'React app started',
    data: {},
    timestamp: Date.now()
  })
}).catch(() => {});
// #endregion agent log

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

console.log('index.tsx: Root element found:', rootElement);

const root = ReactDOM.createRoot(rootElement);
console.log('index.tsx: React root created');

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

console.log('index.tsx: App rendered');