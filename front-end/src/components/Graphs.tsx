import { useEffect, useRef, useMemo, useState } from 'react';
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
  range as d3Range,
  area,
  line,
  curveMonotoneX
} from 'd3';
import * as d3 from 'd3';
import { zoom } from 'd3-zoom';
import type { PieArcDatum } from 'd3';
import type { PieDatum, BasicDatum, CollaborationEdge, HeatmapDataPoint, CommitMetricsDatum } from '../types';
import { Filter } from './Filter';

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
export function Histogram({ data }: { data: BasicDatum[]; }) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [showLineGraph, setShowLineGraph] = useState(false);


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
      .style('opacity', '0.6')
      .style('text-anchor', 'end')
      .style('fill', '#e2e8f0')
      .attr('dx', '-0.6em')
      .attr('dy', '0.15em')
      .attr('transform', 'rotate(-35)');
    xAxis.selectAll('line').style('stroke', '#475569');
    xAxis.select('.domain').remove();

    const yAxis = svg
      .append('g')
      .attr('transform', `translate(${margin.left},0)`)
      .call(axisLeft(y).ticks(6));
        yAxis.selectAll('text')
      .selectAll('text')
      .style('fill', '#e2e8f0')
      .style('opacity', '0.6');
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

    const lineOpacity = showLineGraph ? 1 : 0;
    const rectOpacity = showLineGraph ? 0 : 1;


    // Grid lines (Y): horizontal lines across the chart area
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const yGrid = svg
      .append('g')
      .attr('class', 'grid-y')
      .attr('transform', `translate(${margin.left},0)`)
      .call(
        d3
          .axisLeft(y)
          .ticks(6)
          .tickSize(-innerWidth)
          .tickFormat(() => '')
      );
    yGrid.select('.domain').remove();
    yGrid.selectAll('line').style('stroke', '#2f3640').style('stroke-opacity', lineOpacity - 0.3);

    // Grid lines (X): vertical lines aligned with tickValues (data points)
    const xGrid = svg
      .append('g')
      .attr('class', 'grid-x')
      .attr('transform', `translate(0, ${height - margin.bottom})`)
      .call(
        d3
          .axisBottom(x)
          .tickValues(tickValues)
          .tickSize(-innerHeight)
          .tickFormat(() => '')
      );
    xGrid.select('.domain').remove();
    xGrid.selectAll('line').style('stroke', '#2f3640').style('stroke-opacity', lineOpacity - 0.3);
    
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
      .style('opacity', rectOpacity)
      .append('title')
      .text((d) => `${d.date}: ${d.value} commit(s)`);


    // Line chart overlay
    const line = d3.line<BasicDatum>()
      .x((d) => (x(d.date) ?? margin.left) + x.bandwidth() / 2)
      .y((d) => y(d.value));

    svg
      .append('path')
      .datum(data)
      .attr('fill', 'none')
      .attr('stroke', '#3b82f6')
      .attr('stroke-width', 2)
      .style('opacity', lineOpacity)
      .attr('d', line as any);

    // Add points on the line
    svg
      .append('g')
      .selectAll('circle')
      .data(data)
      .join('circle')
      .attr('cx', (d) => (x(d.date) ?? margin.left) + x.bandwidth() / 2)
      .attr('cy', (d) => y(d.value))
      .attr('r', 3)
      .attr('fill', '#3b82f6')
      .attr('stroke', '#3b82f6')
      .attr('stroke-width', 1.5)
      .style('opacity', 0)
      .append('title')
      .text((d) => `${d.date}: ${d.value} commit(s)`);


      
  }, [data, showLineGraph]);

  return (
    <>
      <svg ref={svgRef} className="w-full h-[520px]" role="img" aria-label="Histogram" />
      <button 
        onClick={() => setShowLineGraph((prev) => !prev)}
        className=" px-4 py-2 ml-8 mt-5 border-1 border-gray-500 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors duration-200 flex items-center gap-2"
      >
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          className="h-5 w-5" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" 
          />
        </svg>
        {showLineGraph ? 'Bar Graph' : 'Line Graph'}
      </button>
    </>
  );
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
}: { data: CollaborationEdge[]; width?: number; height?: number }) {
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
}: { data: HeatmapDataPoint[]; width?: number; height?: number }) {
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
    if (timeRange !== 'Last 24 horas' && timeRange !== 'Últimos 7 dias' && timeRange !== 'Últimos 30 dias') {
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

/**
 * CommitMetricsChart Component
 *
 * Advanced D3-based chart combining area, stacked bars, and lines to visualize:
 * - Total lines (area chart - background)
 * - Additions and Deletions (stacked bar chart)
 * - Number of commits (line chart)
 * - Changes per commit (line chart)
 *
 * @param data - Array of commit metrics data by date
 */
export function CommitMetricsChart({ data }: { data: CommitMetricsDatum[] }) {
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
        .text('No commit metrics available');
      return;
    }

    const width = 1000;
    const height = 500;
    const margin = { top: 60, right: 80, bottom: 60, left: 70 };

    svg.attr('viewBox', `0 0 ${width} ${height}`);

    // Scales
    const xScale = scaleBand<string>()
      .domain(data.map((d) => d.date))
      .range([margin.left, width - margin.right])
      .padding(0.2);

    const yScaleLines = scaleLinear()
      .domain([0, max(data, (d) => d.totalLines) ?? 0])
      .nice()
      .range([height - margin.bottom, margin.top]);

    const yScaleCommits = scaleLinear()
      .domain([0, max(data, (d) => Math.max(d.commits, d.changesPerCommit)) ?? 0])
      .nice()
      .range([height - margin.bottom, margin.top]);

    const yScaleChanges = scaleLinear()
      .domain([0, max(data, (d) => d.additions + d.deletions) ?? 0])
      .nice()
      .range([height - margin.bottom, margin.top]);

    // Grid lines (horizontal)
    const gridLines = svg
      .append('g')
      .attr('class', 'grid');

    const yTicks = yScaleLines.ticks(8);
    yTicks.forEach((tick) => {
      gridLines
        .append('line')
        .attr('x1', margin.left)
        .attr('x2', width - margin.right)
        .attr('y1', yScaleLines(tick))
        .attr('y2', yScaleLines(tick))
        .attr('stroke', '#334155')
        .attr('stroke-width', 1)
        .attr('stroke-opacity', 0.3);
    });

    // X Axis
    const tickInterval = Math.max(1, Math.floor(data.length / 15));
    const tickValues = data
      .map((d, i) => ({ v: d.date, i }))
      .filter((x) => x.i % tickInterval === 0)
      .map((x) => x.v);

    const xAxis = svg
      .append('g')
      .attr('transform', `translate(0, ${height - margin.bottom})`)
      .call(
        axisBottom(xScale)
          .tickValues(tickValues)
          .tickFormat((v) => String(v))
      );
    
    xAxis
      .selectAll('text')
      .style('text-anchor', 'end')
      .style('fill', '#94a3b8')
      .attr('dx', '-0.8em')
      .attr('dy', '0.15em')
      .attr('transform', 'rotate(-45)')
      .style('font-size', '11px');
    
    xAxis.selectAll('line').style('stroke', '#334155');
    xAxis.select('.domain').style('stroke', '#334155');

    // Left Y Axis (Total Lines)
    const yAxisLeft = svg
      .append('g')
      .attr('transform', `translate(${margin.left}, 0)`)
      .call(axisLeft(yScaleLines).ticks(8));
    
    yAxisLeft.selectAll('text').style('fill', '#94a3b8').style('font-size', '11px');
    yAxisLeft.selectAll('line').style('stroke', '#334155');
    yAxisLeft.select('.domain').style('stroke', '#334155');

    // Right Y Axis (Commits / Changes per Commit)
    const yAxisRight = svg
      .append('g')
      .attr('transform', `translate(${width - margin.right}, 0)`)
      .call(axisRight(yScaleCommits).ticks(8));
    
    yAxisRight.selectAll('text').style('fill', '#94a3b8').style('font-size', '11px');
    yAxisRight.selectAll('line').style('stroke', '#334155');
    yAxisRight.select('.domain').style('stroke', '#334155');

    // Area chart (Total Lines) - Background
    const areaGenerator = area<CommitMetricsDatum>()
      .x((d) => (xScale(d.date) ?? 0) + xScale.bandwidth() / 2)
      .y0(height - margin.bottom)
      .y1((d) => yScaleLines(d.totalLines))
      .curve(curveMonotoneX);

    svg
      .append('path')
      .datum(data)
      .attr('fill', '#475569')
      .attr('fill-opacity', 0.3)
      .attr('d', areaGenerator);

    // Stacked Bar Chart (Additions and Deletions)
    const barWidth = xScale.bandwidth();

    // Additions (green bars)
    svg
      .append('g')
      .selectAll('rect')
      .data(data)
      .join('rect')
      .attr('x', (d) => xScale(d.date) ?? 0)
      .attr('y', (d) => yScaleChanges(d.additions))
      .attr('width', barWidth)
      .attr('height', (d) => Math.max(0, height - margin.bottom - yScaleChanges(d.additions)))
      .attr('fill', '#84cc16')
      .attr('opacity', 0.8)
      .append('title')
      .text((d) => `${d.date}\nAdditions: +${d.additions}`);

    // Deletions (red bars, stacked on top)
    svg
      .append('g')
      .selectAll('rect')
      .data(data)
      .join('rect')
      .attr('x', (d) => xScale(d.date) ?? 0)
      .attr('y', (d) => yScaleChanges(d.additions + d.deletions))
      .attr('width', barWidth)
      .attr('height', (d) => Math.max(0, yScaleChanges(d.additions) - yScaleChanges(d.additions + d.deletions)))
      .attr('fill', '#ef4444')
      .attr('opacity', 0.8)
      .append('title')
      .text((d) => `${d.date}\nDeletions: -${d.deletions}`);

    // Line Chart - Commits (orange)
    const commitsLine = line<CommitMetricsDatum>()
      .x((d) => (xScale(d.date) ?? 0) + xScale.bandwidth() / 2)
      .y((d) => yScaleCommits(d.commits))
      .curve(curveMonotoneX);

    svg
      .append('path')
      .datum(data)
      .attr('fill', 'none')
      .attr('stroke', '#f97316')
      .attr('stroke-width', 2.5)
      .attr('d', commitsLine);

    // Commits line points
    svg
      .append('g')
      .selectAll('circle')
      .data(data)
      .join('circle')
      .attr('cx', (d) => (xScale(d.date) ?? 0) + xScale.bandwidth() / 2)
      .attr('cy', (d) => yScaleCommits(d.commits))
      .attr('r', 3.5)
      .attr('fill', '#f97316')
      .attr('stroke', '#1e293b')
      .attr('stroke-width', 1.5)
      .append('title')
      .text((d) => `${d.date}\nCommits: ${d.commits}`);

    // Line Chart - Changes per Commit (blue)
    const changesLine = line<CommitMetricsDatum>()
      .x((d) => (xScale(d.date) ?? 0) + xScale.bandwidth() / 2)
      .y((d) => yScaleCommits(d.changesPerCommit))
      .curve(curveMonotoneX);

    svg
      .append('path')
      .datum(data)
      .attr('fill', 'none')
      .attr('stroke', '#3b82f6')
      .attr('stroke-width', 2.5)
      .attr('d', changesLine);

    // Changes per commit line points
    svg
      .append('g')
      .selectAll('circle')
      .data(data)
      .join('circle')
      .attr('cx', (d) => (xScale(d.date) ?? 0) + xScale.bandwidth() / 2)
      .attr('cy', (d) => yScaleCommits(d.changesPerCommit))
      .attr('r', 3.5)
      .attr('fill', '#3b82f6')
      .attr('stroke', '#1e293b')
      .attr('stroke-width', 1.5)
      .append('title')
      .text((d) => `${d.date}\nChanges/Commit: ${d.changesPerCommit.toFixed(1)}`);

    // Legend
    const legend = svg
      .append('g')
      .attr('transform', `translate(${margin.left}, ${margin.top - 25})`);

    const legendItems = [
      { label: 'Total lines', color: '#475569', type: 'area' },
      { label: 'Commits', color: '#f97316', type: 'line' },
      { label: 'Changes per commit', color: '#3b82f6', type: 'line' },
      { label: 'Additions', color: '#84cc16', type: 'rect' },
      { label: 'Deletions', color: '#ef4444', type: 'rect' },
    ];

    legendItems.forEach((item, i) => {
      const legendItem = legend
        .append('g')
        .attr('transform', `translate(${i * 155}, 0)`);

      if (item.type === 'line') {
        legendItem
          .append('line')
          .attr('x1', 0)
          .attr('x2', 20)
          .attr('y1', 6)
          .attr('y2', 6)
          .attr('stroke', item.color)
          .attr('stroke-width', 2.5);
        
        legendItem
          .append('circle')
          .attr('cx', 10)
          .attr('cy', 6)
          .attr('r', 3.5)
          .attr('fill', item.color)
          .attr('stroke', '#1e293b')
          .attr('stroke-width', 1.5);
      } else if (item.type === 'rect') {
        legendItem
          .append('rect')
          .attr('width', 20)
          .attr('height', 12)
          .attr('fill', item.color)
          .attr('opacity', 0.8);
      } else {
        legendItem
          .append('rect')
          .attr('width', 20)
          .attr('height', 12)
          .attr('fill', item.color)
          .attr('opacity', 0.3);
      }

      legendItem
        .append('text')
        .attr('x', 25)
        .attr('y', 10)
        .attr('fill', '#e2e8f0')
        .style('font-size', '12px')
        .text(item.label);
    });

  }, [data]);

  return <svg ref={svgRef} className="w-full h-[600px]" role="img" aria-label="Commit Metrics Chart" />;
}
