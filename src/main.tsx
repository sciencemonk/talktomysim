import { Buffer } from 'buffer';
import process from 'process';
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

console.log('🚀 App initializing...');

// Ensure Buffer and process are available globally (also set in index.html)
if (!window.Buffer) window.Buffer = Buffer;
if (!window.process) window.process = process;
if (!window.global) window.global = window.globalThis;

try {
  const rootElement = document.getElementById("root");
  if (!rootElement) {
    throw new Error('Root element not found');
  }
  console.log('✅ Root element found, creating React root...');
  const root = createRoot(rootElement);
  root.render(<App />);
  console.log('✅ React app rendered successfully');
} catch (error) {
  console.error('❌ Fatal error during app initialization:', error);
  document.body.innerHTML = `
    <div style="padding: 20px; font-family: system-ui;">
      <h1 style="color: red;">Application Error</h1>
      <p>Failed to initialize the application. Check the console for details.</p>
      <pre style="background: #f5f5f5; padding: 10px; overflow: auto;">${error}</pre>
    </div>
  `;
}
