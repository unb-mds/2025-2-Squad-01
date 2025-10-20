import { useEffect, useRef } from 'react';
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
  schemeSpectral,
} from 'd3';
import type { PieArcDatum } from 'd3';
import type { PieDatum, BasicDatum} from '../types';
import * as d3 from 'd3';
import { Filter } from './Filter';

/**
 * Histogram Component
 *
 * D3-based bar chart for visualizing commit activity over time.
 * Displays commit counts per day with responsive scaling and tooltips.
 *
 * @param data - Array of histogram data points with date labels and counts
 */
export function Histogram({ data, timeRange }: { data: BasicDatum[]; timeRange?: string }) {
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
        .text('No commits available! Please change your filters or select another repository.');

      return;
    }

    const width = 700;
    const height = 400;
    const margin = { top: 20, right: 20, bottom: 40, left: 58 };

    const x = scaleBand<string>()
      .domain(data.map((d) => d.date))
      .range([margin.left, width - margin.right])
      .padding(0.12);

    const y = scaleLinear()
      .domain([0, max(data, (d: BasicDatum) => d.value) ?? 0])
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
      .call(
        axisBottom(x)
          .tickValues(tickValues)
          .tickFormat((v) => String(v))
      );
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
      .data<BasicDatum>(data)
      .join('rect')
      .attr('x', (d) => x(d.date) ?? margin.left)
      .attr('y', (d) => y(d.value))
      .attr('width', x.bandwidth())
      .attr('height', (d) => y(0) - y(d.value))
      .attr('rx', 4)
      .attr('fill', '#3b82f6')
      .append('title')
      .text((d) => `${d.date}: ${d.value} commit(s)`);
  }, [data]);

  return <svg ref={svgRef} className="w-full h-[520px]" role="img" aria-label="Histogram" />;
}

/**
 * PieChart Component
 *
 * D3-based pie chart for visualizing contributor distribution.
 * Shows commit counts per contributor with color-coded segments.
 *
 * @param data - Array of pie data with labels, values, and colors
 */
