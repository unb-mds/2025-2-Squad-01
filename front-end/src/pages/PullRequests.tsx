"use client";
import { useEffect, useState, useRef, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  select,
  scaleBand,
  scaleLinear,
  axisBottom,
  axisLeft,
  max,
  pie as d3Pie,
  arc as d3Arc,
  scaleOrdinal,
  schemeSpectral
} from 'd3';
import type { PieArcDatum } from 'd3';
import DashboardLayout from '../components/DashboardLayout';
import { Utils, ProcessedActivityResponse, RepoActivitySummary } from './Utils';
import BaseFilters from '../components/base-filters';

// Componente de Histograma
interface HistogramProps {
  data: { date: string; count: number }[];
}

function Histogram({ data }: HistogramProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || !data.length) return;

    const svg = select(svgRef.current);
    svg.selectAll('*').remove();

    const width = 700;
    const height = 300;
    const margin = { top: 24, right: 24, bottom: 72, left: 56 };

    const x = scaleBand<string>()
      .domain(data.map((d) => d.date))
      .range([margin.left, width - margin.right])
      .padding(0.12);

    const y = scaleLinear()
      .domain([0, max(data, (d) => d.count) ?? 0])
      .nice()
      .range([height - margin.bottom, margin.top]);

    svg.attr('viewBox', `0 0 ${width} ${height}`);

    const tickInterval = Math.max(1, Math.floor(data.length / 12));
    const tickValues = data
      .map((d, i) => ({ v: d.date, i }))
      .filter((x) => x.i % tickInterval === 0)
      .map((x) => x.v);

    const xAxis = svg
      .append('g')
      .attr('transform', `translate(0, ${height - margin.bottom})`)
      .call(axisBottom(x).tickValues(tickValues).tickFormat((v) => String(v)));
    xAxis
      .selectAll('text')
      .style('text-anchor', 'end')
      .style('fill', '#e2e8f0')
      .attr('dx', '-0.6em')
      .attr('dy', '0.15em')
      .attr('transform', 'rotate(-35)');
    xAxis.selectAll('line').style('stroke', '#475569');
    xAxis.select('.domain').style('stroke', '#475569');

    const yAxis = svg
      .append('g')
      .attr('transform', `translate(${margin.left},0)`) 
      .call(axisLeft(y).ticks(6));
    yAxis.selectAll('text').style('fill', '#e2e8f0');
    yAxis.selectAll('line').style('stroke', '#475569');
    yAxis.select('.domain').style('stroke', '#475569');
    yAxis
      .append('text')
      .attr('x', 0)
      .attr('y', margin.top - 16)
      .attr('fill', '#e2e8f0')
      .attr('text-anchor', 'start')
      .attr('font-size', 12)
      .text('Pull Requests');

    svg
      .append('g')
      .selectAll('rect')
      .data(data)
      .join('rect')
      .attr('x', (d) => x(d.date) ?? margin.left)
      .attr('y', (d) => y(d.count))
      .attr('width', x.bandwidth())
      .attr('height', (d) => y(0) - y(d.count))
      .attr('rx', 4)
      .attr('fill', '#3b82f6')
      .append('title')
      .text((d) => `${d.date}: ${d.count} pull request(s)`);
  }, [data]);

  return <svg ref={svgRef} className="w-full h-[300px]" role="img" aria-label="Histograma" />;
}

// Componente de Pizza
interface PieChartProps {
  data: { name: string; value: number; color: string }[];
}

function PieChart({ data }: PieChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || !data.length) return;

    const svg = select(svgRef.current);
    svg.selectAll('*').remove();

    const width = 240;
    const height = 240;
    const radius = Math.min(width, height) / 2 - 6;

    svg.attr('viewBox', `0 0 ${width} ${height}`);
    const g = svg.append('g').attr('transform', `translate(${width / 2},${height / 2})`);

    const pie = d3Pie<{ name: string; value: number; color: string }>()
      .value(d => d.value)
      .sort(null);

    const arc = d3Arc<PieArcDatum<{ name: string; value: number; color: string }>>()
      .innerRadius(0)
      .outerRadius(radius);

    const arcs = pie(data);

    g.selectAll('path')
      .data<PieArcDatum<{ name: string; value: number; color: string }>>(arcs)
      .join('path')
      .attr('d', (d) => arc(d) ?? '')
      .attr('fill', d => d.data.color)
      .attr('stroke', '#fff')
      .attr('stroke-width', 1.2)
      .append('title')
      .text((d) => `${d.data.name}: ${d.data.value} pull request(s)`);

  }, [data]);

  return (
    <svg ref={svgRef} className="w-full h-[240px]" role="img" aria-label="Gráfico de pizza" />
  );
}

