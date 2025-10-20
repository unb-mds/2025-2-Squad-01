import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { scaleOrdinal, schemeSpectral } from 'd3';
import type { HistogramDatum, PieDatum } from '../types';
import type { ProcessedActivityResponse, RepoActivitySummary } from './Utils';
import DashboardLayout from '../components/DashboardLayout';
import BaseFilters from '../components/BaseFilters';
import { Histogram, PieChart } from '../components/Graphs';
import { Utils } from './Utils';

/**
 * CommitsPage Component
 *
 * Main page for commit analysis and visualization.
 * Features:
 * - Repository selection and filtering
 * - Timeline-based commit histogram
 * - Contributor distribution pie chart
 * - Member and time range filtering
 */
export default function CommitsPage() {
  const [data, setData] = useState<ProcessedActivityResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchParams] = useSearchParams();
  const [selectedMember, setSelectedMember] = useState<string>('All');
  const [selectedTime, setSelectedTime] = useState<string>('Last 24 hours');

  useEffect(() => {
    if (typeof window === 'undefined') return;
    let cancelled = false;

    async function fetchData() {
      try {
        setLoading(true);
        const processedData = await Utils.fetchAndProcessActivityData('commit');
        if (!cancelled) {
          setData(processedData);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : String(err));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchData();
    return () => {
      cancelled = true;
    };
  }, []);

  const repositories = useMemo<RepoActivitySummary[]>(() => data?.repositories ?? [], [data]);

  const selectedRepo = useMemo<RepoActivitySummary | null>(() => {
    const selectedParam = searchParams.get('repo');
    const selectedRepoId: number | 'all' =
      !selectedParam || selectedParam === 'all'
        ? 'all'
        : Number.isNaN(Number(selectedParam))
          ? 'all'
          : Number(selectedParam);

    if (selectedRepoId === 'all') {
      return {
        id: -1,
        name: 'All repositories',
        activities: repositories.flatMap((repo) => repo.activities),
      } as RepoActivitySummary;
    }
    return repositories.find((repo) => repo.id === selectedRepoId) ?? null;
  }, [repositories, searchParams]);

  useEffect(() => {
    setSelectedMember('All');
  }, [selectedRepo?.id]);

  const members = useMemo<string[]>(() => {
    if (!selectedRepo) return [];
    const memberSet = new Set<string>();

    for (const activity of selectedRepo.activities) {
      const name = activity.user.displayName || activity.user.login || 'Unknown';
      memberSet.add(name);
    }
    const membersFound = Array.from(memberSet).sort((a, b) => a.localeCompare(b));
    return ['All', ...membersFound];
  }, [selectedRepo]);

  const filteredActivities = useMemo(() => {
    if (!selectedRepo) return [];

    if (!selectedMember || selectedMember === 'All') return selectedRepo.activities;

    return selectedRepo.activities.filter((activity) => {
      const name = activity.user.displayName || activity.user.login || 'Unknown';
      return name === selectedMember;
    });
  }, [selectedRepo, selectedMember]);

  const cutoffDate = useMemo<Date | null>(() => {
    const now = new Date();
    switch (selectedTime) {
      case 'Last 24 hours': {
        const d = new Date(now);
        d.setDate(d.getDate() - 1);
        return d;
      }
      case 'Last 7 days': {
        const d = new Date(now);
        d.setDate(d.getDate() - 7);
        return d;
      }
      case 'Last 30 days': {
        const d = new Date(now);
        d.setDate(d.getDate() - 30);
        return d;
      }
      case 'Last 6 months': {
        const d = new Date(now);
        d.setMonth(d.getMonth() - 6);
        return d;
      }
      case 'Last Year': {
        const d = new Date(now);
        d.setFullYear(d.getFullYear() - 1);
        return d;
      }
      default:
        return null;
    }
  }, [selectedTime]);

  const histogramData = useMemo<HistogramDatum[]>(() => {
    if (!selectedRepo) return [];
    const counts = new Map<string, number>();

    for (const activity of filteredActivities) {
      const day = activity.date.slice(0, 10);

      if (cutoffDate) {
        const activityDate = new Date(day + 'T00:00:00Z');
        if (activityDate < cutoffDate) continue;
      }

      counts.set(day, (counts.get(day) ?? 0) + 1);
    }

    return [...counts.entries()]
      .map(([dateLabel, count]) => ({ dateLabel, count }))
      .sort((a, b) => (a.dateLabel < b.dateLabel ? -1 : a.dateLabel > b.dateLabel ? 1 : 0));
  }, [selectedRepo, filteredActivities, cutoffDate]);

  const pieData = useMemo<PieDatum[]>(() => {
    if (!selectedRepo) return [];
    const counts = new Map<string, number>();

    for (const activity of filteredActivities) {
      if (cutoffDate) {
        const day = activity.date.slice(0, 10);
        const activityDate = new Date(day + 'T00:00:00Z');
        if (activityDate < cutoffDate) continue;
      }
      const label = activity.user.displayName || activity.user.login || 'Unknown';
      counts.set(label, (counts.get(label) ?? 0) + 1);
    }

    const sorted = [...counts.entries()].sort((a, b) => b[1] - a[1]);
    const top = sorted.slice(0, 8);
    const restTotal = sorted.slice(8).reduce((acc, [, value]) => acc + value, 0);

    const colorScale = scaleOrdinal<string, string>()
      .domain([...top.map(([label]) => label), 'Others'])
      .range([...schemeSpectral[3], ...schemeSpectral[11]]);

    const result = top.map(([label, value]) => ({
      label,
      value,
      color: colorScale(label),
    }));

    if (restTotal > 0) {
      result.push({
        label: 'Others',
        value: restTotal,
        color: colorScale('Others'),
      });
    }

    return result;
  }, [selectedRepo, filteredActivities, cutoffDate]);

  return (
    <DashboardLayout
      currentSubPage="commits"
      currentPage="repos"
      data={data}
      currentRepo={selectedRepo ? selectedRepo.name : 'No repository selected'}
    >
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-3xl font-bold text-white">Commits analysis</h2>
            {selectedRepo && (
              <p className="text-slate-400 text-sm mt-2">
                {selectedRepo.name === 'All repositories'
                  ? `${repositories.length} repositories • ${selectedRepo.activities.length} activities`
                  : `${selectedRepo.name} • ${selectedRepo.activities.length} commits`}
              </p>
            )}
          </div>
        </div>
      </div>

      <BaseFilters
        members={members}
        selectedMember={selectedMember}
        selectedTime={selectedTime}
        onMemberChange={setSelectedMember}
        onTimeChange={setSelectedTime}
      />

      {/* Charts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-90">
        {/* Commits Timeline */}
        <div
          className="border rounded-lg h-200 w-190"
          style={{ backgroundColor: '#222222', borderColor: '#333333' }}
        >
          <div className="px-6 py-4 border-b" style={{ borderBottomColor: '#333333' }}>
            <h3 className="text-xl font-bold text-white">Timeline</h3>
          </div>

          <div className="pt-3 h-auto w-auto">
            {loading ? (
              <div className="h-[420px] flex items-center justify-center">
                <div className="text-slate-400">Loading...</div>
              </div>
            ) : error ? (
              <div className="h-[420px] flex items-center justify-center">
                <p className="text-red-400">{error}</p>
              </div>
            ) : (
              <Histogram data={histogramData} />
            )}
          </div>
        </div>

        {/* Contributors */}
        <div
          className="border rounded-lg"
          style={{ backgroundColor: '#222222', borderColor: '#333333' }}
        >
          <div className="px-6 py-4 border-b" style={{ borderBottomColor: '#333333' }}>
            <h3 className="text-xl font-bold text-white">Contributors</h3>
          </div>

          <div className="p-6">
            {loading ? (
              <div className="h-[140px] flex items-center justify-center">
                <div className="text-slate-400">Loading...</div>
              </div>
            ) : error ? (
              <div className="h-[140px] flex items-center justify-center">
                <p className="text-red-400">{error}</p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-center mb-2">
                  <PieChart data={pieData} />
                </div>
                <div className="max-h-[400px] overflow-y-auto space-y-2">
                  {pieData.map((item) => (
                    <div
                      key={item.label}
                      className="flex items-center justify-between p-2 rounded"
                      style={{ backgroundColor: 'rgba(51, 51, 51, 0.3)' }}
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: item.color }}
                        ></div>
                        <span className="text-sm text-slate-300">{item.label}</span>
                      </div>
                      <span className="text-xs font-bold text-slate-200">{item.value}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
