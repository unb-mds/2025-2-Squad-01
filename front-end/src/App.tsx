import { Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './pages/HomePage';
import Commits from './pages/Commits';
import NotFound from './pages/NotFound';
import PullRequestsPage from './pages/PullRequests';
import PullRequests from './pages/PullRequests';

/**
 * App Component
 *
 * Root application component defining all routes.
 * Manages navigation between home page and metric analysis pages.
 * Includes fallback route for unimplemented features.
 */
function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/home" element={<HomePage />} />
      <Route path="/repos" element={<Navigate to="/repos/commits" replace />} />
      <Route path="/repos/commits" element={<Commits />} />
      <Route path="/repos/pullrequests" element={<PullRequests />} />
      {/* Fallback route for not implemented pages */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
