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

interface RepoFingerprintProps {
  data: RepoAnalysis;
  width?: number;
  height?: number;
}

export const RepoFingerprint: React.FC<RepoFingerprintProps> = ({ 
  data, 
  width = 800, 
  height = 600 
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  
  // Mapa de cores para linguagens (baseado no GitHub Linguist)
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

    // Limpar SVG anterior
    d3.select(svgRef.current).selectAll('*').remove();

    const margin = { top: 20, right: 20, bottom: 20, left: 20 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // Criar SVG
    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height);

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Preparar dados hierárquicos
    const root = d3.hierarchy({
      name: 'root',
      children: data.languages.map(lang => ({
        name: lang.language,
        value: lang.total_bytes,
        percentage: lang.percentage,
        fileCount: lang.file_count,
        files: lang.files || []
      }))
    })
    .sum(d => d.value || 0)
    .sort((a, b) => (b.value || 0) - (a.value || 0));

    // Criar treemap
    const treemap = d3.treemap<any>()
      .size([innerWidth, innerHeight])
      .padding(2)
      .round(true);

    treemap(root);

    // Criar células
    const cells = g.selectAll('g')
      .data(root.leaves())
      .enter()
      .append('g')
      .attr('class', 'cell')
      .attr('transform', d => `translate(${d.x0},${d.y0})`);

    // Adicionar retângulos
    cells.append('rect')
      .attr('width', d => d.x1 - d.x0)
      .attr('height', d => d.y1 - d.y0)
      .attr('fill', d => colorMap[d.data.name] || colorMap['Unknown'])
      .attr('stroke', '#fff')
      .attr('stroke-width', 2)
      .style('cursor', 'pointer')
      .on('mouseover', function(event, d) {
        // Highlight
        d3.select(this).attr('opacity', 0.8);
        
        // Criar tooltip
        const tooltip = d3.select('body')
          .append('div')
          .attr('class', 'repo-tooltip')
          .style('position', 'absolute')
          .style('background', 'rgba(0, 0, 0, 0.9)')
          .style('color', '#fff')
          .style('padding', '12px')
          .style('border-radius', '6px')
          .style('pointer-events', 'none')
          .style('z-index', '1000')
          .style('font-size', '12px')
          .style('box-shadow', '0 2px 8px rgba(0,0,0,0.3)');

        const sampleFiles = (d.data.files || []).slice(0, 5);
        const filesList = sampleFiles.map((f: any) => `  • ${f.name}`).join('<br/>');
        const moreFiles = (d.data.files?.length || 0) > 5 
          ? `<br/>  ... and ${(d.data.files?.length || 0) - 5} more` 
          : '';

        tooltip.html(`
          <div style="border-bottom: 1px solid #555; padding-bottom: 8px; margin-bottom: 8px;">
            <strong style="font-size: 14px;">${d.data.name}</strong>
          </div>
          <div>
            <strong>Files:</strong> ${d.data.fileCount}<br/>
            <strong>Size:</strong> ${formatBytes(d.data.value)}<br/>
            <strong>Percentage:</strong> ${d.data.percentage.toFixed(2)}%
          </div>
          ${sampleFiles.length > 0 ? `
            <div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid #555; font-size: 10px;">
              <strong>Sample files:</strong><br/>
              ${filesList}${moreFiles}
            </div>
          ` : ''}
        `)
          .style('left', `${event.pageX + 15}px`)
          .style('top', `${event.pageY + 15}px`);
      })
      .on('mouseout', function() {
        d3.select(this).attr('opacity', 1);
        d3.selectAll('.repo-tooltip').remove();
      })
      .on('mousemove', function(event) {
        d3.select('.repo-tooltip')
          .style('left', `${event.pageX + 15}px`)
          .style('top', `${event.pageY + 15}px`);
      });

    // Adicionar labels
    cells.append('text')
      .attr('x', 5)
      .attr('y', 20)
      .text(d => {
        const width = d.x1 - d.x0;
        return width > 60 ? d.data.name : '';
      })
      .attr('font-size', '14px')
      .attr('font-weight', 'bold')
      .attr('fill', '#fff')
      .style('text-shadow', '1px 1px 2px rgba(0,0,0,0.8)')
      .attr('pointer-events', 'none');

    // Adicionar percentual
    cells.append('text')
      .attr('x', 5)
      .attr('y', 38)
      .text(d => {
        const width = d.x1 - d.x0;
        const height = d.y1 - d.y0;
        return (width > 60 && height > 40) ? `${d.data.percentage.toFixed(1)}%` : '';
      })
      .attr('font-size', '12px')
      .attr('fill', '#fff')
      .attr('opacity', 0.9)
      .style('text-shadow', '1px 1px 2px rgba(0,0,0,0.6)')
      .attr('pointer-events', 'none');

  }, [data, width, height]);

  return (
    <div className="repo-fingerprint-container">
      <svg ref={svgRef}></svg>
    </div>
  );
};  