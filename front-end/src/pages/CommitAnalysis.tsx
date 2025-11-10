import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import { CommitMetricsChart } from '../components/Graphs';
import type { CommitMetricsDatum } from '../types';


export default function CommitAnalysisPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [data, setData] = useState<CommitMetricsDatum[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedAuthor, setSelectedAuthor] = useState<string>('all');
  const [selectedTimeline, setSelectedTimeline] = useState<string>('all');
  const [authors, setAuthors] = useState<string[]>([]);
  const [availableRepos, setAvailableRepos] = useState<string[]>([]);

  // Get repository from URL params (set by RepositoryToolbar)
  const repoParam = searchParams.get('repo');
  const selectedRepo = repoParam && repoParam !== 'all' ? repoParam : '2025-2-Squad-01';
  
  console.log('CommitAnalysis - repoParam:', repoParam);
  console.log('CommitAnalysis - selectedRepo:', selectedRepo);

  // Fetch available repositories on mount
  useEffect(() => {
    async function fetchAvailableRepos() {
      try {
        // Fetch the list of available repositories from JSON file
        const response = await fetch('/2025-2-Squad-01/available_repos.json');
        
        if (response.ok) {
          const repos = await response.json();
          console.log('Available repos loaded:', repos);
          setAvailableRepos(repos);
        } else {
          throw new Error('Could not fetch repo list');
        }
      } catch (err) {
        console.warn('Could not fetch repo list, using fallback:', err);
        // Fallback to hardcoded list
        const fallback = ['2025-2-Squad-01', '.github', '2023-2-JuizVirtual'];
        setAvailableRepos(fallback);
      }
    }

    fetchAvailableRepos();
  }, []);

  useEffect(() => {
    async function fetchCommitMetrics() {
      try {
        setLoading(true);
        setError(null);
        
        console.log('Fetching commit metrics for repo:', selectedRepo);
        
        // Fetch data by author
        const url = `/2025-2-Squad-01/commits_by_author_${selectedRepo}.json`;
        console.log('Fetching URL:', url);
        const response = await fetch(url);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch commit metrics: ${response.statusText}`);
        }
        
        const jsonData = await response.json();
        console.log('Loaded JSON data:', jsonData);
        
        // Extract authors from the new format (array of author objects)
        if (Array.isArray(jsonData)) {
          const authorList = jsonData.map((authorData: any) => authorData.author);
          setAuthors(authorList);
          
          // If 'all' is selected, merge all authors' data
          if (selectedAuthor === 'all') {
            // Aggregate all weeks across all authors
            const allWeeks = new Map<string, CommitMetricsDatum>();
            
            for (const authorData of jsonData) {
              const weeks = authorData.weeks || [];
              weeks.forEach((week: any) => {
                const existing = allWeeks.get(week.week);
                if (existing) {
                  existing.commits += week.commits;
                  existing.additions += week.additions;
                  existing.deletions += week.deletions;
                } else {
                  allWeeks.set(week.week, {
                    date: week.week,
                    commits: week.commits,
                    additions: week.additions,
                    deletions: week.deletions,
                    totalLines: 0,
                    changesPerCommit: 0
                  });
                }
              });
            }
            
            // Sort and recalculate cumulative metrics
            const sortedData = Array.from(allWeeks.values()).sort((a, b) => 
              a.date.localeCompare(b.date)
            );
            
            let totalLines = 0;
            sortedData.forEach(week => {
              totalLines += (week.additions - week.deletions);
              week.totalLines = Math.max(0, totalLines);
              week.changesPerCommit = week.commits > 0 
                ? Number(((week.additions + week.deletions) / week.commits).toFixed(1))
                : 0;
            });
            
            setData(sortedData);
          } else {
            // Get data for selected author
            const authorData = jsonData.find((a: any) => a.author === selectedAuthor);
            if (authorData && authorData.weeks) {
              const processedData = authorData.weeks.map((week: any) => ({
                date: week.week,
                commits: week.commits,
                additions: week.additions,
                deletions: week.deletions,
                totalLines: week.total_lines,
                changesPerCommit: week.changes_per_commit
              }));
              setData(processedData);
            } else {
              setData([]);
            }
          }
        } else {
          // Old format fallback
          const authorList = jsonData._metadata?.authors || Object.keys(jsonData.authors || {});
          setAuthors(authorList);
          
          if (selectedAuthor === 'all') {
            const allWeeks = new Map<string, CommitMetricsDatum>();
            
            for (const author in jsonData.authors) {
              const authorData = jsonData.authors[author];
              authorData.forEach((week: CommitMetricsDatum) => {
                const existing = allWeeks.get(week.date);
                if (existing) {
                  existing.commits += week.commits;
                  existing.additions += week.additions;
                  existing.deletions += week.deletions;
                } else {
                  allWeeks.set(week.date, { ...week });
                }
              });
            }
            
            const sortedData = Array.from(allWeeks.values()).sort((a, b) => 
              a.date.localeCompare(b.date)
            );
            
            let totalLines = 0;
            sortedData.forEach(week => {
              totalLines += (week.additions - week.deletions);
              week.totalLines = Math.max(0, totalLines);
              week.changesPerCommit = week.commits > 0 
                ? Number(((week.additions + week.deletions) / week.commits).toFixed(1))
                : 0;
            });
            
            setData(sortedData);
          } else {
            const authorData = jsonData.authors[selectedAuthor] || [];
            setData(authorData);
          }
        }
      } catch (err) {
        console.error('Error fetching commit metrics:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }

    fetchCommitMetrics();
  }, [selectedRepo, selectedAuthor]);

  // Apply timeline filter to data using useMemo
  const filteredData = useMemo(() => {
    if (selectedTimeline === 'all') return data;

    const now = new Date();
    const cutoffDate = new Date();

    switch (selectedTimeline) {
      case 'last-week':
        cutoffDate.setDate(now.getDate() - 7);
        break;
      case 'last-month':
        cutoffDate.setMonth(now.getMonth() - 1);
        break;
      case 'last-3-months':
        cutoffDate.setMonth(now.getMonth() - 3);
        break;
      case 'last-6-months':
        cutoffDate.setMonth(now.getMonth() - 6);
        break;
      case 'last-year':
        cutoffDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        return data;
    }

    console.log('Filtering timeline:', selectedTimeline);
    console.log('Cutoff date:', cutoffDate.toISOString());
    console.log('Total data points:', data.length);
    
    // Helper function to parse ISO week format (YYYY-Www) to a Date
    const parseISOWeek = (weekStr: string): Date => {
      // Handle 'unknown' or invalid formats
      if (!weekStr || weekStr === 'unknown' || !weekStr.includes('-W')) {
        return new Date(0); // Return epoch for invalid dates
      }
      
      const [yearStr, weekStr2] = weekStr.split('-W');
      const year = parseInt(yearStr);
      const week = parseInt(weekStr2);
      
      // ISO week date calculation
      // Week 1 is the week with the first Thursday of the year
      const jan4 = new Date(year, 0, 4);
      const weekStart = new Date(jan4);
      weekStart.setDate(jan4.getDate() - (jan4.getDay() || 7) + 1);
      weekStart.setDate(weekStart.getDate() + (week - 1) * 7);
      
      return weekStart;
    };
    
    const filtered = data.filter(d => {
      const itemDate = parseISOWeek(d.date);
      const matches = itemDate >= cutoffDate;
      if (!matches) {
        console.log('Filtered out:', d.date, 'parsed to', itemDate.toISOString(), 'cutoff:', cutoffDate.toISOString());
      }
      return matches;
    });
    
    console.log('Filtered data points:', filtered.length);
    return filtered;
  }, [data, selectedTimeline]);

  // Calculate statistics from filtered data
  const stats = filteredData.length > 0 ? {
    totalCommits: filteredData.reduce((sum, d) => sum + d.commits, 0),
    totalAdditions: filteredData.reduce((sum, d) => sum + d.additions, 0),
    totalDeletions: filteredData.reduce((sum, d) => sum + d.deletions, 0),
    avgChangesPerCommit: filteredData.length > 0 
      ? (filteredData.reduce((sum, d) => sum + d.changesPerCommit, 0) / filteredData.length).toFixed(1)
      : '0.0',
    currentTotalLines: filteredData.length > 0 ? filteredData[filteredData.length - 1].totalLines : 0,
  } : {
    totalCommits: 0,
    totalAdditions: 0,
    totalDeletions: 0,
    avgChangesPerCommit: '0.0',
    currentTotalLines: 0,
  };

  return (
    <DashboardLayout 
      currentPage="analysis" 
      currentSubPage="commit-analysis"
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-white">Commit Analysis</h2>
          <p className="text-slate-400 text-sm mt-2">
            Advanced visualization of commit metrics over time
          </p>
        </div>

        {/* Filters Section - Timeline and Members */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-white mb-4">Filters</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Timeline Filter */}
            <div>
              <label className="block text-slate-400 text-sm mb-2">
                Timeline:
              </label>
              <select
                value={selectedTimeline}
                onChange={(e) => setSelectedTimeline(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border text-white"
                style={{ backgroundColor: '#1a1a1a', borderColor: '#333333' }}
              >
                <option value="all">All Time</option>
                <option value="last-week">Last Week</option>
                <option value="last-month">Last Month</option>
                <option value="last-3-months">Last 3 Months</option>
                <option value="last-6-months">Last 6 Months</option>
                <option value="last-year">Last Year</option>
              </select>
            </div>

            {/* Members Filter */}
            <div>
              <label className="block text-slate-400 text-sm mb-2">
                Members:
              </label>
              <select
                id="author-select"
                value={selectedAuthor}
                onChange={(e) => setSelectedAuthor(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border text-white"
                style={{ backgroundColor: '#1a1a1a', borderColor: '#333333' }}
              >
                <option value="all">All</option>
                {authors.map((author) => (
                  <option key={author} value={author}>
                    {author}
                  </option>
                ))}
              </select>
            </div>
          </div>
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
              <CommitMetricsChart data={filteredData} />
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
