import { useEffect, useRef } from 'react';
import * as d3 from 'd3';

interface LanguageData {
  language: string;
  file_count: number;
  total_bytes: number;
  percentage: number;
  files?: Array<{
    path: string;
    name: string;
    size: number;
    extension: string;
  }>;
}

interface RepoAnalysis {
  repository: string;
  owner: string;
  branch: string;
  total_files: number;
  total_bytes: number;
  languages: LanguageData[];
}

interface RepoTreemapProps {
  data: RepoAnalysis;
  width?: number;
  height?: number;
}

interface TreemapNode {
  name: string;
  value?: number;
  percentage?: number;
  fileCount?: number;
  files?: Array<{
    path: string;
    name: string;
    size: number;
    extension: string;
  }>;
  children?: TreemapNode[];
}

export const RepoTreemap: React.FC<RepoTreemapProps> = ({
  data,
  width = 800,
  height = 600
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const tooltipRef = useRef<HTMLDivElement | null>(null);

  // Mapa de cores (igual ao Circle Pack)
  const colorMap: Record<string, string> = {
    'Python': '#3572A5',
    'JavaScript': '#f1e05a',
    'TypeScript': '#2b7489',
    'Java': '#b07219',
    'C++': '#f34b7d',
    'C': '#555555',
    'Go': '#00ADD8',
    'Rust': '#dea584',
    'Ruby': '#701516',
    'PHP': '#4F5D95',
    'HTML': '#e34c26',
    'CSS': '#563d7c',
    'SCSS': '#c6538c',
    'Shell': '#89e051',
    'Markdown': '#083fa1',
    'JSON': '#292929',
    'YAML': '#cb171e',
    'Unknown': '#cccccc',
    'No Extension': '#999999'
  };

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  useEffect(() => {
    if (!svgRef.current || !data) return;

    if (!data.languages || data.languages.length === 0) {
      console.warn('No language data available');
      return;
    }

    // Limpar SVG anterior
    d3.select(svgRef.current).selectAll('*').remove();

    // Criar hierarquia de dados
    const hierarchyData: TreemapNode = {
      name: 'root',
      children: data.languages.map(lang => ({
        name: lang.language,
        value: lang.total_bytes,
        percentage: lang.percentage,
        fileCount: lang.file_count,
        files: lang.files || []
      }))
    };

    const root = d3.hierarchy<TreemapNode>(hierarchyData)
      .sum(d => d.value || 0)
      .sort((a, b) => (b.value || 0) - (a.value || 0));

    // Criar treemap
    const treemap = d3.treemap<TreemapNode>()
      .size([width, height])
      .paddingInner(2)
      .paddingOuter(4)
      .round(true);

    treemap(root);

    // SVG
    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', `0 0 ${width} ${height}`)
      .style('max-width', '100%')
      .style('height', 'auto');

    // Criar tooltip
    const createTooltip = () => {
      if (!tooltipRef.current) {
        tooltipRef.current = document.createElement('div');
        tooltipRef.current.className = 'repo-tooltip';
        tooltipRef.current.style.cssText = `
          position: absolute;
          background: rgba(0, 0, 0, 0.9);
          color: #fff;
          padding: 12px;
          border-radius: 6px;
          pointer-events: none;
          z-index: 1000;
          font-size: 12px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          display: none;
        `;
        document.body.appendChild(tooltipRef.current);
      }
      return tooltipRef.current;
    };

    const tooltip = createTooltip();

    // Criar células do treemap
    const cells = svg.selectAll<SVGGElement, d3.HierarchyRectangularNode<TreemapNode>>('g')
      .data(root.leaves() as d3.HierarchyRectangularNode<TreemapNode>[])
      .enter()
      .append('g')
      .attr('transform', (d: any) => `translate(${d.x0},${d.y0})`);

    // Retângulos
    cells.append('rect')
      .attr('width', (d: any) => d.x1 - d.x0)
      .attr('height', (d: any) => d.y1 - d.y0)
      .attr('fill', d => colorMap[d.data.name] || colorMap['Unknown'])
      .attr('stroke', '#1a1a1a')
      .attr('stroke-width', 2)
      .attr('opacity', 0.85)
      .style('cursor', 'pointer')
      .on('mouseover', function(event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('opacity', 1)
          .attr('stroke-width', 3);

        const sampleFiles = (d.data.files || []).slice(0, 5);
        const filesList = sampleFiles.map(f => `  • ${f.name} (${formatBytes(f.size)})`).join('<br/>');
        const moreFiles = (d.data.files?.length || 0) > 5
          ? `<br/>  ... and ${(d.data.files?.length || 0) - 5} more files`
          : '';

        tooltip.innerHTML = `
          <div style="border-bottom: 1px solid #555; padding-bottom: 8px; margin-bottom: 8px;">
            <strong style="font-size: 14px;">${d.data.name}</strong>
          </div>
          <div>
            <strong>Files:</strong> ${d.data.fileCount}<br/>
            <strong>Size:</strong> ${formatBytes(d.data.value || 0)}<br/>
            <strong>Percentage:</strong> ${(d.data.percentage || 0).toFixed(2)}%
          </div>
          ${sampleFiles.length > 0 ? `
            <div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid #555; font-size: 10px;">
              <strong>Sample files:</strong><br/>
              ${filesList}${moreFiles}
            </div>
          ` : ''}
        `;

        tooltip.style.display = 'block';
        tooltip.style.left = `${event.pageX + 15}px`;
        tooltip.style.top = `${event.pageY + 15}px`;
      })
      .on('mouseout', function() {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('opacity', 0.85)
          .attr('stroke-width', 2);

        tooltip.style.display = 'none';
      })
      .on('mousemove', function(event) {
        tooltip.style.left = `${event.pageX + 15}px`;
        tooltip.style.top = `${event.pageY + 15}px`;
      });

    // Labels
    cells.append('text')
      .attr('x', 4)
      .attr('y', 16)
      .style('pointer-events', 'none')
      .style('user-select', 'none')
      .each(function(d: any) {
        const text = d3.select(this);
        const cellWidth = d.x1 - d.x0;
        const cellHeight = d.y1 - d.y0;

        // Apenas mostrar label se houver espaço suficiente
        if (cellWidth > 50 && cellHeight > 30) {
          // Nome da linguagem
          text.append('tspan')
            .attr('x', 4)
            .attr('y', 16)
            .attr('font-size', Math.min(cellWidth / 8, 14))
            .attr('font-weight', 'bold')
            .attr('fill', '#fff')
            .style('text-shadow', '1px 1px 3px rgba(0,0,0,0.8)')
            .text(cellWidth > 100 ? d.data.name : d.data.name.substring(0, 8));

          // Percentual
          if (cellHeight > 50) {
            text.append('tspan')
              .attr('x', 4)
              .attr('y', 32)
              .attr('font-size', Math.min(cellWidth / 10, 12))
              .attr('fill', '#fff')
              .attr('opacity', 0.9)
              .style('text-shadow', '1px 1px 2px rgba(0,0,0,0.6)')
              .text(`${(d.data.percentage || 0).toFixed(1)}%`);
          }
        }
      });

    return () => {
      if (tooltipRef.current) {
        tooltipRef.current.remove();
        tooltipRef.current = null;
      }
    };

  }, [data, width, height]);

  useEffect(() => {
    return () => {
      if (tooltipRef.current) {
        tooltipRef.current.remove();
        tooltipRef.current = null;
      }
    };
  }, []);

  if (!data || !data.languages || data.languages.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-slate-400">No language data available for visualization</p>
      </div>
    );
  }

  return (
    <div className="repo-treemap-container">
      <svg ref={svgRef}></svg>
    </div>
  );
};