export function PieChart({ data }: { data: PieDatum[] }) {
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
    const pieGen = d3Pie<PieDatum>()
      .sort(null)
      .value((d) => d.value);
    const arcGen = d3Arc<PieArcDatum<PieDatum>>().innerRadius(0).outerRadius(radius);
    const arcs = pieGen(data);

    g.selectAll('path')
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

export function LineGraph({ data, timeRange }: { data: BasicDatum[]; timeRange?: string })
{
  const svgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    if (!svgRef.current) return;
    const svg = select(svgRef.current);
    svg.selectAll('*').remove();



    const margin = { top: 40, right: 20, bottom: 36, left: 58 };
    const innerWidth = 920 - margin.left - margin.right;
    const innerHeight = 500 - margin.top - margin.bottom;
    const outerWidth = innerWidth + margin.left + margin.right;
    const outerHeight = innerHeight + margin.top + margin.bottom;

    svg.attr('viewBox', `0 0 ${outerWidth} ${outerHeight}`);

    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

    const x = d3.scaleTime().range([0, innerWidth]);
    const y = d3.scaleLinear().range([innerHeight, 0]);

    // Domains with guards for degenerate cases
    const xExtent = d3.extent(data, (d) => new Date(d.date)) as [Date, Date];
    let xMin = xExtent[0];
    let xMax = xExtent[1];
    if (xMin && xMax && +xMin === +xMax) {
      // Expand minimally based on selected time range to avoid zero-length scale
      if (timeRange === 'Last 24 hours') {
        xMax = new Date(xMax.getTime() + 60 * 60 * 1000); // +1 hour
      } else if (timeRange === 'Last 7 days' || timeRange === 'Last 30 days') {
        xMax = new Date(xMax.getTime() + 24 * 60 * 60 * 1000); // +1 day
      } else {
        const tmp = new Date(xMax);
        tmp.setMonth(tmp.getMonth() + 1); // +1 month
        xMax = tmp;
      }
    }
    if (xMin && xMax) x.domain([xMin, xMax]);

    const yMax = d3.max(data, (d) => d.value) ?? 0;
    y.domain([0, yMax <= 0 ? 1 : yMax]).nice();

    // Simplified tick sampling like the bar chart: pick ~12 ticks from data points
    const tickInterval = Math.max(1, Math.floor(data.length / 12));
    const tickValues: Date[] = data
      .map((d, i) => ({ v: new Date(d.date), i }))
      .filter((x) => x.i % tickInterval === 0)
      .map((x) => x.v);
    const tickFormatter =
      timeRange === 'Last 24 hours'
        ? (d3.timeFormat('%H:%M') as unknown as (n: number | { valueOf(): number }) => string)
        : timeRange === 'Last 30 days'
        ? (d3.timeFormat('%m-%d') as unknown as (n: number | { valueOf(): number }) => string)
        : timeRange === 'Last 6 months'
        ? (d3.timeFormat('%Y-%m') as unknown as (n: number | { valueOf(): number }) => string)
        : timeRange === 'Last Year'
        ? (d3.timeFormat('%Y-%m') as unknown as (n: number | { valueOf(): number }) => string)
        : (d3.timeFormat('%Y') as unknown as (n: number | { valueOf(): number }) => string);

    //const maxTicks = 12;
    //const step = Math.max(1, Math.ceil(allDates.length / maxTicks));
    // const tickValues = allDates.filter((_, i) => i % step === 0);

    // Grid lines (Y): horizontal lines across the chart area
    const yGrid = g
      .append('g')
      .attr('class', 'grid-y')
      .call(
        d3
          .axisLeft(y)
          .ticks(6)
          .tickSize(-innerWidth)
          .tickFormat(() => '')
      );
    yGrid.select('.domain').remove();
    yGrid.selectAll('line').style('stroke', '#2f3640').style('stroke-opacity', 0.7);

    // Grid lines (X): vertical lines aligned with tickValues (data points)
    const xGrid = g
      .append('g')
      .attr('class', 'grid-x')
      .attr('transform', `translate(0, ${innerHeight})`)
      .call(
        d3
          .axisBottom(x)
          .tickValues(tickValues)
          .tickSize(-innerHeight)
          .tickFormat(() => '')
      );
    xGrid.select('.domain').remove();
    xGrid.selectAll('line').style('stroke', '#2f3640').style('stroke-opacity', 0.7);

    // X Axis appended within chart group (aligned with plot area), centered text
    const xAxis = g
      .append('g')
      .attr('transform', `translate(0, ${innerHeight})`)
      .style('color', '#e2e8f0')
      .style('font-size', '12px')
      .call(
        d3
          .axisBottom(x)
          .tickValues(tickValues)
          .tickFormat(tickFormatter)
      );
    // Keep X domain line visible and style it
    xAxis.select('.domain').remove();
    xAxis.selectAll('.tick line').style('stroke-opacity', 0); // hidden; xGrid handles vertical lines
    xAxis.selectAll('.tick text').attr('fill', '#777').style('text-anchor', 'middle');
      

    // Y Axis appended within chart group; remove domain line
    const yAxis = g
      .append('g')
      .style('font-size', '12px')
      .call(
        d3
          .axisLeft(y)
          .ticks(6)
          .tickSize(0)
          .tickPadding(10)
          
      );
    yAxis.select('.domain').remove();
    yAxis.selectAll('.tick text').style('fill', '#777');

    // Line generator and path
    const line = d3
      .line<BasicDatum>()
      .x((d) => x(new Date(d.date)))
      .y((d) => y(d.value));

    g.append('path')
      .datum(data)
      .attr('fill', 'none')
      .attr('stroke', '#3b82f6')
      .attr('stroke-width', 2)
      // pass the generator function so d3 invokes it with bound data
      .attr('d', line as unknown as any);
    let opacity = 1;
    if (timeRange !== 'Last 24 hours' && timeRange !== 'Last 7 days' && timeRange !== 'Last 30 days') {
      opacity = 0;
    }
    else{
      opacity = 1;
    }
    g.append('g')
      .selectAll('circle')
      .data(data)
      .join('circle')
      .attr('cx', (d) => x(new Date(d.date)))
      .attr('cy', (d) => y(d.value))
      .attr('r', 3)
      .attr('fill', '#60a5fa')
      .attr('stroke', '#1d4ed8')
      .attr('stroke-width', 1)
      .style('opacity', opacity);
  }, [data, timeRange]);
  return (<>{<svg ref={svgRef} className="w-full" role="img" aria-label="Line graph" />} <Filter title={"Select Graph"} content={["Line Graph","Bar Graph"]}  /> </>);
}