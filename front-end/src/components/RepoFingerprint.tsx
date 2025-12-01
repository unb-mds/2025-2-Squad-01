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

// Tipo para os nós do Circle Pack
interface CirclePackNode {
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
  children?: CirclePackNode[];
}

export const RepoFingerprint: React.FC<RepoFingerprintProps> = ({ 
  data, 
  width = 800, 
  height = 600 
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const tooltipRef = useRef<HTMLDivElement | null>(null);
  
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

    // Validação de dados
    if (!data.languages || data.languages.length === 0) {
      console.warn('No language data available');
      return;
    }

    // Limpar SVG anterior
    d3.select(svgRef.current).selectAll('*').remove();
    
    // Limpar tooltip anterior se existir
    if (tooltipRef.current) {
      tooltipRef.current.remove();
      tooltipRef.current = null;
    }

    const margin = { top: 20, right: 20, bottom: 20, left: 20 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;
    const radius = Math.min(innerWidth, innerHeight) / 2;

    // Criar SVG
    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height);

    const g = svg.append('g')
      .attr('transform', `translate(${width / 2},${height / 2})`);

    // Preparar dados hierárquicos com tipagem correta
    const hierarchyData: CirclePackNode = {
      name: 'root',
      children: data.languages.map(lang => ({
        name: lang.language,
        value: lang.total_bytes,
        percentage: lang.percentage,
        fileCount: lang.file_count,
        files: lang.files || []
      }))
    };

    const root = d3.hierarchy<CirclePackNode>(hierarchyData)
      .sum(d => d.value || 0)
      .sort((a, b) => (b.value || 0) - (a.value || 0));

    // Criar treemap
    const pack = d3.pack<CirclePackNode>()
      .size([radius * 2, radius * 2])
      .padding(5)
     

    const packedRoot = pack(root);

    // Criar tooltip React-friendly
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

    // Criar células
    const nodes = g.selectAll<SVGGElement, d3.HierarchyCircularNode<CirclePackNode>>('circle')
      .data(packedRoot.descendants())
      .enter()
      .append('circle')
      .attr('cx', d => d.x - radius)
      .attr('cy', d => d.y - radius)
      .attr('r', d => d.r)
      .attr('fill', d => {
        if (d.children) return 'none'; // Nó raiz sem preenchimento
        return colorMap[d.data.name] || colorMap['Unknown'];
      })
      .attr('stroke', d => {
        if (d.children) return '#666';
        return colorMap[d.data.name] || colorMap['Unknown'];
      })
      .attr('stroke-width', d => d.children ? 2 : 1.5)
      .attr('opacity', 0.85)
      .style('cursor', d => d.children ? 'default' : 'pointer')
      .on('mouseover', function(event, d) {
        if (d.children) return; // Não mostrar tooltip para nó raiz

        d3.select(this)
          .transition()
          .duration(200)
          .attr('opacity', 1)
          .attr('stroke-width', 3);

        // Preparar conteúdo do tooltip
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
      .on('mouseout', function(event, d) {
        if (d.children) return;
        
        d3.select(this)
          .transition()
          .duration(200)
          .attr('opacity', 0.85)
          .attr('stroke-width', 1.5);
        
        tooltip.style.display = 'none';
      })
      .on('mousemove', function(event) {
        tooltip.style.left = `${event.pageX + 15}px`;
        tooltip.style.top = `${event.pageY + 15}px`;
      });

    // Labels nos círculos (apenas para círculos grandes)
    g.selectAll<SVGTextElement, d3.HierarchyCircularNode<CirclePackNode>>('text')
      .data(packedRoot.descendants().filter(d => !d.children && d.r > 25))
      .enter()
      .append('text')
      .attr('x', d => d.x - radius)
      .attr('y', d => d.y - radius)
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'middle')
      .style('pointer-events', 'none')
      .style('user-select', 'none')
      .each(function(d) {
        const text = d3.select(this);
        const name = d.data.name;
        const percentage = (d.data.percentage || 0).toFixed(1) + '%';
        
        // Nome da linguagem
        if (d.r > 40) {
          text.append('tspan')
            .attr('x', d.x - radius)
            .attr('y', d.y - radius - 5)
            .attr('font-size', Math.min(d.r / 4, 14))
            .attr('font-weight', 'bold')
            .attr('fill', '#fff')
            .style('text-shadow', '1px 1px 3px rgba(0,0,0,0.8)')
            .text(d.r > 60 ? name : name.substring(0, 8));
          
          // Percentual
          text.append('tspan')
            .attr('x', d.x - radius)
            .attr('y', d.y - radius + 10)
            .attr('font-size', Math.min(d.r / 5, 12))
            .attr('fill', '#fff')
            .attr('opacity', 0.9)
            .style('text-shadow', '1px 1px 2px rgba(0,0,0,0.6)')
            .text(percentage);
        } else if (d.r > 30) {
          // Apenas percentual para círculos médios
          text.append('tspan')
            .attr('x', d.x - radius)
            .attr('y', d.y - radius)
            .attr('font-size', 11)
            .attr('fill', '#fff')
            .style('text-shadow', '1px 1px 2px rgba(0,0,0,0.6)')
            .text(percentage);
        }
      });

    // Cleanup function
    return () => {
      if (tooltipRef.current) {
        tooltipRef.current.remove();
        tooltipRef.current = null;
      }
    };

  }, [data, width, height]);

  // Cleanup ao desmontar componente
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
      <div className="repo-fingerprint-container flex items-center justify-center h-full">
        <p className="text-slate-400">No language data available for visualization</p>
      </div>
    );
  }

  return (
    <div className="repo-fingerprint-container">
      <svg ref={svgRef}></svg>
    </div>
  );
};

    
