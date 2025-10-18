import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import App from './App.tsx';

/**
 * Application Entry Point
 *
 * Initializes the React application with routing support.
 * The basename is set to support GitHub Pages deployment.
 */
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter basename="/2025-2-Squad-01">
      <App />
    </BrowserRouter>
  </StrictMode>
);
