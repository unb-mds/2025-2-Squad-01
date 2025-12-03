import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { PieDatum, BasicDatum } from '../types';
import type { ProcessedActivityResponse, RepoActivitySummary } from './Utils';
import DashboardLayout from '../components/DashboardLayout';
import BaseFilters from '../components/BaseFilters';
import { Histogram, PieChart, CommitMetricsChart} from '../components/Graphs';
import { Utils } from './Utils';
import { line } from 'd3';
import { AISummary } from '../components/AI.summary';

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
        selectedMembers={selectedMembers}
        selectedTime={selectedTime}
        onMemberChange={setSelectedMembers}
        onTimeChange={setSelectedTime}
      />


      {/* Charts Grid */}
      <div className="flex gap-6">
        {/* Commits Timeline */}
        <div
          className="border rounded-lg flex-1"
          style={{ backgroundColor: '#222222', borderColor: '#333333' }}
        >
          <div className="px-6 py-4 border-b" style={{ borderBottomColor: '#333333' }}>
            <h3 className="text-xl font-bold text-white">Timeline</h3>
          </div>

          <div className="p-6 min-h-[550px]">
            {loading ? (
              <div className="h-[420px] flex items-center justify-center">
                <div className="text-slate-400">Loading...</div>
              </div>
            ) : error ? (
              <div className="h-[420px] flex items-center justify-center">
                <p className="text-red-400">{error}</p>
              </div>
            ) : (
              <Histogram data={BasicData} type="Commit" />
            )}
          </div>
        </div>

        {/* Contributors */}
        <div
          className="border rounded-lg w-96 flex-shrink-0"
          style={{ backgroundColor: '#222222', borderColor: '#333333' }}
        >
          <div className="px-6 py-4 border-b" style={{ borderBottomColor: '#333333' }}>
            <h3 className="text-xl font-bold text-white">Contributors</h3>
          </div>

          <div className="p-6 h-[550px] overflow-y-auto">
            {loading ? (
              <div className="h-full flex items-center justify-center">
                <div className="text-slate-400">Loading...</div>
              </div>
            ) : error ? (
              <div className="h-full flex items-center justify-center">
                <p className="text-red-400">{error}</p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-center mb-2">
                  <PieChart data={pieData} type='Commit' />
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
      <div className="mt-5">
        <div
          className="border rounded-lg"
          style={{ backgroundColor: '#222222', borderColor: '#333333' }}
        >
          <div className="px-6 py-4 border-b" style={{ borderBottomColor: '#333333' }}>
            <h3 className="text-xl font-bold text-white">Commits Content Analysis</h3>
            <p className="text-slate-400 text-sm mt-1">
              Detailed analysis of code changes, commit frequency, and productivity metrics
            </p>
          </div>
         <div className="flex items-center justify-center mb-2">
                  <CommitMetricsChart data={BasicData} line_toggle={lineToggle} />
           </div>
          <div className="flex items-center justify-center mb-2">
            <button
              onClick={() => setLineToggle((prev) => !prev)}
              aria-pressed={lineToggle}
              title={lineToggle ? 'Hide Line Graph' : 'Show Line Graph'}
              className={`px-4 py-2 text-white rounded-lg transition-colors duration-200 ${
                lineToggle
                  ? 'border border-gray-400 bg-gray-400 hover:bg-gray-500'
                  : 'border border-gray-500 bg-gray-600 hover:bg-gray-700'
              }`}
            >
              {lineToggle ? 'Hide Line Graph' : 'Show Line Graph'}
            </button>
           </div>
        </div>
      </div>

      {/* AI Analysis Section */}
      <div className="mt-8">
        <div
          className="border rounded-lg p-6"
          style={{ backgroundColor: '#222222', borderColor: '#333333' }}
        >
          <div className="mb-4">
            <h3 className="text-xl font-bold text-white">Análise de IA - Commits</h3>
            <p className="text-slate-400 text-sm mt-1">
              Análise gerada por IA sobre os commits dos membros
            </p>
          </div>
          <AISummary
            title="Selecionar Membro"
            defaultAnalysisType="commits_analysis"
            showRepoFilter={false}
            syncWithUrlRepo={true}
            repositoryData={repositories}
          />
        </div>
      </div>
    </DashboardLayout>
  );
}