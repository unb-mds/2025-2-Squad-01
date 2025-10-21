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
import BaseFilters from '../components/BaseFilters';
import { Histogram } from '../components/Graphs';
import { BasicDatum, HistogramDatum, PieDatum } from '../types';
import { PieChart } from '../components/Graphs';


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
  const histogramData = useMemo<BasicDatum[]>(() => {
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
      .map(([date, value]) => ({ date, value }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [selectedRepoData, filteredActivities, cutoffDate]);

  // Processar dados para o gráfico de pizza
  const pieChartData = useMemo<PieDatum[]>(() => {
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
      .map(([label, value]) => ({ label, value }))
      .sort((a, b) => b.value - a.value);
    
    const top = sorted.slice(0, 8);
    const restTotal = sorted.slice(8).reduce((acc, item) => acc + item.value, 0);
    
    const colorScale = scaleOrdinal<string, string>()
      .domain([...top.map(item => item.label), 'Others'])
      .range([...schemeSpectral[3], ...schemeSpectral[11]]);
    
    const result = top.map(item => ({
      label: item.label,
      value: item.value,
      color: colorScale(item.label)
    }));
    if (restTotal > 0) result.push({
      label: 'Others',
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-90 mb-8">
                {/* Timeline */}
                <div className="border rounded-lg h-300 w-170" style={{ backgroundColor: '#222222', borderColor: '#333333' }}>
                  {/* Header da seção */}
                  <div className="px-6 py-4 border-b " style={{ borderBottomColor: '#333333' }}>
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
