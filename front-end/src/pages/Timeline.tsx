import DashboardLayout from '../components/DashboardLayout';

/**
 * Timeline Component
 *
 * Overview timeline page displaying repository activities.
 */
export default function Timeline() {
  return (
    <DashboardLayout currentPage="overview" currentSubPage="timeline">
      
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">Timeline</h1>
          <p className="text-slate-400">
            Overview of repository activities
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}
