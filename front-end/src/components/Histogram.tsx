import { useEffect, useRef } from 'react';
import {
  select,
  scaleBand,
  scaleLinear,
  axisBottom,
  axisLeft,
  max,
} from 'd3';
import type { HistogramDatum } from '../types';

interface HistogramProps {
  data: HistogramDatum[];
  color?: string;
  yAxisLabel?: string;
  emptyMessage?: string;
  tooltipLabel?: string;
}

export function Histogram({ 
  data, 
  color = '#3b82f6',
  yAxisLabel = 'Count',
  emptyMessage = 'No data available for this repository',
  tooltipLabel = 'item(s)'
}: HistogramProps) {
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
        .text(emptyMessage);
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
      .text(yAxisLabel);

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
      .attr('fill', color)
      .append('title')
      .text((d) => `${d.dateLabel}: ${d.count} ${tooltipLabel}`);
  }, [data, color, yAxisLabel, emptyMessage, tooltipLabel]);

  return <svg ref={svgRef} className="w-full h-[300px]" role="img" aria-label="Histograma" />;
}