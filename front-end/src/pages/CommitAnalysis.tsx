import { useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { CommitMetricsChart } from '../components/Graphs';
import type { CommitMetricsDatum } from '../types';

/**
 * Commit Analysis Page
 * 
 * Displays advanced commit metrics visualization combining:
 * - Total lines over time (area chart)
 * - Additions and deletions (stacked bars)
 * - Number of commits (line)
 * - Average changes per commit (line)
 */
export default function CommitAnalysisPage() {
  // Mock data - This will be replaced with real data from GraphQL extraction
  const mockData: CommitMetricsDatum[] = [
    { date: '2025-01-01', commits: 15, additions: 120, deletions: 45, totalLines: 5000, changesPerCommit: 11 },
    { date: '2025-01-08', commits: 12, additions: 95, deletions: 30, totalLines: 5165, changesPerCommit: 10.4 },
    { date: '2025-01-15', commits: 18, additions: 150, deletions: 55, totalLines: 5260, changesPerCommit: 11.4 },
    { date: '2025-01-22', commits: 10, additions: 80, deletions: 25, totalLines: 5315, changesPerCommit: 10.5 },
    { date: '2025-01-29', commits: 14, additions: 200, deletions: 180, totalLines: 5335, changesPerCommit: 27.1 },
    { date: '2025-02-05', commits: 22, additions: 350, deletions: 120, totalLines: 5565, changesPerCommit: 21.4 },
    { date: '2025-02-12', commits: 16, additions: 180, deletions: 90, totalLines: 5655, changesPerCommit: 16.9 },
    { date: '2025-02-19', commits: 19, additions: 220, deletions: 100, totalLines: 5775, changesPerCommit: 16.8 },
    { date: '2025-02-26', commits: 25, additions: 290, deletions: 140, totalLines: 5925, changesPerCommit: 17.2 },
    { date: '2025-03-05', commits: 8, additions: 60, deletions: 20, totalLines: 5965, changesPerCommit: 10 },
    { date: '2025-03-12', commits: 20, additions: 170, deletions: 85, totalLines: 6050, changesPerCommit: 12.8 },
    { date: '2025-03-19', commits: 17, additions: 140, deletions: 70, totalLines: 6120, changesPerCommit: 12.4 },
    { date: '2025-03-26', commits: 23, additions: 280, deletions: 130, totalLines: 6270, changesPerCommit: 17.8 },
    { date: '2025-04-02', commits: 15, additions: 190, deletions: 95, totalLines: 6365, changesPerCommit: 19 },
    { date: '2025-04-09', commits: 19, additions: 210, deletions: 105, totalLines: 6470, changesPerCommit: 16.6 },
    { date: '2025-04-16', commits: 21, additions: 240, deletions: 115, totalLines: 6595, changesPerCommit: 16.9 },
    { date: '2025-04-23', commits: 26, additions: 320, deletions: 160, totalLines: 6755, changesPerCommit: 18.5 },
    { date: '2025-04-30', commits: 18, additions: 200, deletions: 100, totalLines: 6855, changesPerCommit: 16.7 },
    { date: '2025-05-07', commits: 16, additions: 180, deletions: 90, totalLines: 6945, changesPerCommit: 16.9 },
    { date: '2025-05-14', commits: 22, additions: 250, deletions: 125, totalLines: 7070, changesPerCommit: 17 },
    { date: '2025-05-21', commits: 20, additions: 220, deletions: 110, totalLines: 7180, changesPerCommit: 16.5 },
    { date: '2025-05-28', commits: 24, additions: 280, deletions: 140, totalLines: 7320, changesPerCommit: 17.5 },
    { date: '2025-06-04', commits: 14, additions: 160, deletions: 80, totalLines: 7400, changesPerCommit: 17.1 },
    { date: '2025-06-11', commits: 19, additions: 210, deletions: 105, totalLines: 7505, changesPerCommit: 16.6 },
    { date: '2025-06-18', commits: 17, additions: 190, deletions: 95, totalLines: 7600, changesPerCommit: 16.8 },
    { date: '2025-06-25', commits: 21, additions: 230, deletions: 115, totalLines: 7715, changesPerCommit: 16.4 },
    { date: '2025-07-02', commits: 13, additions: 150, deletions: 75, totalLines: 7790, changesPerCommit: 17.3 },
    { date: '2025-07-09', commits: 18, additions: 200, deletions: 100, totalLines: 7890, changesPerCommit: 16.7 },
    { date: '2025-07-16', commits: 16, additions: 180, deletions: 90, totalLines: 7980, changesPerCommit: 16.9 },
    { date: '2025-07-23', commits: 22, additions: 250, deletions: 125, totalLines: 8105, changesPerCommit: 17 },
    { date: '2025-07-30', commits: 20, additions: 220, deletions: 110, totalLines: 8215, changesPerCommit: 16.5 },
    { date: '2025-08-06', commits: 15, additions: 170, deletions: 85, totalLines: 8300, changesPerCommit: 17 },
    { date: '2025-08-13', commits: 19, additions: 210, deletions: 105, totalLines: 8405, changesPerCommit: 16.6 },
    { date: '2025-08-20', commits: 17, additions: 190, deletions: 95, totalLines: 8500, changesPerCommit: 16.8 },
    { date: '2025-08-27', commits: 23, additions: 260, deletions: 130, totalLines: 8630, changesPerCommit: 17 },
    { date: '2025-09-03', commits: 12, additions: 140, deletions: 70, totalLines: 8700, changesPerCommit: 17.5 },
    { date: '2025-09-10', commits: 18, additions: 200, deletions: 100, totalLines: 8800, changesPerCommit: 16.7 },
    { date: '2025-09-17', commits: 16, additions: 180, deletions: 90, totalLines: 8890, changesPerCommit: 16.9 },
    { date: '2025-09-24', commits: 21, additions: 230, deletions: 115, totalLines: 9005, changesPerCommit: 16.4 },
    { date: '2025-10-01', commits: 14, additions: 160, deletions: 80, totalLines: 9085, changesPerCommit: 17.1 },
    { date: '2025-10-08', commits: 25, additions: 290, deletions: 145, totalLines: 9230, changesPerCommit: 17.4 },
    { date: '2025-10-15', commits: 19, additions: 210, deletions: 105, totalLines: 9335, changesPerCommit: 16.6 },
    { date: '2025-10-22', commits: 17, additions: 190, deletions: 95, totalLines: 9430, changesPerCommit: 16.8 },
    { date: '2025-10-29', commits: 22, additions: 240, deletions: 120, totalLines: 9550, changesPerCommit: 16.4 },
  ];

  const [selectedRepo] = useState<string>('all');
  const [loading] = useState<boolean>(false);
  const [error] = useState<string | null>(null);

  return (
    <DashboardLayout currentPage="analysis" currentSubPage="commit-analysis">
      <div className="space-y-6">
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-white">Commit Analysis</h2>
          <p className="text-slate-400 text-sm mt-2">
            Advanced visualization of commit metrics over time
          </p>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="border rounded-lg p-4" style={{ backgroundColor: '#222222', borderColor: '#333333' }}>
            <div className="text-slate-400 text-sm mb-1">Total Commits</div>
            <div className="text-2xl font-bold text-white">
              {mockData.reduce((sum, d) => sum + d.commits, 0)}
            </div>
          </div>
          <div className="border rounded-lg p-4" style={{ backgroundColor: '#222222', borderColor: '#333333' }}>
            <div className="text-slate-400 text-sm mb-1">Total Additions</div>
            <div className="text-2xl font-bold text-green-400">
              +{mockData.reduce((sum, d) => sum + d.additions, 0).toLocaleString()}
            </div>
          </div>
          <div className="border rounded-lg p-4" style={{ backgroundColor: '#222222', borderColor: '#333333' }}>
            <div className="text-slate-400 text-sm mb-1">Total Deletions</div>
            <div className="text-2xl font-bold text-red-400">
              -{mockData.reduce((sum, d) => sum + d.deletions, 0).toLocaleString()}
            </div>
          </div>
          <div className="border rounded-lg p-4" style={{ backgroundColor: '#222222', borderColor: '#333333' }}>
            <div className="text-slate-400 text-sm mb-1">Avg Changes/Commit</div>
            <div className="text-2xl font-bold text-blue-400">
              {(mockData.reduce((sum, d) => sum + d.changesPerCommit, 0) / mockData.length).toFixed(1)}
            </div>
          </div>
        </div>

        {/* States */}
        {loading && (
          <div className="text-slate-400 text-center py-8">
            Loading commit metrics...
          </div>
        )}
        
        {error && (
          <div className="text-red-400 text-center py-8 bg-red-900/20 rounded-lg border border-red-800">
            Error: {error}
          </div>
        )}

        {/* Chart */}
        {!loading && !error && (
          <div className="border rounded-lg" style={{ backgroundColor: '#222222', borderColor: '#333333' }}>
            {/* Header da seção */}
            <div className="px-6 py-4 border-b" style={{ borderBottomColor: '#333333' }}>
              <h3 className="text-xl font-bold text-white">Commit Metrics Over Time</h3>
              <p className="text-slate-400 text-sm mt-1">
                Visualizing code changes, commit frequency, and productivity metrics
              </p>
            </div>
            
            {/* Área do gráfico */}
            <div className="p-6">
              <CommitMetricsChart data={mockData} />
            </div>
          </div>
        )}

        {/* Info Section */}
        <div className="border rounded-lg" style={{ backgroundColor: '#222222', borderColor: '#333333' }}>
          <div className="px-6 py-4 border-b" style={{ borderBottomColor: '#333333' }}>
            <h3 className="text-xl font-bold text-white">Understanding the Chart</h3>
          </div>
          <div className="p-6">
            <div className="grid md:grid-cols-2 gap-6 text-sm">
              <div>
                <h4 className="text-white font-semibold mb-3">Visual Elements:</h4>
                <ul className="space-y-2 text-slate-300">
                  <li className="flex items-start gap-2">
                    <span className="text-slate-500 mt-0.5">•</span>
                    <span><strong className="text-slate-400">Gray Area:</strong> Cumulative total lines of code</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-0.5">•</span>
                    <span><strong className="text-green-400">Green Bars:</strong> Lines added</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500 mt-0.5">•</span>
                    <span><strong className="text-red-400">Red Bars:</strong> Lines deleted</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-orange-500 mt-0.5">•</span>
                    <span><strong className="text-orange-400">Orange Line:</strong> Number of commits</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 mt-0.5">•</span>
                    <span><strong className="text-blue-400">Blue Line:</strong> Average changes per commit</span>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="text-white font-semibold mb-3">Insights:</h4>
                <ul className="space-y-2 text-slate-300">
                  <li className="flex items-start gap-2">
                    <span className="text-slate-500 mt-0.5">•</span>
                    <span>Identify periods of high activity</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-slate-500 mt-0.5">•</span>
                    <span>Detect code refactoring (high deletions)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-slate-500 mt-0.5">•</span>
                    <span>Monitor codebase growth trends</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-slate-500 mt-0.5">•</span>
                    <span>Analyze commit size patterns</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
