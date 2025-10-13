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

type RawCommit = {
  sha: string;
  html_url: string;
  commit: {
    message: string;
    author: {
      name: string;
      email?: string;
      date: string;
    };
    committer: {
      name: string;
      email?: string;
      date: string;
    };
  };
  author: {
    login: string;
    html_url: string;
  } | null;
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
      svg.append('text').attr('x', '50%').attr('y', '50%').attr('text-anchor', 'middle').attr('fill', 'currentColor').text('Nenhum commit disponível para este repositório');
      return;
    }

  const width = 700;
  const height = 300;
    const margin = { top: 24, right: 24, bottom: 72, left: 56 };

    const x = scaleBand<string>().domain(data.map((d) => d.dateLabel)).range([margin.left, width - margin.right]).padding(0.12);
    const y = scaleLinear().domain([0, max(data, (d: HistogramDatum) => d.count) ?? 0]).nice().range([height - margin.bottom, margin.top]);

    svg.attr('viewBox', `0 0 ${width} ${height}`);

    const tickInterval = Math.max(1, Math.floor(data.length / 12));
    const tickValues = data.map((d, i) => ({ v: d.dateLabel, i })).filter((x) => x.i % tickInterval === 0).map((x) => x.v);

    const xAxis = svg.append('g').attr('transform', `translate(0, ${height - margin.bottom})`).call(axisBottom(x).tickValues(tickValues).tickFormat((v) => String(v)));
    xAxis.selectAll('text').style('text-anchor', 'end').attr('dx', '-0.6em').attr('dy', '0.15em').attr('transform', 'rotate(-35)');

    const yAxis = svg.append('g').attr('transform', `translate(${margin.left},0)`).call(axisLeft(y).ticks(6));
    yAxis.append('text').attr('x', 0).attr('y', margin.top - 16).attr('fill', 'currentColor').attr('text-anchor', 'start').attr('font-size', 12).text('Commits');

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
      .attr('fill', 'var(--color-primary, #2563eb)')
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
      svg.append('text').attr('x', '50%').attr('y', '50%').attr('text-anchor', 'middle').attr('fill', 'currentColor').text('Nenhum commit disponível para este repositório');
      return;
    }

  const width = 320;
  const height = 320;
    const radius = Math.min(width, height) / 2 - 6;

    const color = scaleOrdinal<string, string>().domain(data.map((d) => d.label)).range([...schemeTableau10, ...schemeTableau10]);

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
    const aggregatedCommits: AggregatedCommit[] = repoCommits.map(commit => ({
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
  
  // Calculate total commits
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRepoId, setSelectedRepoId] = useState<number | 'all'>('all');

  useEffect(() => {
    // Não fazer fetch durante build/export estático
    if (typeof window === 'undefined') return;
    
    let cancelled = false;

    async function fetchData() {
      try {
        setLoading(true);
        const response = await fetch('https://raw.githubusercontent.com/unb-mds/2025-2-Squad-01/issue45/43/42-bronze-extraction-consolidation/data/bronze/commits_all.json');
        if (!response.ok) {
          throw new Error(`Erro ao buscar dados: ${response.status} ${response.statusText}`);
        }

        const rawCommits = await response.json();
        
        // Process raw commits into our expected format
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
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchData();

    return () => {
      cancelled = true;
    };
  }, []);

  const repositoriesSource = data?.repositories;
  const repositories = useMemo<RepoCommitSummary[]>(() => repositoriesSource ?? [], [repositoriesSource]);

  const selectedRepo = useMemo(() => {
    if (selectedRepoId === 'all') {
      return {
        id: -1,
        name: 'Todos os repositórios',
        fullName: 'Todos os repositórios',
        url: '#',
        defaultBranch: 'main',
        commits: repositories.flatMap((repo) => repo.commits),
      } satisfies RepoCommitSummary;
    }

    return repositories.find((repo) => repo.id === selectedRepoId) ?? null;
  }, [repositories, selectedRepoId]);

  // Reset selection if repo no longer exists
  useEffect(() => {
    if (repositories.length === 0) return;
    if (selectedRepoId === 'all') return;

    const exists = repositories.some((repo) => repo.id === selectedRepoId);
    if (!exists) {
      setSelectedRepoId('all');
    }
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
    if (restTotal > 0) {
      result.push({ label: 'Outros', value: restTotal });
    }
    return result;
  }, [selectedRepo]);

  const color = scaleOrdinal<string, string>().domain(pieData.map((d) => d.label)).range([...schemeTableau10, ...schemeTableau10]);

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* Fundo suave com gradientes */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900/20 via-black to-blue-950/30"></div>
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-slate-600/10 rounded-full blur-3xl"></div>
      
      {/* Padrão sutil de pontos */}
      <div className="absolute inset-0 opacity-20" style={{
        backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.1) 1px, transparent 0)',
        backgroundSize: '20px 20px'
      }}></div>
      
      <div className="relative mx-auto w-full max-w-8xl px-4 sm:px-6 lg:px-8 py-8 pt-6">
        {/* Heading outside the white cards */}
        <h2 className="text-4xl font-didot text-blue-600 leading-tight mb-2">Métricas - Commits</h2>
        {selectedRepo && (
          <p className="text-white/70 text-sm mb-4">
            {selectedRepo.name === 'Todos os repositórios' 
              ? `Mostrando dados agregados de ${repositories.length} repositório(s) • ${selectedRepo.commits.length} commits total`
              : `Repositório: ${selectedRepo.name} • ${selectedRepo.commits.length} commits`
            }
          </p>
        )}

        {/* Repository selector */}
        <div className="flex justify-end -mt-3 mb-2">
          <div className="w-full sm:w-auto">
            <select
              value={selectedRepoId}
              onChange={(e) => setSelectedRepoId(e.target.value === 'all' ? 'all' : Number(e.target.value))}
              className="w-full sm:w-auto rounded-md shadow px-3 py-2 text-sm border-none outline-none cursor-pointer"
              style={{ background: '#4F4F4F', color: '#ffffff' }}
              disabled={loading}
            >
              <option value="all">
                Todos os repositórios ({repositories.flatMap(r => r.commits).length} commits)
              </option>
              {repositories.map((repo) => (
                <option key={repo.id} value={repo.id}>
                  {repo.name} ({repo.commits.length} commits)
                </option>
              ))}
            </select>
          </div>
        </div>

        <section className="flex flex-col lg:flex-row gap-6 -mt-2">
          {/* Sidebar for metric selector (visible on large screens) - made thinner */}
          <div className="hidden lg:flex lg:flex-col lg:w-20">
            <div className="rounded-lg overflow-hidden h-full" style={{ background: '#4F4F4F', color: '#ffffff' }}>
              {/* Five horizontal segments with dividers */}
              <div className="flex-1 flex items-center justify-center py-2 text-sm">Issues</div>
              <div className="h-px bg-slate-600" />
              <div className="flex-1 flex items-center justify-center py-2 text-sm">PRs</div>
              <div className="h-px bg-slate-600" />
              <div className="flex-1 flex items-center justify-center py-2 text-sm">Commits</div>
              <div className="h-px bg-slate-600" />
              <div className="flex-1 flex items-center justify-center py-2 text-sm">Colaboração</div>
              <div className="h-px bg-slate-600" />
              <div className="flex-1 flex items-center justify-center py-2 text-sm">Estruturas</div>
            </div>
          </div>

          {/* Left: larger white card for the time histogram (reduced width to free left space) */}
          <div className="flex-1 rounded-xl bg-white p-5 text-slate-900 shadow-sm min-h-[320px] flex flex-col min-w-0">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-md font-medium">Commits</h3>
              <div />
            </div>
            <div className="flex-1">
              {loading ? (
                <p className="py-8 text-center">Carregando...</p>
              ) : error ? (
                <p className="py-8 text-center text-rose-600">{error}</p>
              ) : (
                <Histogram data={histogramData} />
              )}
            </div>
          </div>

          {/* Right: smaller white card for pie chart and legend */}
          <div className="w-full lg:w-[480px] rounded-xl bg-white p-5 text-slate-900 shadow-sm min-h-[340px] flex flex-col">
            <h3 className="text-md font-medium">Por pessoa</h3>
            <div className="mt-4 flex gap-4 items-start flex-1">
              <div className="w-48 flex-shrink-0">{loading ? <p>...</p> : error ? <p className="text-rose-600">{error}</p> : <PieChart data={pieData} />}</div>
              <ul className="space-y-2 text-sm overflow-auto">
                {pieData.map((item) => (
                  <li key={item.label} className="flex items-center gap-3">
                    <span className="inline-block h-3 w-3" style={{ background: color(item.label) }} />
                    <span className="truncate">{item.label}</span>
                    <span className="ml-auto font-medium">{item.value}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
        {/* Button to trigger AI explanation */}
        <div className="mt-6 flex justify-center">
          <button className="bg-blue-600 text-white px-4 py-2 rounded-md">explicar com IA</button>
        </div>

        {/* Explanation box beneath the two white cards */}
        <div className="mt-4">
          <div className="rounded-md p-6" style={{ height: 'calc(320px / 5)', background: '#4F4F4F', color: '#ffffff' }}>
            <div className="h-full flex items-center justify-center text-lg font-semibold">EXPLICAÇÃO DA IA</div>
          </div>
        </div>
      </div>
    </div>
  );
}
