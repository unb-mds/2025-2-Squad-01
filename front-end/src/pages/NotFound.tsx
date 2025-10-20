import { Link, useLocation } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';

/**
 * NotFound Component
 *
 * Fallback page for unimplemented routes or 404 errors.
 * Provides user-friendly messaging and navigation back to working pages.
 */
export default function NotFound() {
  const location = useLocation();

  return (
    <DashboardLayout currentPage="repos">
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="mb-8">
            <span className="text-8xl">🚧</span>
          </div>
          <h2 className="text-3xl font-bold text-white mb-4">Page Not Found</h2>
          <p className="text-slate-400 text-lg mb-2">
            The page <span className="text-blue-400 font-mono">{location.pathname}</span> is not
            available yet.
          </p>
          <p className="text-slate-500 text-sm mb-8">
            This feature is under development and will be available in a future release.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/repos/commits"
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
            >
              View Commits
            </Link>
            <Link
              to="/"
              className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors font-medium"
            >
              Go Home
            </Link>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
