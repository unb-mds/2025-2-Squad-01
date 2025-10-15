"use client";

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
  schemeTableau10,
} from 'd3';
import type { PieArcDatum } from 'd3';
import type {
  RepoCommitSummary,
  GithubSummaryResponse,
  HistogramDatum,
  PieDatum,
  AggregatedCommit,
} from '../types';

// Types from the raw JSON file in data/bronze/commits_all.json
// We only use the fields we need.
 type RawCommit = {
  sha: string;
  html_url: string;
  commit: {
    message: string;
    author: { name: string; email?: string; date: string };
    committer: { name: string; email?: string; date: string };
  };
  author: { login: string; html_url: string } | null;
  repo_name: string;
  _metadata?: unknown;
};

function Histogram({ data }: { data: HistogramDatum[] }) {
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
        .text('Nenhum commit disponível para este repositório');
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

  return <svg ref={svgRef} className="w-full h-[300px]" role="img" aria-label="Histograma" />;
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
        .text('Nenhum commit disponível para este repositório');
      return;
    }

    const width = 320;
    const height = 320;
    const radius = Math.min(width, height) / 2 - 6;

    const color = scaleOrdinal<string, string>()
      .domain(data.map((d) => d.label))
      .range([...schemeTableau10, ...schemeTableau10]);

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

  return <svg ref={svgRef} className="w-full h-[320px]" role="img" aria-label="Gráfico de pizza" />;
}

function processRawCommitsData(rawCommits: RawCommit[]): GithubSummaryResponse {
  // Group commits by repository
  const commitsByRepo = new Map<string, RawCommit[]>();

  for (const commit of rawCommits) {
    // Skip metadata entries
    if ('_metadata' in commit) continue;
    const repoName = commit.repo_name;
    if (!repoName) continue;
    if (!commitsByRepo.has(repoName)) {
      commitsByRepo.set(repoName, []);
    }
    commitsByRepo.get(repoName)!.push(commit);
  }

  // Convert to our expected format
  const repositories: RepoCommitSummary[] = [];
  let repoId = 1;
  for (const [repoName, repoCommits] of commitsByRepo.entries()) {
    const aggregatedCommits: AggregatedCommit[] = repoCommits.map((commit) => ({
      sha: commit.sha,
      url: commit.html_url,
      message: commit.commit.message,
      author: {
        login: commit.author?.login || commit.commit.author.email || 'unknown',
        displayName: commit.commit.author.name || commit.author?.login || 'Desconhecido',
        profileUrl: commit.author?.html_url,
      },
      committedAt: commit.commit.author.date,
    }));

    repositories.push({
      id: repoId++,
      name: repoName,
      fullName: `unb-mds/${repoName}`,
      url: `https://github.com/unb-mds/${repoName}`,
      defaultBranch: 'main',
      commits: aggregatedCommits,
    });
  }

  const totalCommits = repositories.reduce((sum, repo) => sum + repo.commits.length, 0);
  return {
    org: 'unb-mds',
    generatedAt: new Date().toISOString(),
    repoCount: repositories.length,
    totalCommits,
    repositories,
  };
}

