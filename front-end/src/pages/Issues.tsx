"use client";
import { Utils} from './Utils';
import { useEffect, useMemo, useState } from 'react';
import { scaleOrdinal, schemeSpectral } from 'd3';
import type {
  HistogramDatum,
  PieDatum,
} from '../types';
import type {
  ProcessedActivityResponse,
  RepoActivitySummary,
} from './Utils';
import DashboardLayout from '../components/DashboardLayout';
import BaseFilters from '../components/BaseFilters';
import { useSearchParams } from 'react-router-dom';
import { Histogram } from '../components/Histogram';
import { PieChart } from '../components/PieChart';

export default function IssuesPage() {
  const [data, setData] = useState<ProcessedActivityResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchParams] = useSearchParams();
  
  // Estados para os filtros
  const [selectedMember, setSelectedMember] = useState<string>('All Members');
  const [selectedTime, setSelectedTime] = useState<string>('All Time');

  useEffect(() => {
    if (typeof window === 'undefined') return;
    let cancelled = false;
    async function fetchData() {
      try {
        setLoading(true);
        const processedData = await Utils.fetchAndProcessActivityData("issue");
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
    const selectedRepoId: number | 'all' = !selectedParam || selectedParam === 'all'
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

  // Extrair lista de membros únicos
  const members = useMemo<string[]>(() => {
    if (!selectedRepo) return ['All Members'];
    const uniqueMembers = new Set<string>();
    selectedRepo.activities.forEach((activity) => {
      const memberName = activity.user.displayName || activity.user.login || 'Desconhecido';
      uniqueMembers.add(memberName);
    });
    return ['All Members', ...Array.from(uniqueMembers).sort()];
  }, [selectedRepo]);

  // Função para filtrar por período de tempo
  const filterByTime = (activities: any[], timeFilter: string) => {
    if (timeFilter === 'All Time') return activities;
    
    const now = new Date();
    const cutoffDate = new Date();
    
    switch (timeFilter) {
      case 'Last 24 hours':
        cutoffDate.setHours(now.getHours() - 24);
        break;
      case 'Last 7 days':
        cutoffDate.setDate(now.getDate() - 7);
        break;
      case 'Last 30 days':
        cutoffDate.setDate(now.getDate() - 30);
        break;
      case 'Last 6 months':
        cutoffDate.setMonth(now.getMonth() - 6);
        break;
      case 'Last Year':
        cutoffDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        return activities;
    }
    
    return activities.filter((activity) => {
      const activityDate = new Date(activity.date);
      return activityDate >= cutoffDate;
    });
  };

  // Aplicar filtros nas atividades
  const filteredActivities = useMemo(() => {
    if (!selectedRepo) return [];
    
    let activities = selectedRepo.activities;
    
    // Filtrar por membro
    if (selectedMember !== 'All Members') {
      activities = activities.filter((activity) => {
        const memberName = activity.user.displayName || activity.user.login || 'Desconhecido';
        return memberName === selectedMember;
      });
    }
    
    // Filtrar por tempo
    activities = filterByTime(activities, selectedTime);
    
    return activities;
  }, [selectedRepo, selectedMember, selectedTime]);

  const histogramData = useMemo<HistogramDatum[]>(() => {
    const counts = new Map<string, number>();
    for (const activity of filteredActivities) {
      const day = activity.date.slice(0, 10);
      counts.set(day, (counts.get(day) ?? 0) + 1);
    }
    return [...counts.entries()]
      .map(([dateLabel, count]) => ({ dateLabel, count }))
      .sort((a, b) => (a.dateLabel < b.dateLabel ? -1 : a.dateLabel > b.dateLabel ? 1 : 0));
  }, [filteredActivities]);

  const pieData = useMemo<PieDatum[]>(() => {
    const counts = new Map<string, number>();
    for (const activity of filteredActivities) {
      const label = activity.user.displayName || activity.user.login || 'Desconhecido';
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
      color: colorScale(label)
    }));
    if (restTotal > 0) result.push({ 
      label: 'Others', 
      value: restTotal, 
      color: colorScale('Others') 
    });
    return result;
  }, [filteredActivities]);

  return (
    <DashboardLayout currentSubPage="issues" currentPage="repos" data={data} currentRepo={selectedRepo ? selectedRepo.name : "No repository selected"}>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-3xl font-bold text-white">Issues analysis</h2>
            {selectedRepo && (
              <p className="text-slate-400 text-sm mt-2">
                {selectedRepo.name === 'All repositories'
                  ? `${repositories.length} repositories • ${filteredActivities.length} activities (filtered from ${selectedRepo.activities.length})`
                  : `${selectedRepo.name} • ${filteredActivities.length} issues (filtered from ${selectedRepo.activities.length})`}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="mb-6 border rounded-lg" style={{ backgroundColor: '#222222', borderColor: '#333333' }}>
        <BaseFilters
          members={members}
          selectedMember={selectedMember}
          onMemberChange={setSelectedMember}
          selectedTime={selectedTime}
          onTimeChange={setSelectedTime}
        />
      </div>

      {/* Grid de gráficos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Issues timeline */}
        <div className="border rounded-lg" style={{ backgroundColor: '#222222', borderColor: '#333333' }}>
          <p className="text-left p-6 font-bold text-white mb-4">Issues timeline</p>
          {loading ? (
            <div className="h-[300px] flex items-center justify-center">
              <div className="text-slate-400">Loading...</div>
            </div>
          ) : error ? (
            <div className="h-[300px] flex items-center justify-center">
              <p className="text-red-400">{error}</p>
            </div>
          ) : (
            <Histogram data={histogramData} />
          )}
        </div>

        {/* Contributors */}
        <div className="border rounded-lg p-6" style={{ backgroundColor: '#222222', borderColor: '#333333' }}>
          <h3 className="text-lg font-bold text-white mb-4">Contributors</h3>
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
              <div className="max-h-[180px] overflow-y-auto space-y-2">
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
    </DashboardLayout>
  );
}