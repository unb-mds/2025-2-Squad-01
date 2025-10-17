"use client";
import { Utils} from './Utils';
import { useEffect, useMemo, useRef, useState } from 'react';
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
import type {
  HistogramDatum,
  PieDatum,
} from '../types';
import type {
  ProcessedActivityResponse,
  RepoActivitySummary,
} from './Utils';
import DashboardLayout from '../components/DashboardLayout';
import { useSearchParams } from 'react-router-dom';
import BaseFilters from '../components/base-filters';


export function Histogram({ data }: { data: HistogramDatum[] }) {
  const svgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    if (!svgRef.current) return;
    const svg = select(svgRef.current);
    svg.selectAll('*').remove();

    if (!data.length) {
      svg
        .append('text')
        .attr('x', '50%')
        .attr('y', '50%')
        .attr('text-anchor', 'middle')
        .attr('fill', '#e2e8f0')
  .text('No commits available for this repository');
      return;
    }

    const width = 700;
    const height = 300;
    const margin = { top: 24, right: 24, bottom: 72, left: 56 };

    const x = scaleBand<string>()
      .domain(data.map((d) => d.dateLabel))
      .range([margin.left, width - margin.right])
      .padding(0.12);

    const y = scaleLinear()
      .domain([0, max(data, (d: HistogramDatum) => d.count) ?? 0])
      .nice()
      .range([height - margin.bottom, margin.top]);

    svg.attr('viewBox', `0 0 ${width} ${height}`);

    const tickInterval = Math.max(1, Math.floor(data.length / 12));
    const tickValues = data
      .map((d, i) => ({ v: d.dateLabel, i }))
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
  .text('Commits');

    svg
      .append('g')
      .selectAll('rect')
      .data<HistogramDatum>(data)
      .join('rect')
      .attr('x', (d) => x(d.dateLabel) ?? margin.left)
      .attr('y', (d) => y(d.count))
      .attr('width', x.bandwidth())
      .attr('height', (d) => y(0) - y(d.count))
      .attr('rx', 4)
      .attr('fill', '#3b82f6')
      .append('title')
      .text((d) => `${d.dateLabel}: ${d.count} commit(s)`);
  }, [data]);

  return <svg ref={svgRef} className="w-full h-[300px]" role="img" aria-label="Histogram" />;
}

function PieChart({ data }: { data: PieDatum[] }) {
  const svgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    if (!svgRef.current) return;
    const svg = select(svgRef.current);
    svg.selectAll('*').remove();
    if (!data.length) {
      svg
        .append('text')
        .attr('x', '50%')
        .attr('y', '50%')
        .attr('text-anchor', 'middle')
        .attr('fill', 'currentColor')
  .text('No commits available for this repository');
      return;
    }

    const width = 240;
    const height = 240;
    const radius = Math.min(width, height) / 2 - 6;

    const color = scaleOrdinal<string, string>()
      .domain(data.map((d) => d.label))
      .range([...schemeSpectral[3], ...schemeSpectral[11]]);

    svg.attr('viewBox', `0 0 ${width} ${height}`);
    const g = svg.append('g').attr('transform', `translate(${width / 2},${height / 2})`);
    const pieGen = d3Pie<PieDatum>().sort(null).value((d) => d.value);
    const arcGen = d3Arc<PieArcDatum<PieDatum>>().innerRadius(0).outerRadius(radius);
    const arcs = pieGen(data);

    g
      .selectAll('path')
      .data<PieArcDatum<PieDatum>>(arcs)
      .join('path')
      .attr('d', (d) => arcGen(d) ?? '')
      .attr('fill', (d) => color(d.data.label))
      .attr('stroke', '#fff')
      .attr('stroke-width', 1.2)
      .append('title')
      .text((d) => `${d.data.label}: ${d.data.value} commit(s)`);
  }, [data]);

  return <svg ref={svgRef} className="w-full h-[240px]" role="img" aria-label="Pie chart" />;
}

export default function CommitsPage() {
  const [data, setData] = useState<ProcessedActivityResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchParams] = useSearchParams();
  const [selectedMember, setSelectedMember] = useState<string>('All');

  useEffect(() => {
    if (typeof window === 'undefined') return;
    let cancelled = false;
    async function fetchData() {
      try {
        setLoading(true);
        const processedData = await Utils.fetchAndProcessActivityData("commit");
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

  // Reset member filter when repository changes
  useEffect(() => {
    setSelectedMember('All');
  }, [selectedRepo?.id]);

  const members = useMemo<string[]>(() => {
    if (!selectedRepo) return [];
    const memberSet = new Set<string>();
    
    for ( const activity of selectedRepo.activities) {
      const name = activity.user.displayName || activity.user.login || 'Unknown';  
      memberSet.add(name);
    }
    const membersFound = Array.from(memberSet).sort((a,b) => a.localeCompare(b));
    return ['All', ...membersFound];
  }, [selectedRepo]);

  const filteredActivities = useMemo(() => {
    if (!selectedRepo) return [] as typeof selectedRepo.activities | [];
    
    if (!selectedMember || selectedMember === 'All') return selectedRepo.activities;
    
    return selectedRepo.activities.filter((activity) => {
      const name = activity.user.displayName || activity.user.login || 'Unknown';
      return name === selectedMember;
    });
  }, [selectedRepo, selectedMember]);

  const histogramData = useMemo<HistogramDatum[]>(() => {
    if (!selectedRepo) return [];
    const counts = new Map<string, number>();
    for (const activity of filteredActivities) {
      const day = activity.date.slice(0, 10);
      counts.set(day, (counts.get(day) ?? 0) + 1);
    }
    return [...counts.entries()]
      .map(([dateLabel, count]) => ({ dateLabel, count }))
      .sort((a, b) => (a.dateLabel < b.dateLabel ? -1 : a.dateLabel > b.dateLabel ? 1 : 0));
  }, [selectedRepo, filteredActivities]);

  const pieData = useMemo<PieDatum[]>(() => {
    if (!selectedRepo) return [];
    const counts = new Map<string, number>();
    for (const activity of selectedRepo.activities) {
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
      color: colorScale(label)
    }));
    if (restTotal > 0) result.push({ 
      label: 'Others', 
      value: restTotal, 
      color: colorScale('Others') 
    });
    return result;

    
  }, [selectedRepo, filteredActivities]);

  return (
  <DashboardLayout currentSubPage="commits" currentPage="repos" data ={data} currentRepo={selectedRepo ? selectedRepo.name : "No repository selected"}>
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

      {/* Grid de gráficos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
  {/* Commits timeline */}
        <div className="border rounded-lg" style={{ backgroundColor: '#222222', borderColor: '#333333' }}>
          
          {/* Header da seção */}
          <div className="px-6 py-4 border-b" style={{ borderBottomColor: '#333333' }}>
            <h3 className="text-xl font-bold text-white">Timeline</h3>
          </div>

          <BaseFilters members={members} selectedMember={selectedMember} onMemberChange={setSelectedMember}></BaseFilters>

          {/* Área do gráfico */}
          <div className="p-1">
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
        </div>

        {/* Contribuidores */}
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
      </div>
    </DashboardLayout>
  );
}
