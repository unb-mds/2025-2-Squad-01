import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import Commits from './pages/Commits';
import Issues from './pages/Issues';
import PullRequests from './pages/PullRequests';

/**
 * App Component
 *
 * Root application component defining all routes.
 * Manages navigation between home page and metric analysis pages.
 */
function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/home" element={<HomePage />} />
      <Route path="/repos" element={<Commits />} />
      <Route path="/repos/commits" element={<Commits />} />
      <Route path="/repos/issues" element={<Issues />} />
      <Route path="/repos/pullrequests" element={<PullRequests />} />
    </Routes>
  );
}

export default App;
