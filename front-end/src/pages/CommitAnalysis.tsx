import { useState, useEffect } from 'react';
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
  const [data, setData] = useState<CommitMetricsDatum[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRepo] = useState<string>('2025-2-Squad-01');

  useEffect(() => {
    async function fetchCommitMetrics() {
      try {
        setLoading(true);
        setError(null);
        
        // Using mock data with additions/deletions until GraphQL extraction is available
        // Files in public/ are served from base path: /2025-2-Squad-01/
        const response = await fetch(`/2025-2-Squad-01/commits_metrics_${selectedRepo}_mock.json`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch commit metrics: ${response.statusText}`);
        }
        
        const jsonData = await response.json();
        setData(jsonData.metrics || []);
      } catch (err) {
        console.error('Error fetching commit metrics:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }

    fetchCommitMetrics();
  }, [selectedRepo]);

  // Calculate statistics from real data
  const stats = data.length > 0 ? {
    totalCommits: data.reduce((sum, d) => sum + d.commits, 0),
    totalAdditions: data.reduce((sum, d) => sum + d.additions, 0),
    totalDeletions: data.reduce((sum, d) => sum + d.deletions, 0),
    avgChangesPerCommit: data.length > 0 
      ? (data.reduce((sum, d) => sum + d.changesPerCommit, 0) / data.length).toFixed(1)
      : '0.0',
    currentTotalLines: data.length > 0 ? data[data.length - 1].totalLines : 0,
  } : {
    totalCommits: 0,
    totalAdditions: 0,
    totalDeletions: 0,
    avgChangesPerCommit: '0.0',
    currentTotalLines: 0,
  };

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
              {loading ? '...' : stats.totalCommits}
            </div>
          </div>
          <div className="border rounded-lg p-4" style={{ backgroundColor: '#222222', borderColor: '#333333' }}>
            <div className="text-slate-400 text-sm mb-1">Total Additions</div>
            <div className="text-2xl font-bold text-green-400">
              {loading ? '...' : `+${stats.totalAdditions.toLocaleString()}`}
            </div>
          </div>
          <div className="border rounded-lg p-4" style={{ backgroundColor: '#222222', borderColor: '#333333' }}>
            <div className="text-slate-400 text-sm mb-1">Total Deletions</div>
            <div className="text-2xl font-bold text-red-400">
              {loading ? '...' : `-${stats.totalDeletions.toLocaleString()}`}
            </div>
          </div>
          <div className="border rounded-lg p-4" style={{ backgroundColor: '#222222', borderColor: '#333333' }}>
            <div className="text-slate-400 text-sm mb-1">Avg Changes/Commit</div>
            <div className="text-2xl font-bold text-blue-400">
              {loading ? '...' : stats.avgChangesPerCommit}
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
              <CommitMetricsChart data={data} />
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
