import { useEffect, useRef } from 'react';
import {
  select,
  pie as d3Pie,
  arc as d3Arc,
  scaleOrdinal,
  schemeSpectral
} from 'd3';
import type { PieArcDatum } from 'd3';
import type { PieDatum } from '../types';

interface PieChartProps {
  data: PieDatum[];
  emptyMessage?: string;
  tooltipLabel?: string;
}

export function PieChart({ 
  data, 
  emptyMessage = 'No data available for this repository',
  tooltipLabel = 'item(s)'
}: PieChartProps) {
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
        .text(emptyMessage);
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
      .text((d) => `${d.data.label}: ${d.data.value} ${tooltipLabel}`);
  }, [data, emptyMessage, tooltipLabel]);

  return <svg ref={svgRef} className="w-full h-[240px]" role="img" aria-label="Gráfico de pizza" />;
}