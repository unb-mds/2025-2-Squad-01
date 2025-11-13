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
  forceCollide,
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
import type { PieDatum, BasicDatum, CollaborationEdge, HeatmapDataPoint} from '../types';
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
export function Histogram({ data, type }: { data: BasicDatum[], type: string }) {
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
        .text(`No ${type} available! Please change your filters or select another repository.`);

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
      .text(`${type}s Count`);

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
      .text((d) => `${d.date}: ${d.value} ${type}(s)`);


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
      .text((d) => `${d.date}: ${d.value} ${type}(s)`);


      
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

export function PieChart({ data, type }: { data: PieDatum[]; type: string }) {
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
        .text('No data available for this repository');
      
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
      .text((d) => `${d.data.label}: ${d.data.value} ${type}(s)`);
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
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [filterThreshold, setFilterThreshold] = useState<number>(2);
  const [hideBots, setHideBots] = useState<boolean>(true);
  const [resetKey, setResetKey] = useState<number>(0);

  const graphData = useMemo(() => {
    let validEdges = data.filter(d => d && d.user1 && d.user2);
    
    // Filtrar bots se necessário
    if (hideBots) {
      validEdges = validEdges.filter(edge =>
        !edge.user1.includes('[bot]') && !edge.user2.includes('[bot]')
      );
    }
    
    // Calcular grau de cada nó e repositórios
    const nodeDegree = new Map<string, number>();
    const nodeRepos = new Map<string, Set<string>>();
    
    validEdges.forEach(edge => {
      nodeDegree.set(edge.user1, (nodeDegree.get(edge.user1) || 0) + 1);
      nodeDegree.set(edge.user2, (nodeDegree.get(edge.user2) || 0) + 1);
      
      if (!nodeRepos.has(edge.user1)) nodeRepos.set(edge.user1, new Set());
      if (!nodeRepos.has(edge.user2)) nodeRepos.set(edge.user2, new Set());
      
      if (edge.repo) {
        nodeRepos.get(edge.user1)!.add(edge.repo);
        nodeRepos.get(edge.user2)!.add(edge.repo);
      }
    });
    
    // Filtrar nós por threshold de conexões
    const filteredNodes = Array.from(nodeDegree.entries())
      .filter(([_, degree]) => degree >= filterThreshold)
      .map(([id]) => id);
    
    const filteredNodeSet = new Set(filteredNodes);
    
    // Filtrar edges para incluir apenas nós selecionados
    const filteredEdges = validEdges.filter(edge =>
      filteredNodeSet.has(edge.user1) && filteredNodeSet.has(edge.user2)
    );
    
    const nodes: NodeData[] = filteredNodes.map(id => ({ 
      id, 
      degree: nodeDegree.get(id) || 0,
      repos: nodeRepos.get(id)?.size || 0
    } as any));
    
    const links = filteredEdges.map(edge => ({
      source: edge.user1,
      target: edge.user2,
    }));
    
    return { nodes, links, nodeDegree };
  }, [data, filterThreshold, hideBots]);

  useEffect(() => {
    if (!svgRef.current || graphData.nodes.length === 0) return;

  const svg = select(svgRef.current);
    svg.selectAll('*').remove();

    const container = svg.append("g");

    const centerX = width / 2;
    const centerY = height / 2;
    
    // Posicionamento inicial compacto no centro
    graphData.nodes.forEach((node: any, index: number) => {
      const angle = (index / graphData.nodes.length) * Math.PI * 2;
      const radius = 100; // Raio menor - todos começam próximos
      node.x = centerX + Math.cos(angle) * radius/2;
      node.y = centerY + Math.sin(angle) * radius/2;
    });

    const simulation = forceSimulation<NodeData, LinkData>(graphData.nodes)
      .force("link", forceLink<NodeData, LinkData>(graphData.links as any)
                       .id((d: NodeData) => d.id)
                       .distance(200)) // Links mais curtos
      .force("charge", forceManyBody().strength(-60)) // Menos repulsão
      .force("center", forceCenter(centerX, centerY).strength(0.1)) // Força de centro moderada
      .force("collide", forceCollide<NodeData>().radius((d: any) => {
        const degree = d.degree || 1;
        const logScale = Math.log(degree + 3);
        return Math.min(logScale * 3 + 2, 9) + 3;
      }).strength(0.7)); // Colisão mais forte

    const link = container.append("g")
        .attr("stroke", "#444")
        .attr("stroke-opacity", 0.3)
      .selectAll("line")
      .data(graphData.links)
      .join("line")
        .attr("stroke-width", 1)
        .attr("class", (d: any) => `link-${d.source.id}-${d.target.id}`);

    const node = container.append("g")
        .attr("stroke", "#fff")
        .attr("stroke-width", 2)
      .selectAll<SVGCircleElement, any>("circle")
      .data(graphData.nodes)
      .join("circle")
        .attr("r", (d: any) => {
          // Usar escala logarítmica para evitar nós muito grandes
          const degree = d.degree || 1;
          const logScale = Math.log(degree + 3);
          return Math.min(logScale * 3 + 3, 9); // Min 2, Max 10
        })
        .attr("fill", (d: any) => {
          // Cor baseada no grau (número de conexões)
          const degree = d.degree || 0;
          if (degree < 3) return "#3498db"; // Azul para poucos
          if (degree < 10) return "#e67e22"; // Laranja para médios
          if (degree < 20) return "#e74c3c"; // Vermelho para muitos
          return "#c0392b"; // Vermelho escuro para muitos mesmo
        })
        .attr("class", d => `node-${d.id}`)
        .on("mouseenter", (event: any, d: any) => {
          setHoveredNode(d.id);
          
          // Destacar nó
          select(event.currentTarget as SVGCircleElement)
            .transition()
            .duration(200)
            .attr("r", (n: any) => {
              const degree = n.degree || 1;
              const logScale = Math.log(degree + 3);
              return Math.min(logScale * 3 + 3, 8) + 3; // +2 ao hover
            })
            .attr("stroke-width", 3);
          
          // Destacar conexões
          link.style("stroke-opacity", (l: any) => 
            (l.source as any).id === d.id || (l.target as any).id === d.id ? 0.8 : 0.1
          )
          .style("stroke-width", (l: any) =>
            (l.source as any).id === d.id || (l.target as any).id === d.id ? 2 : 1
          );

          // Criar tooltip com informações do usuário
          const tooltip = container.append("g")
            .attr("class", "node-tooltip")
            .attr("transform", `translate(${d.x + 15}, ${d.y - 30})`);

          // Fundo do tooltip
          const padding = 8;
          const lineHeight = 14;
          const lines = [
            `Usuário: ${d.id}`,
            `Conexões: ${d.degree || 0}`,
            `Repositórios: ${d.repos || 0}`
          ];
          const maxWidth = Math.max(...lines.map(l => l.length * 6));
          
          tooltip.append("rect")
            .attr("x", 0)
            .attr("y", 0)
            .attr("width", maxWidth + padding * 2)
            .attr("height", lines.length * lineHeight + padding * 2)
            .attr("fill", "#2c3e50")
            .attr("stroke", "#ecf0f1")
            .attr("stroke-width", 1)
            .attr("rx", 4);

          // Texto do tooltip
          lines.forEach((line, i) => {
            tooltip.append("text")
              .attr("x", padding)
              .attr("y", padding + (i + 1) * lineHeight - 2)
              .attr("fill", "#ecf0f1")
              .style("font-size", "11px")
              .style("font-family", "monospace")
              .text(line);
          });
        })
        .on("mouseleave", (event: any) => {
          setHoveredNode(null);
          
          // Remover tooltip
          container.selectAll(".node-tooltip").remove();
          
          select(event.currentTarget as SVGCircleElement)
            .transition()
            .duration(200)
            .attr("r", (d: any) => {
              const degree = d.degree || 1;
              const logScale = Math.log(degree + 3);
              return Math.min(logScale * 3 + 3, 8);
            })
            .attr("stroke-width", 2);
          
          link.style("stroke-opacity", 0.3)
            .style("stroke-width", 1);
        })
        .call(drag(simulation));

    node.append("title").text(d => d.id);

    const labels = container.append("g")
      .selectAll("text")
      .data(graphData.nodes)
      .join("text")
        .attr("text-anchor", "middle")
        .attr("dy", ".35em")
        .attr("fill", "#1a1a1a")
        .style("font-size", "6px")
        .style("font-weight", "bold")
        .style("pointer-events", "none")
        .text(d => d.id.substring(0, 3)); // Mostrar apenas 3 primeiras letras

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

    // Zoom automático para mostrar todos os nós após um pequeno delay
    setTimeout(() => {
      const nodes = graphData.nodes as any[];
      if (nodes.length === 0) return;
      
      const xValues = nodes.map(d => d.x || 0);
      const yValues = nodes.map(d => d.y || 0);
      
      const minX = Math.min(...xValues);
      const maxX = Math.max(...xValues);
      const minY = Math.min(...yValues);
      const maxY = Math.max(...yValues);
      
      const padding = 50;
      const fullWidth = maxX - minX + padding * 2;
      const fullHeight = maxY - minY + padding * 2;
      
      const scale = Math.min(width / fullWidth, height / fullHeight) * 0.9;
      const translateX = (width - fullWidth * scale) / 2 - minX * scale + padding * scale;
      const translateY = (height - fullHeight * scale) / 2 - minY * scale + padding * scale;
      
      svg.transition()
        .duration(200)
        .call(zoomBehavior.transform as any, d3.zoomIdentity.translate(translateX, translateY).scale(scale));
    }, 1000);

    return () => {
      simulation.stop();
    };

  }, [graphData, width, height, resetKey]);

  return (
    <div className="w-full h-full flex flex-col">
      <div className="bg-gray-800 px-4 py-3 border-b border-gray-700">
        <div className="flex items-center gap-6 flex-wrap">
          <label className="text-sm text-gray-300">
            Conexões mínimas:
            <input 
              type="range" 
              min="1" 
              max="20" 
              value={filterThreshold}
              onChange={(e) => setFilterThreshold(parseInt(e.target.value))}
              className="ml-2 w-32"
            />
            <span className="ml-2 font-bold text-orange-400">{filterThreshold}+</span>
          </label>
          
          <label className="text-sm text-gray-300 flex items-center gap-2 cursor-pointer">
            <input 
              type="checkbox" 
              checked={hideBots}
              onChange={(e) => setHideBots(e.target.checked)}
              className="w-4 h-4"
            />
            <span>Ocultar bots</span>
          </label>
          
          <button
            onClick={() => setResetKey(prev => prev + 1)}
            className="text-sm px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded"
          >
            Resetar vista
          </button>
        </div>
        <div className="text-xs text-gray-400 mt-2 flex gap-6">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "#3498db" }}></div>
            <span>Poucos (&lt;3)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "#e67e22" }}></div>
            <span>Médios (3-9)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "#e74c3c" }}></div>
            <span>Muitos (10-19)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "#c0392b" }}></div>
            <span>Muito muitos (20+)</span>
          </div>
        </div>
      </div>
      
      <svg
         ref={svgRef}
         viewBox={`0 0 ${800} ${300}`}
         preserveAspectRatio="xMidYMid meet"
         style={{ width: '100%', height: '100%' }}
      >
      </svg>
      
      <div className="text-xs text-gray-400 px-2 py-1 bg-gray-900 text-center">
        Exibindo {graphData.nodes.length} colaboradores com {graphData.links.length} conexões
        {hoveredNode && <span> | Hovering: <strong>{hoveredNode}</strong></span>}
      </div>
    </div>
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
export function CommitMetricsChart({ data, line_toggle }: { data: BasicDatum[] , line_toggle: boolean}) {
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
      .domain([0, max(data, (d) => Math.max(d.value, d.totalLines)) ?? 0])
      .nice()
      .range([height - margin.bottom, margin.top]);

    const yScaleChanges = scaleLinear()
      .domain([0, max(data, (d) => d.additions + d.deletions) ?? 0])
      .nice()
      .range([height - margin.bottom, margin.top]);

    // Grid lines (horizontal) - CHANGED: Now based on yScaleChanges (additions + deletions)
    const gridLines = svg
      .append('g')
      .attr('class', 'grid');

    const yTicks = yScaleChanges.ticks(8);
    yTicks.forEach((tick) => {
      gridLines
        .append('line')
        .attr('x1', margin.left)
        .attr('x2', width - margin.right)
        .attr('y1', yScaleChanges(tick))
        .attr('y2', yScaleChanges(tick))
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

    // Left Y Axis - CHANGED: Now represents Additions + Deletions instead of Total Lines
    const yAxisLeft = svg
      .append('g')
      .attr('transform', `translate(${margin.left}, 0)`)
      .call(axisLeft(yScaleChanges).ticks(8));
    
    yAxisLeft.selectAll('text').style('fill', '#94a3b8').style('font-size', '11px');
    yAxisLeft.selectAll('line').style('stroke', '#334155');
    yAxisLeft.select('.domain').style('stroke', '#334155');

    // Area chart (Total Lines) - Background
    const areaGenerator = area<BasicDatum>()
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


    // CHANGED: Line opacity controlled by line_toggle prop
    const line_opacity = line_toggle ? 1.0 : 0.0;
    
    // Line Chart - Changes per Commit (blue)
    // CHANGED: Now uses yScaleChanges to align with the top of stacked bars
    const changesLine = line<BasicDatum>()
      .x((d) => (xScale(d.date) ?? 0) + xScale.bandwidth() / 2)
      .y((d) => yScaleChanges(d.additions + d.deletions))
      .curve(curveMonotoneX);

    svg
      .append('path')
      .datum(data)
      .attr('fill', 'none')
      .attr('stroke', '#3b82f6')
      .attr('stroke-width', 2.5)
      .style('opacity', line_opacity)
      .attr('d', changesLine);

    // Changes per commit line points
    svg
      .append('g')
      .selectAll('circle')
      .data(data)
      .join('circle')
      .attr('cx', (d) => (xScale(d.date) ?? 0) + xScale.bandwidth() / 2)
      .attr('cy', (d) => yScaleChanges(d.additions + d.deletions))
      .attr('r', 3.5)
      .attr('fill', '#3b82f6')
      .attr('stroke', '#1e293b')
      .attr('stroke-width', 1.5)
      .style('opacity', line_opacity)
      .append('title')
      .text((d) => `${d.date}\nChanges: ${(d.additions + d.deletions)}`);

    // Legend
    const legend = svg
      .append('g')
      .attr('transform', `translate(${margin.left}, ${margin.top - 25})`);

    const legendItems = [
      { label: 'Total lines', color: '#475569', type: 'area' },
      { label: 'Changes per commit', color: '#3b82f6', type: 'line' },
      { label: 'Additions', color: '#84cc16', type: 'rect' },
      { label: 'Deletions', color: '#ef4444', type: 'rect' },
    ];

    // CHANGED: Calculate spacing based on available width for better alignment
    const legendWidth = width - margin.left - margin.right;
    const itemSpacing = legendWidth / legendItems.length;

    legendItems.forEach((item, i) => {
      const legendItem = legend
        .append('g')
        .attr('transform', `translate(${i * itemSpacing}, 0)`);

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

  }, [data, line_toggle]);

  return <svg ref={svgRef} className="w-full h-[600px]" role="img" aria-label="Commit Metrics Chart" />;
}
