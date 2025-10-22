import { useEffect, useRef, useMemo } from 'react';
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
  forceSimulation,
  forceLink,
  forceManyBody,
  forceCenter,
  drag as d3Drag,
} from 'd3';
import type { PieArcDatum } from 'd3';
import type { HistogramDatum, PieDatum } from '../types';
type CollaborationEdge = {
  user1: string;
  user2: string;
  repo: string;
  collaboration_type: string;
  _metadata?: any; // Para ignorar a entrada de metadados
};
// Tipo para os nós (círculos) no D3
type NodeData = { id: string }; 
// Tipo para os links (linhas) no D3
type LinkData = { source: string; target: string };

/**
 * Histogram Component
 *
 * D3-based bar chart for visualizing commit activity over time.
 * Displays commit counts per day with responsive scaling and tooltips.
 *
 * @param data - Array of histogram data points with date labels and counts
 */
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
        .text('No commits available! Please change your filters or select another repository.');

      return;
    }

    const width = 700;
    const height = 400;
    const margin = { top: 20, right: 20, bottom: 40, left: 58 };

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

type CollaborationNetworkGraphProps = {
  data: CollaborationEdge[]; 
  width?: number; 
  height?: number; 
};

export function CollaborationNetworkGraph({
  data,
  width = 600, 
  height = 500, 
}: CollaborationNetworkGraphProps) {
  const svgRef = useRef<SVGSVGElement | null>(null);

  // Process Data into Nodes and Links
  const graphData = useMemo(() => {
    // Filtra metadados e garante que user1/user2 existam
    const validEdges = data.filter(d => d && d.user1 && d.user2); 
    const userSet = new Set<string>();
    validEdges.forEach(edge => {
      userSet.add(edge.user1);
      userSet.add(edge.user2);
    });
    const nodes: NodeData[] = Array.from(userSet).map(id => ({ id }));
    const links: LinkData[] = validEdges.map(edge => ({
      source: edge.user1,
      target: edge.user2,
    }));
    return { nodes, links };
  }, [data]); 

  // D3 Simulation and Drawing
  useEffect(() => {
    if (!svgRef.current || graphData.nodes.length === 0) return;

    const svg = select(svgRef.current);
    svg.selectAll('*').remove(); 

    const simulation = forceSimulation<NodeData>(graphData.nodes)
      .force("link", forceLink<NodeData, LinkData>(graphData.links)
                       .id(d => d.id) 
                       .distance(50)) 
      .force("charge", forceManyBody().strength(-150)) // Ajuste a força se necessário
      .force("center", forceCenter(width / 2, height / 2)); 

    const link = svg.append("g")
        .attr("stroke", "#666") 
        .attr("stroke-opacity", 0.5)
      .selectAll("line")
      .data(graphData.links)
      .join("line")
        .attr("stroke-width", 1); 

    const node = svg.append("g")
        .attr("stroke", "#ccc") 
        .attr("stroke-width", 1)
      .selectAll<SVGCircleElement, NodeData>("circle") 
      .data(graphData.nodes)
      .join("circle")
        .attr("r", 6) 
        .attr("fill", "#e67e22") 
        .call(drag(simulation)); 

    node.append("title").text(d => d.id);

    const labels = svg.append("g")
        .attr("class", "labels")
      .selectAll("text")
      .data(graphData.nodes)
      .join("text")
        .attr("dx", 14) 
        .attr("dy", ".35em") 
        .attr("fill", "#aaa") 
        .style("font-size", "9px") 
        .style("pointer-events", "none") 
        .text(d => d.id);

    simulation.on("tick", () => {
      // Atualiza posições
      link
          .attr("x1", d => (d.source as any).x)
          .attr("y1", d => (d.source as any).y)
          .attr("x2", d => (d.target as any).x)
          .attr("y2", d => (d.target as any).y);
      node
          .attr("cx", d => (d as any).x)
          .attr("cy", d => (d as any).y);
      labels
          .attr("x", d => (d as any).x)
          .attr("y", d => (d as any).y);
    });

    // Função interna para arrastar (usa o import d3Drag)
    function drag(simulation: d3.Simulation<NodeData, undefined>) {
        function dragstarted(event: any, d: any) { 
            if (!event.active) simulation.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
        }        
        function dragged(event: any, d: any) {
            d.fx = event.x;
            d.fy = event.y;
        }        
        function dragended(event: any, d: any) {
            if (!event.active) simulation.alphaTarget(0);
            d.fx = null;
            d.fy = null;
        }        
        // Usa d3Drag aqui
        return d3Drag<SVGCircleElement, NodeData>() 
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended);
    }

    // Limpa a simulação quando o componente desmontar
    return () => {
      simulation.stop();
    };

  }, [graphData, width, height]); 

  // Retorna o elemento SVG que o D3 vai manipular
  return (
    <svg ref={svgRef} viewBox={`0 0 ${width} ${height}`} width={width} height={height} style={{ maxWidth: '100%', height: 'auto' }}>
    </svg>
  );
}
