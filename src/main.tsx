import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import './i18n'

// Suppress browser extension errors that are not related to our code
const originalError = console.error;
console.error = (...args: any[]) => {
  const errorMessage = args[0]?.toString() || '';
  // Filter out browser extension errors
  if (
    errorMessage.includes('runtime.lastError') ||
    errorMessage.includes('Receiving end does not exist') ||
    errorMessage.includes('Extension context invalidated')
  ) {
    return; // Suppress these errors
  }
  originalError.apply(console, args);
};

// Handle unhandled promise rejections from browser extensions
window.addEventListener('unhandledrejection', (event) => {
  const errorMessage = event.reason?.toString() || '';
  if (
    errorMessage.includes('runtime.lastError') ||
    errorMessage.includes('Receiving end does not exist') ||
    errorMessage.includes('Extension context invalidated')
  ) {
    event.preventDefault(); // Suppress these errors
  }
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
