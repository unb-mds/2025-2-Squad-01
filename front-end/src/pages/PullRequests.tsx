import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { PieDatum, BasicDatum } from '../types';
import type { ProcessedActivityResponse, RepoActivitySummary } from './Utils';
import DashboardLayout from '../components/DashboardLayout';
import BaseFilters from '../components/BaseFilters';
import { Histogram, PieChart} from '../components/Graphs';
import { Utils } from './Utils';

export default function PullRequestsPage() {
  const [data, setData] = useState<ProcessedActivityResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchParams] = useSearchParams();
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [selectedTime, setSelectedTime] = useState<string>('Last 24 hours');
  const [chartType, setChartType] = useState<'line' | 'bar'>('line');
  const [lineToggle, setLineToggle] = useState(false);
  useEffect(() => {
    if (typeof window === 'undefined') return;
    let cancelled = false;

    async function fetchData() {
      try {
        setLoading(true);
        const processedData = await Utils.fetchAndProcessActivityData('pull_request');
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

  const repoParam = searchParams.get('repo');

  const { selectedRepo, members } = useMemo(() => {
    return Utils.selectRepoAndFilter(repositories, repoParam);
  }, [repositories, repoParam]);

  useEffect(() => {
    setSelectedMembers([]);
  }, [selectedRepo?.id]);

  // Aplicar filtros nas atividades (membro + tempo)
  const filteredActivities = useMemo(() => {
    if (!selectedRepo) return [];
    return Utils.applyFilters(selectedRepo.activities, selectedMembers, selectedTime);
  }, [selectedRepo, selectedMembers, selectedTime]);

  const BasicData = useMemo<BasicDatum[]>(() => {
    if (!selectedRepo) return [];
    
    const groupByHour = selectedTime === 'Last 24 hours';
    
    // Não passa cutoffDate, pois o filtro já foi aplicado
    return Utils.aggregateBasicData(filteredActivities, {
      groupByHour,
      cutoffDate: null,
    });
  }, [selectedRepo, filteredActivities, selectedTime]);

  const pieData = useMemo<PieDatum[]>(() => {
    if (!selectedRepo) return [];
    
    // Não passa cutoffDate, pois o filtro já foi aplicado
    return Utils.aggregatePieData(filteredActivities, {
      cutoffDate: null,
      selectedTime,
    });
  }, [selectedRepo, filteredActivities, selectedTime]);

  return (
    <DashboardLayout
      currentSubPage="pullrequests"
      currentPage="repos"
      data={data}
      currentRepo={selectedRepo ? selectedRepo.name : 'No repository selected'}
    >
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-3xl font-bold text-white">Pull Requests analysis</h2>
            {selectedRepo && (
              <p className="text-slate-400 text-sm mt-2">
                {selectedRepo.name === 'All repositories'
                  ? `${repositories.length} repositories • ${selectedRepo.activities.length} activities`
                  : `${selectedRepo.name} • ${selectedRepo.activities.length} pull requests`}
              </p>
            )}
          </div>
        </div>
      </div>

      <BaseFilters
        members={members}
        selectedMembers={selectedMembers}
        selectedTime={selectedTime}
        onMemberChange={setSelectedMembers}
        onTimeChange={setSelectedTime}
      />


      {/* Charts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-90">
       
        <div
          className="border rounded-lg h-170 w-170"
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
              <Histogram data={BasicData} type='Pull request'/>
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
                  <PieChart data={pieData} type='Pull request' />
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