import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import App from './App.tsx';

/**
 * Application Entry Point
 *
 * Initializes the React application with routing support.
 * The basename is set dynamically based on environment:
 * - Development: "/" (local server)
 * - Production: "/2025-2-Squad-01" (GitHub Pages)
 */
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <App />
    </BrowserRouter>
  </StrictMode>
);
