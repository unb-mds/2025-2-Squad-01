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
  Simulation, SimulationNodeDatum, SimulationLinkDatum, D3DragEvent, 
  ScaleSequential, scaleSequential, interpolateReds, ScaleLinear, axisRight,
  range as d3Range
} from 'd3';
import { zoom } from 'd3-zoom';
import type { PieArcDatum } from 'd3';
import type { HistogramDatum, PieDatum, CollaborationEdge, HeatmapDataPoint} from '../types';

interface NodeData extends SimulationNodeDatum { id: string; }
interface LinkData extends SimulationLinkDatum<NodeData> { source: NodeData; target: NodeData; }

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
}: { data: CollaborationEdge[], width?: number, height?: number }) {
  const svgRef = useRef<SVGSVGElement | null>(null);

  const graphData = useMemo(() => {
    const validEdges = data.filter(d => d && d.user1 && d.user2);
    const userSet = new Set<string>();
    validEdges.forEach(edge => {
      userSet.add(edge.user1);
      userSet.add(edge.user2);
    });
    const nodes: NodeData[] = Array.from(userSet).map(id => ({ id })); 
    const links: { source: string | NodeData; target: string | NodeData }[] = validEdges.map(edge => ({
  source: edge.user1,
  target: edge.user2,
}));
    return { nodes, links };
  }, [data]);

  useEffect(() => {
    if (!svgRef.current || graphData.nodes.length === 0) return;

    const svg = select(svgRef.current);
    svg.selectAll('*').remove();

    const container = svg.append("g");

    const simulation = forceSimulation<NodeData, LinkData>(graphData.nodes)
      .force("link", forceLink<NodeData, LinkData>(graphData.links as any)
                       .id((d: NodeData) => d.id) // Tipo explícito aqui
                       .distance(50))
      .force("charge", forceManyBody().strength(-150))
      .force("center", forceCenter(width / 2, height / 2));

    const link = container.append("g")
        .attr("stroke", "#666")
        .attr("stroke-opacity", 0.5)
      .selectAll("line")
      .data(graphData.links)
      .join("line")
        .attr("stroke-width", 1);

    const node = container.append("g")
        .attr("stroke", "#ccc")
        .attr("stroke-width", 1)
      .selectAll<SVGCircleElement, NodeData>("circle") // Tipo explícito
      .data(graphData.nodes)
      .join("circle")
        .attr("r", 6)
        .attr("fill", "#e67e22")
        .call(drag(simulation)); // Passa simulação

    node.append("title").text(d => d.id);

    const labels = container.append("g")
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
      link
        .attr("x1", (d: any) => ((d.source as NodeData)?.x ?? 0))
        .attr("y1", (d: any) => ((d.source as NodeData)?.y ?? 0))
        .attr("x2", (d: any) => ((d.target as NodeData)?.x ?? 0))
        .attr("y2", (d: any) => ((d.target as NodeData)?.y ?? 0));

      node
        .attr("cx", (d: any) => (d.x ?? 0))
        .attr("cy", (d: any) => (d.y ?? 0));

      labels
        .attr("x", (d: any) => (d.x ?? 0))
        .attr("y", (d: any) => (d.y ?? 0));
    });

      function drag(simulation: Simulation<NodeData, LinkData>) {
    function dragstarted(event: D3DragEvent<SVGCircleElement, NodeData, NodeData>, d: NodeData) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x ?? null;
      d.fy = d.y ?? null;
    }
    function dragged(event: D3DragEvent<SVGCircleElement, NodeData, NodeData>, d: NodeData) {
      d.fx = event.x;
      d.fy = event.y;
    }
    function dragended(event: D3DragEvent<SVGCircleElement, NodeData, NodeData>, d: NodeData) {
      if (!event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }
    return d3Drag<SVGCircleElement, NodeData>()
      .on("start", dragstarted as any)
      .on("drag", dragged as any)
      .on("end", dragended as any);
  }

    const zoomBehavior = zoom<SVGSVGElement, unknown>() 
    .scaleExtent([0.1, 4]) 
    .on("zoom", (event) => { 
        container.attr("transform", event.transform); 
    });

    svg.call(zoomBehavior);

    return () => {
      simulation.stop();
    };

  }, [graphData, width, height]);

  return (
    <svg 
         ref={svgRef} 
         viewBox={`0 0 ${800} ${300}`} 
         preserveAspectRatio="xMidYMid meet" // Mantém a proporção e centraliza o conteúdo.
         style={{ width: '100%', height: '100%' }} 
      > 
      </svg>
  );
}
const dayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export function ActivityHeatmap({
  data,
  width = 700, // Largura total do SVG
  height = 250 // Altura total do SVG
}: { data: HeatmapDataPoint[], width?: number, height?: number }) {
  const svgRef = useRef<SVGSVGElement | null>(null);

  const processedData = useMemo(() => {
    return data.filter(d => d && typeof d.day_of_week === 'number' && typeof d.hour === 'number');
  }, [data]);

  useEffect(() => {
    if (!svgRef.current) {
        console.error("[Heatmap] Erro: Ref do SVG não encontrada!");
        return;
    }

    const svg = select(svgRef.current);
    svg.selectAll('*').remove(); 

    svg.attr('viewBox', `0 0 ${width} ${height}`); 

    if (processedData.length === 0) {
        svg.append('text')
            .attr('x', width / 2) // Usa width da prop (coordenada do viewBox)
            .attr('y', height / 2) // Usa height da prop (coordenada do viewBox)
            .attr('text-anchor', 'middle')
            .attr('fill', '#aaa')
            .text('Sem dados de atividade');
        return; 
    }

    const legendWidth = 60;
    const margin = { top: 30, right: legendWidth + 10, bottom: 30, left: 40 }; 
    const graphWidth = width - margin.left - margin.right; // Baseado na prop width
    const graphHeight = height - margin.top - margin.bottom; // Baseado na prop height

    if (graphWidth <= 0 || graphHeight <= 0) {
        console.warn("[Heatmap] Dimensões (baseadas nas props) inválidas para desenhar.");
        return; 
    }

    const hoursDomain = d3Range(24).map(String);
    const daysDomain = d3Range(7).map(String);
    
    const xScale = scaleBand()
      .domain(hoursDomain)
      .range([0, graphWidth])
      .padding(0.05);

    const yScale = scaleBand()
      .domain(daysDomain)
      .range([0, graphHeight]) // Usa graphHeight baseado na prop
      .padding(0.05);

    const maxCount = max(processedData, d => d.activity_count) || 1; 
    const minCount = 0; 

    const colorScale = scaleSequential(interpolateReds)
      .domain([minCount, maxCount]);

    const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const cells = g.selectAll("rect")
      .data(processedData)
      .join("rect")
        .attr("x", d => xScale(String(d.hour)) ?? 0) 
        .attr("y", d => yScale(String(d.day_of_week)) ?? 0) 
        .attr("width", xScale.bandwidth())
        .attr("height", yScale.bandwidth()) // Usa altura da banda baseada na prop
        .attr("fill", d => colorScale(d.activity_count))
        .attr("rx", 2)
        .attr("ry", 2);
        
    cells.append("title")
          .text(d => `Dia: ${dayLabels[d.day_of_week]}, Hora: ${d.hour}, Atividades: ${d.activity_count}`);
          
    // --- Eixos ---
    g.append("g")
      .attr("transform", `translate(0, ${graphHeight})`) // Usa graphHeight baseado na prop
      .call(axisBottom(xScale) /* ... ticks ... */)
      .call(g => g.select(".domain").remove()) 
      .call(g => g.selectAll(".tick line").remove()); 

    g.append("g")
      .call(axisLeft(yScale)
        .tickFormat(d => dayLabels[Number(d)]) 
        .tickSizeOuter(0))
      .call(g => g.select(".domain").remove()) 
      .call(g => g.selectAll(".tick line").remove()); 

    svg.selectAll(".tick text")
        .attr("fill", "#aaa")
        .style("font-size", "10px");
        
    const legendGroup = svg.append("g")
        .attr("transform", `translate(${margin.left + graphWidth + 10}, ${margin.top})`); 

    const legendScale = scaleLinear<number>() 
        .domain([minCount, maxCount]) 
        .range([graphHeight, 0]); // Usa graphHeight baseado na prop

    const legendAxis = axisRight(legendScale) /* ... ticks ... */;
    const gradientId = "heatmap-gradient";
    const defs = svg.append("defs");
    const linearGradient = defs.append("linearGradient") /* ... gradiente ... */;
    linearGradient.selectAll("stop") /* ... stops ... */;

    legendGroup.append("rect")
            .attr("width", 20)
            .attr("height", graphHeight) // Usa graphHeight baseado na prop
            .style("fill", `url(#${gradientId})`);
    legendGroup.append("g") /* ... (eixo da legenda) ... */;
         

  }, [processedData, width, height]); 

  return (
      <div style={{width: '100%', overflowX: 'auto', paddingBottom: '10px'}}>
      
      <svg 
         ref={svgRef}
         width={width}
         height={height} 
         viewBox={`0 0 ${width} ${height}`} 
         style={{ display: 'block'}} // Continua preenchendo o pai
      > 
      </svg>
      </div>
  );
}
