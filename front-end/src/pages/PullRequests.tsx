import DashboardLayout from '../components/DashboardLayout';

/**
 * PullRequestsPage Component
 *
 * Page for analyzing pull request metrics.
 * Currently under development - will display PR statistics and collaboration patterns.
 */
export default function PullRequestsPage() {
  return (
    <DashboardLayout currentPage="pullrequests">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-white">Pull Requests</h2>
        <p className="text-slate-400 text-sm mt-2">Page under development</p>
      </div>
    </DashboardLayout>
  );
}