export default function PullRequestsPage() {
  const [searchParams] = useSearchParams();
  const selectedRepoParam = searchParams.get('repo');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processedData, setProcessedData] = useState<ProcessedActivityResponse | null>(null);
  const [selectedRepoData, setSelectedRepoData] = useState<RepoActivitySummary | null>(null);
  const [selectedMember, setSelectedMember] = useState<string>('All');
  const [selectedTime, setSelectedTime] = useState<string>('All Time');

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch from GitHub like Commits page does
        const response = await fetch(
          'https://raw.githubusercontent.com/unb-mds/2025-2-Squad-01/main/data/silver/temporal_events.json'
        );
        if (!response.ok) {
          throw new Error(`Error fetching data: ${response.status} ${response.statusText}`);
        }
        const rawActivities = await response.json();
        
        // Filter for PR events (pr_created and pr_closed)
        const prActivities = rawActivities.filter((activity: any) => 
          activity.type === 'pr_created' || activity.type === 'pr_closed'
        );
        
        const data = Utils.processActivityData(prActivities);
        setProcessedData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error loading data');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  useEffect(() => {
    if (!processedData) {
      setSelectedRepoData(null);
      return;
    }
    
    // If no repo parameter or repo=all, show all repositories data
    if (!selectedRepoParam || selectedRepoParam === 'all') {
      // Create aggregate "All repositories" data
      const allActivities = processedData.repositories.flatMap(repo => repo.activities);
      setSelectedRepoData({
        id: -1,
        name: 'All repositories',
        activities: allActivities,
      });
      return;
    }
    
    const repoId = Number(selectedRepoParam);
    const repo = processedData.repositories.find(r => r.id === repoId);
    setSelectedRepoData(repo || null);
  }, [processedData, selectedRepoParam]);

  // Reset member filter when repository changes
  useEffect(() => {
    setSelectedMember('All');
  }, [selectedRepoData?.id]);

  // Extract unique members from activities
  const members = useMemo<string[]>(() => {
    if (!selectedRepoData) return [];
    const memberSet = new Set<string>();
    
    for (const activity of selectedRepoData.activities) {
      const name = activity.user.displayName || activity.user.login || 'Unknown';  
      memberSet.add(name);
    }
    const membersFound = Array.from(memberSet).sort((a, b) => a.localeCompare(b));
    return ['All', ...membersFound];
  }, [selectedRepoData]);

  // Filter activities by selected member
  const filteredActivities = useMemo(() => {
    if (!selectedRepoData) return [];
    
    if (!selectedMember || selectedMember === 'All') return selectedRepoData.activities;
    
    return selectedRepoData.activities.filter((activity) => {
      const name = activity.user.displayName || activity.user.login || 'Unknown';
      return name === selectedMember;
    });
  }, [selectedRepoData, selectedMember]);

  // Calculate cutoff date based on selectedTime
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
        return null; // All Time
    }
  }, [selectedTime]);

  // Processar dados para o histograma
  const histogramData = useMemo(() => {
    if (!selectedRepoData) return [];
    
    const counts = new Map<string, number>();
    for (const activity of filteredActivities) {
      const day = activity.date.slice(0, 10);

      // Apply timeline filter
      if (cutoffDate) {
        const activityDate = new Date(day + 'T00:00:00Z');
        if (activityDate < cutoffDate) continue;
      }

      counts.set(day, (counts.get(day) ?? 0) + 1);
    }
    return [...counts.entries()]
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [selectedRepoData, filteredActivities, cutoffDate]);

  // Processar dados para o gráfico de pizza
  const pieChartData = useMemo(() => {
    if (!selectedRepoData) return [];
    
    const userCounts: Record<string, number> = {};
    for (const activity of filteredActivities) {
      // Apply timeline filter
      if (cutoffDate) {
        const day = activity.date.slice(0, 10);
        const activityDate = new Date(day + 'T00:00:00Z');
        if (activityDate < cutoffDate) continue;
      }

      const user = activity.user.displayName || activity.user.login || 'Unknown';
      userCounts[user] = (userCounts[user] || 0) + 1;
    }
    
    const sorted = Object.entries(userCounts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
    
    const top = sorted.slice(0, 8);
    const restTotal = sorted.slice(8).reduce((acc, item) => acc + item.value, 0);
    
    const colorScale = scaleOrdinal<string, string>()
      .domain([...top.map(item => item.name), 'Others'])
      .range([...schemeSpectral[3], ...schemeSpectral[11]]);
    
    const result = top.map(item => ({
      name: item.name,
      value: item.value,
      color: colorScale(item.name)
    }));
    if (restTotal > 0) result.push({ 
      name: 'Others', 
      value: restTotal, 
      color: colorScale('Others') 
    });
    return result;
  }, [selectedRepoData, filteredActivities, cutoffDate]);

  return (
    <DashboardLayout 
      currentSubPage="pullrequests" 
      currentPage="repos" 
      data={processedData} 
      currentRepo={selectedRepoData ? selectedRepoData.name : "No repository selected"}
    >
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-white">Pull Requests analysis</h2>
        {selectedRepoData && (
          <p className="text-slate-400 text-sm mt-2">
            {selectedRepoData.name === 'All repositories'
              ? `${processedData?.repositories.length} repositories • ${selectedRepoData.activities.length} activities`
              : `${selectedRepoData.name} • ${selectedRepoData.activities.length} pull requests`}
          </p>
        )}
      </div>

      <BaseFilters 
        members={members} 
        selectedMember={selectedMember} 
        selectedTime={selectedTime} 
        onMemberChange={setSelectedMember} 
        onTimeChange={setSelectedTime}
      />

      {loading && (
        <div className="text-slate-400 text-center py-8">
          Loading data...
        </div>
      )}

      {error && (
        <div className="text-red-400 text-center py-8 bg-red-900/20 rounded-lg border border-red-800">
          Error: {error}
        </div>
      )}

      {!loading && !error && processedData && (
        <>
          {selectedRepoParam && !selectedRepoData && (
            <div className="text-slate-400 text-center py-8 bg-yellow-900/20 rounded-lg border border-yellow-800">
              No Pull Request data found for the selected repository
            </div>
          )}

          {selectedRepoData && (
            <>
              {/* Grid de gráficos - Layout horizontal */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {/* Timeline */}
                <div className="border rounded-lg" style={{ backgroundColor: '#222222', borderColor: '#333333' }}>
                  {/* Header da seção */}
                  <div className="px-6 py-4 border-b" style={{ borderBottomColor: '#333333' }}>
                    <h3 className="text-xl font-bold text-white">Timeline</h3>
                  </div>
                  
                  {/* Área do gráfico */}
                  <div className="pt-3">
                    {loading ? (
                      <div className="h-[420px] flex items-center justify-center">
                        <div className="text-slate-400">Loading...</div>
                      </div>
                    ) : error ? (
                      <div className="h-[420px] flex items-center justify-center">
                        <p className="text-red-400">{error}</p>
                      </div>
                    ) : histogramData.length > 0 ? (
                      <Histogram data={histogramData} />
                    ) : (
                      <div className="h-[300px] flex items-center justify-center">
                        <div className="text-slate-400">No data available</div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Contributors */}
                <div className="border rounded-lg" style={{ backgroundColor: '#222222', borderColor: '#333333' }}>
                  {/* Header da seção */}
                  <div className="px-6 py-4 border-b" style={{ borderBottomColor: '#333333' }}>
                    <h3 className="text-xl font-bold text-white">Contributors</h3>
                  </div>
                  
                  {/* Área do gráfico */}
                  <div className="p-6">
                    {loading ? (
                      <div className="h-[140px] flex items-center justify-center">
                        <div className="text-slate-400">Loading...</div>
                      </div>
                    ) : error ? (
                      <div className="h-[140px] flex items-center justify-center">
                        <p className="text-red-400">{error}</p>
                      </div>
                    ) : pieChartData.length > 0 ? (
                      <>
                        <div className="flex items-center justify-center mb-2">
                          <PieChart data={pieChartData} />
                        </div>
                        <div className="max-h-[400px] overflow-y-auto space-y-2">
                          {pieChartData.map((item) => (
                            <div
                              key={item.name}
                              className="flex items-center justify-between p-2 rounded"
                              style={{ backgroundColor: 'rgba(51, 51, 51, 0.3)' }}
                            >
                              <div className="flex items-center gap-2">
                                <div 
                                  className="w-3 h-3 rounded-full" 
                                  style={{ backgroundColor: item.color }}
                                ></div>
                                <span className="text-sm text-slate-300">{item.name}</span>
                              </div>
                              <span className="text-xs font-bold text-slate-200">{item.value}</span>
                            </div>
                          ))}
                        </div>
                      </>
                    ) : (
                      <div className="h-[140px] flex items-center justify-center">
                        <div className="text-slate-400">No data available</div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Estatísticas */}
              <div className="bg-[#222222] p-6 rounded-lg border border-[#333333]">
                <h3 className="text-xl font-semibold text-white mb-4">Statistics</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-[#333333] p-4 rounded-lg">
                    <p className="text-slate-400 text-sm">Total Pull Requests</p>
                    <p className="text-2xl font-bold text-white mt-1">
                      {selectedRepoData.activities.length}
                    </p>
                  </div>
                  <div className="bg-[#333333] p-4 rounded-lg">
                    <p className="text-slate-400 text-sm">Contributors</p>
                    <p className="text-2xl font-bold text-white mt-1">
                      {pieChartData.length}
                    </p>
                  </div>
                  <div className="bg-[#333333] p-4 rounded-lg">
                    <p className="text-slate-400 text-sm">Period</p>
                    <p className="text-2xl font-bold text-white mt-1">
                      {histogramData.length > 0
                        ? `${histogramData[0].date} - ${histogramData[histogramData.length - 1].date}`
                        : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}
        </>
      )}
    </DashboardLayout>
  );
}