export default function CommitsPage() {
  const [data, setData] = useState<GithubSummaryResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedRepoId, setSelectedRepoId] = useState<number | 'all'>('all');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    let cancelled = false;
    async function fetchData() {
      try {
        setLoading(true);
        const response = await fetch(
          'https://raw.githubusercontent.com/unb-mds/2025-2-Squad-01/%2353-remodelacao-front-end/data/bronze/commits_all.json'
        );
        if (!response.ok) {
          throw new Error(`Erro ao buscar dados: ${response.status} ${response.statusText}`);
        }
        const rawCommits = await response.json();
        const processedData = processRawCommitsData(rawCommits);
        if (!cancelled) {
          setData(processedData);
          setSelectedRepoId('all');
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

  const repositories = useMemo<RepoCommitSummary[]>(() => data?.repositories ?? [], [data]);

  const selectedRepo = useMemo<RepoCommitSummary | null>(() => {
    if (selectedRepoId === 'all') {
      return {
        id: -1,
        name: 'Todos os repositórios',
        fullName: 'Todos os repositórios',
        url: '#',
        defaultBranch: 'main',
        commits: repositories.flatMap((repo) => repo.commits),
      } as RepoCommitSummary;
    }
    return repositories.find((repo) => repo.id === selectedRepoId) ?? null;
  }, [repositories, selectedRepoId]);

  useEffect(() => {
    if (repositories.length === 0) return;
    if (selectedRepoId === 'all') return;
    const exists = repositories.some((repo) => repo.id === selectedRepoId);
    if (!exists) setSelectedRepoId('all');
  }, [repositories, selectedRepoId]);

  const histogramData = useMemo<HistogramDatum[]>(() => {
    if (!selectedRepo) return [];
    const counts = new Map<string, number>();
    for (const commit of selectedRepo.commits) {
      const day = commit.committedAt.slice(0, 10);
      counts.set(day, (counts.get(day) ?? 0) + 1);
    }
    return [...counts.entries()]
      .map(([dateLabel, count]) => ({ dateLabel, count }))
      .sort((a, b) => (a.dateLabel < b.dateLabel ? -1 : a.dateLabel > b.dateLabel ? 1 : 0));
  }, [selectedRepo]);

  const pieData = useMemo<PieDatum[]>(() => {
    if (!selectedRepo) return [];
    const counts = new Map<string, number>();
    for (const commit of selectedRepo.commits) {
      const label = commit.author.displayName || commit.author.login || 'Desconhecido';
      counts.set(label, (counts.get(label) ?? 0) + 1);
    }
    const sorted = [...counts.entries()].sort((a, b) => b[1] - a[1]);
    const top = sorted.slice(0, 8);
    const restTotal = sorted.slice(8).reduce((acc, [, value]) => acc + value, 0);
    const result = top.map(([label, value]) => ({ label, value }));
    if (restTotal > 0) result.push({ label: 'Outros', value: restTotal });
    return result;
  }, [selectedRepo]);

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside
        className={`h-screen bg-slate-900/90 border-r border-slate-800 flex-shrink-0 transition-all duration-300 ease-in-out ${
          isSidebarOpen ? 'w-64' : 'w-16'
        }`}
      >
        <div className="h-full flex flex-col">
          {/* Brand */}
          <div className="p-4 border-b border-slate-800 flex items-center gap-3">
            <span className="text-xl">📊</span>
            {isSidebarOpen && (
              <div>
                <h1 className="text-lg font-semibold text-white leading-tight">Metrics</h1>
                <p className="text-[11px] text-slate-400">Analytics Dashboard</p>
              </div>
            )}
          </div>

          {/* Nav */}
          <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
            <button
              className={`w-full flex items-center ${isSidebarOpen ? 'justify-start gap-3' : 'justify-center'} px-3 py-2 rounded-md text-slate-300 hover:bg-slate-800 hover:text-white transition-colors`}
            >
              <span>📊</span>
              {isSidebarOpen && <span className="text-sm">Issues</span>}
            </button>
            <button
              className={`w-full flex items-center ${isSidebarOpen ? 'justify-start gap-3' : 'justify-center'} px-3 py-2 rounded-md text-blue-300 bg-blue-600/20 hover:bg-blue-600/25 border-l-2 border-blue-500 transition-colors ${
                isSidebarOpen ? '' : 'border-l-0'
              }`}
            >
              <span>💻</span>
              {isSidebarOpen && <span className="text-sm">Commits</span>}
            </button>
            <button
              className={`w-full flex items-center ${isSidebarOpen ? 'justify-start gap-3' : 'justify-center'} px-3 py-2 rounded-md text-slate-300 hover:bg-slate-800 hover:text-white transition-colors`}
            >
              <span>🔀</span>
              {isSidebarOpen && <span className="text-sm">Pull Requests</span>}
            </button>
            <button
              className={`w-full flex items-center ${isSidebarOpen ? 'justify-start gap-3' : 'justify-center'} px-3 py-2 rounded-md text-slate-300 hover:bg-slate-800 hover:text-white transition-colors`}
            >
              <span>🤝</span>
              {isSidebarOpen && <span className="text-sm">Colaboração</span>}
            </button>
            <button
              className={`w-full flex items-center ${isSidebarOpen ? 'justify-start gap-3' : 'justify-center'} px-3 py-2 rounded-md text-slate-300 hover:bg-slate-800 hover:text-white transition-colors`}
            >
              <span>🏗️</span>
              {isSidebarOpen && <span className="text-sm">Estrutura</span>}
            </button>
          </nav>

          {/* Footer */}
          <div className="p-3 border-t border-slate-800 space-y-2">
            <button
              className={`w-full flex items-center ${isSidebarOpen ? 'justify-start gap-3' : 'justify-center'} px-3 py-2 rounded-md text-slate-400 hover:bg-slate-800 hover:text-white transition-colors`}
            >
              <span>🏠</span>
              {isSidebarOpen && <span className="text-sm">Home</span>}
            </button>
            <div className="flex justify-center">
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="w-10 h-10 flex items-center justify-center rounded-md bg-slate-800 hover:bg-slate-700"
                aria-label={isSidebarOpen ? 'Recolher sidebar' : 'Expandir sidebar'}
                title={isSidebarOpen ? 'Recolher' : 'Expandir'}
              >
                <svg
                  className={`w-4 h-4 text-slate-300 transition-transform ${isSidebarOpen ? '' : 'rotate-180'}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Conteúdo principal */}
      <main className="flex-1 overflow-y-auto bg-slate-950">
        <div className="max-w-7xl mx-auto p-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-3xl font-bold text-white">Análise de Commits</h2>
                {selectedRepo && (
                  <p className="text-slate-400 text-sm mt-2">
                    {selectedRepo.name === 'Todos os repositórios'
                      ? `${repositories.length} repositório(s) • ${selectedRepo.commits.length} commits`
                      : `${selectedRepo.name} • ${selectedRepo.commits.length} commits`}
                  </p>
                )}
              </div>

              {/* Filtro */}
              <select
                value={selectedRepoId}
                onChange={(e) =>
                  setSelectedRepoId(e.target.value === 'all' ? 'all' : Number(e.target.value))
                }
                className="px-4 py-2 bg-slate-800 border border-slate-700 rounded text-white"
                disabled={loading}
              >
                <option value="all">
                  Todos os repositórios ({repositories.flatMap((r) => r.commits).length})
                </option>
                {repositories.map((repo) => (
                  <option key={repo.id} value={repo.id}>
                    {repo.name} ({repo.commits.length})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Grid de gráficos */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Timeline de Commits */}
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
              <p className="text-left font-bold text-white mb-4">Timeline de Commits</p>
              {loading ? (
                <div className="h-[300px] flex items-center justify-center">
                  <div className="text-slate-400">Carregando...</div>
                </div>
              ) : error ? (
                <div className="h-[300px] flex items-center justify-center">
                  <p className="text-red-400">{error}</p>
                </div>
              ) : (
                <Histogram data={histogramData} />)
              }
            </div>

            {/* Contribuidores */}
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
              <h3 className="text-lg font-bold text-white mb-4">Contribuidores</h3>
              {loading ? (
                <div className="h-[240px] flex items-center justify-center">
                  <div className="text-slate-400">Carregando...</div>
                </div>
              ) : error ? (
                <div className="h-[240px] flex items-center justify-center">
                  <p className="text-red-400">{error}</p>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-center mb-4">
                    <PieChart data={pieData} />
                  </div>
                  <div className="max-h-[200px] overflow-y-auto space-y-2">
                    {pieData.map((item) => (
                      <div
                        key={item.label}
                        className="flex items-center justify-between p-2 bg-slate-700/30 rounded"
                      >
                        <span className="text-sm text-slate-300">{item.label}</span>
                        <span className="text-xs font-bold text-slate-200">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
