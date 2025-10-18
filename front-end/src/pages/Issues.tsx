import DashboardLayout from '../components/DashboardLayout';

/**
 * IssuesPage Component
 *
 * Page for analyzing repository issues.
 * Currently under development - will display issue metrics and trends.
 */
export default function IssuesPage() {
  return (
    <DashboardLayout currentPage="issues">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-white">Issues</h2>
        <p className="text-slate-400 text-sm mt-2">Page under development</p>
      </div>
    </DashboardLayout>
  );
}
