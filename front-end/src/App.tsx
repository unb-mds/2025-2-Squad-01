import { Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './pages/HomePage';
import Commits from './pages/Commits';
import NotFound from './pages/NotFound';
import CollaborationPage from './pages/Collaboration';
import HeatmapPage from './pages/Heatmap';
import PullRequestsPage from './pages/PullRequests';
import IssuesPage from './pages/Issues';
import Timeline from './pages/Timeline';

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
      <Route path="/overview/timeline" element={<Timeline />} />
      <Route path="/overview/collaboration" element={<CollaborationPage />} />
      <Route path="/overview/heatmap" element={<HeatmapPage />} />
      <Route path="/repos/commits" element={<Commits />} />
      <Route path="/repos/pullrequests" element={<PullRequestsPage />} />
      <Route path="/repos/issues" element={<IssuesPage/>} />
      {/* Fallback route for not implemented pages */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
