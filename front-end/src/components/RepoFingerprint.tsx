import { useEffect, useRef, useState } from 'react';
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
  isDirectory?: boolean;
  isLanguage?: boolean;
}

export const RepoFingerprint: React.FC<RepoFingerprintProps> = ({ 
  data, 
  width = 800, 
  height = 600 
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const tooltipRef = useRef<HTMLDivElement | null>(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  
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

    // Container para aplicar zoom/pan
    const container = svg.append('g');
    
    const g = container.append('g')
      .attr('transform', `translate(${width / 2},${height / 2})`);

    // ===== NOVA ESTRUTURA: Organizar por diretórios =====
    
    // Estrutura: { diretorio: { linguagem: { bytes, files: [] } } }
    const directoryMap: Record<string, Record<string, { bytes: number; files: any[] }>> = {};
    
    // Processar todos os arquivos de todas as linguagens
    data.languages.forEach(lang => {
      if (!lang.files) return;
      
      lang.files.forEach(file => {
        // Extrair diretório do path (tudo antes do último /)
        const pathParts = file.path.split('/');
        const directory = pathParts.length > 1 
          ? pathParts.slice(0, -1).join('/') || 'root'
          : 'root';
        
        // Inicializar estruturas se não existirem
        if (!directoryMap[directory]) {
          directoryMap[directory] = {};
        }
        if (!directoryMap[directory][lang.language]) {
          directoryMap[directory][lang.language] = { bytes: 0, files: [] };
        }
        
        // Adicionar arquivo ao diretório/linguagem
        directoryMap[directory][lang.language].bytes += file.size;
        directoryMap[directory][lang.language].files.push(file);
      });
    });

    // Converter para estrutura hierárquica para D3
    const directories = Object.entries(directoryMap).map(([dirName, languages]) => {
      const langChildren = Object.entries(languages).map(([langName, langData]) => ({
        name: langName,
        value: langData.bytes,
        fileCount: langData.files.length,
        files: langData.files,
        isLanguage: true
      }));

      const totalBytes = langChildren.reduce((sum, child) => sum + (child.value || 0), 0);

      return {
        name: dirName,
        value: totalBytes,
        children: langChildren,
        isDirectory: true
      };
    });

    // Criar hierarquia
    const hierarchyData: CirclePackNode = {
      name: 'root',
      children: directories
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
        if (d.depth === 0) return 'none'; // Nó raiz
        if (d.data.isDirectory) return 'rgba(50, 50, 50, 0.3)'; // Círculo de diretório semi-transparente
        if (d.data.isLanguage) return colorMap[d.data.name] || colorMap['Unknown']; // Linguagem colorida
        return 'none';
      })
      .attr('stroke', d => {
        if (d.depth === 0) return '#444';
        if (d.data.isDirectory) return '#888'; // Borda cinza para diretórios
        if (d.data.isLanguage) return colorMap[d.data.name] || colorMap['Unknown'];
        return '#666';
      })
      .attr('stroke-width', d => {
        if (d.depth === 0) return 2;
        if (d.data.isDirectory) return 2.5;
        if (d.data.isLanguage) return 1.5;
        return 1;
      })
      .attr('opacity', d => d.data.isLanguage ? 0.85 : 1)
      .style('cursor', d => (d.data.isLanguage || d.data.isDirectory) ? 'pointer' : 'default')
      .on('mouseover', function(event, d) {
        if (d.depth === 0) return; // Não mostrar tooltip para nó raiz

        d3.select(this)
          .transition()
          .duration(200)
          .attr('opacity', 1)
          .attr('stroke-width', d.data.isDirectory ? 3.5 : 3);

        // Tooltip para DIRETÓRIO
        if (d.data.isDirectory) {
          const totalFiles = d.children?.reduce((sum, child) => sum + (child.data.fileCount || 0), 0) || 0;
          const languages = d.children?.map(child => child.data.name).join(', ') || '';
          
          tooltip.innerHTML = `
            <div style="border-bottom: 1px solid #555; padding-bottom: 8px; margin-bottom: 8px;">
              <strong style="font-size: 14px;">📁 ${d.data.name}</strong>
            </div>
            <div>
              <strong>Total Files:</strong> ${totalFiles}<br/>
              <strong>Total Size:</strong> ${formatBytes(d.data.value || 0)}<br/>
              <strong>Languages:</strong> ${d.children?.length || 0}
            </div>
            <div style="margin-top: 8px; font-size: 11px; opacity: 0.8;">
              ${languages}
            </div>
          `;
        }
        // Tooltip para LINGUAGEM
        else if (d.data.isLanguage) {
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
              <strong>Size:</strong> ${formatBytes(d.data.value || 0)}
            </div>
            ${sampleFiles.length > 0 ? `
              <div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid #555; font-size: 10px;">
                <strong>Sample files:</strong><br/>
                ${filesList}${moreFiles}
              </div>
            ` : ''}
          `;
        }

        tooltip.style.display = 'block';
        tooltip.style.left = `${event.pageX + 15}px`;
        tooltip.style.top = `${event.pageY + 15}px`;
      })
      .on('mouseout', function(event, d) {
        if (d.depth === 0) return;
        
        d3.select(this)
          .transition()
          .duration(200)
          .attr('opacity', d.data.isLanguage ? 0.85 : 1)
          .attr('stroke-width', d.data.isDirectory ? 2.5 : 1.5);
        
        tooltip.style.display = 'none';
      })
      .on('mousemove', function(event) {
        tooltip.style.left = `${event.pageX + 15}px`;
        tooltip.style.top = `${event.pageY + 15}px`;
      });

    // Labels nos círculos
    g.selectAll<SVGTextElement, d3.HierarchyCircularNode<CirclePackNode>>('text')
      .data(packedRoot.descendants().filter(d => d.depth > 0 && d.r > 20))
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
        
        // LABEL PARA DIRETÓRIO
        if (d.data.isDirectory && d.r > 50) {
          // Nome do diretório (encurtado se necessário)
          const displayName = name.length > 20 ? name.substring(name.lastIndexOf('/') + 1) : name;
          
          text.append('tspan')
            .attr('x', d.x - radius)
            .attr('y', d.y - radius - d.r + 15) // No topo do círculo
            .attr('font-size', Math.min(d.r / 6, 12))
            .attr('font-weight', 'bold')
            .attr('fill', '#fff')
            .style('text-shadow', '1px 1px 3px rgba(0,0,0,0.9)')
            .text(`📁 ${displayName}`);
          
          // Quantidade de arquivos
          const totalFiles = d.children?.reduce((sum, child) => sum + (child.data.fileCount || 0), 0) || 0;
          text.append('tspan')
            .attr('x', d.x - radius)
            .attr('y', d.y - radius - d.r + 30)
            .attr('font-size', Math.min(d.r / 8, 10))
            .attr('fill', '#ccc')
            .style('text-shadow', '1px 1px 2px rgba(0,0,0,0.8)')
            .text(`${totalFiles} files`);
        }
        // LABEL PARA LINGUAGEM
        else if (d.data.isLanguage && d.r > 25) {
          // Nome da linguagem
          if (d.r > 35) {
            text.append('tspan')
              .attr('x', d.x - radius)
              .attr('y', d.y - radius - 5)
              .attr('font-size', Math.min(d.r / 4, 13))
              .attr('font-weight', 'bold')
              .attr('fill', '#fff')
              .style('text-shadow', '1px 1px 3px rgba(0,0,0,0.8)')
              .text(d.r > 50 ? name : name.substring(0, 6));
            
            // Quantidade de arquivos
            text.append('tspan')
              .attr('x', d.x - radius)
              .attr('y', d.y - radius + 10)
              .attr('font-size', Math.min(d.r / 5, 11))
              .attr('fill', '#fff')
              .attr('opacity', 0.9)
              .style('text-shadow', '1px 1px 2px rgba(0,0,0,0.6)')
              .text(`${d.data.fileCount} files`);
          } else {
            // Apenas abreviação para círculos pequenos
            text.append('tspan')
              .attr('x', d.x - radius)
              .attr('y', d.y - radius)
              .attr('font-size', 10)
              .attr('fill', '#fff')
              .style('text-shadow', '1px 1px 2px rgba(0,0,0,0.6)')
              .text(name.substring(0, 3));
          }
        }
      });

    // ===== ADICIONAR ZOOM E PAN =====
    const zoomBehavior = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.5, 8])  // Min 0.5x (zoom out), Max 8x (zoom in)
      .on("zoom", (event) => {
        container.attr("transform", event.transform);
        setZoomLevel(event.transform.k);
      });

    svg.call(zoomBehavior as any);

    // Botões de controle de zoom
    const controlsGroup = svg.append('g')
      .attr('class', 'zoom-controls')
      .attr('transform', `translate(${width - 60}, 20)`);

    // Botão Zoom In
    const zoomInBtn = controlsGroup.append('g')
      .attr('class', 'zoom-btn')
      .style('cursor', 'pointer')
      .on('click', () => {
        svg.transition()
          .duration(300)
          .call(zoomBehavior.scaleBy as any, 1.3);
      });

    zoomInBtn.append('rect')
      .attr('width', 40)
      .attr('height', 30)
      .attr('rx', 5)
      .attr('fill', '#2c3e50')
      .attr('stroke', '#ecf0f1')
      .attr('stroke-width', 1.5);

    zoomInBtn.append('text')
      .attr('x', 20)
      .attr('y', 20)
      .attr('text-anchor', 'middle')
      .attr('fill', '#ecf0f1')
      .attr('font-size', '18px')
      .attr('font-weight', 'bold')
      .text('+');

    // Botão Zoom Out
    const zoomOutBtn = controlsGroup.append('g')
      .attr('class', 'zoom-btn')
      .attr('transform', 'translate(0, 35)')
      .style('cursor', 'pointer')
      .on('click', () => {
        svg.transition()
          .duration(300)
          .call(zoomBehavior.scaleBy as any, 0.7);
      });

    zoomOutBtn.append('rect')
      .attr('width', 40)
      .attr('height', 30)
      .attr('rx', 5)
      .attr('fill', '#2c3e50')
      .attr('stroke', '#ecf0f1')
      .attr('stroke-width', 1.5);

    zoomOutBtn.append('text')
      .attr('x', 20)
      .attr('y', 20)
      .attr('text-anchor', 'middle')
      .attr('fill', '#ecf0f1')
      .attr('font-size', '18px')
      .attr('font-weight', 'bold')
      .text('−');

    // Botão Reset
    const resetBtn = controlsGroup.append('g')
      .attr('class', 'zoom-btn')
      .attr('transform', 'translate(0, 70)')
      .style('cursor', 'pointer')
      .on('click', () => {
        svg.transition()
          .duration(500)
          .call(zoomBehavior.transform as any, d3.zoomIdentity);
      });

    resetBtn.append('rect')
      .attr('width', 40)
      .attr('height', 30)
      .attr('rx', 5)
      .attr('fill', '#2c3e50')
      .attr('stroke', '#ecf0f1')
      .attr('stroke-width', 1.5);

    resetBtn.append('text')
      .attr('x', 20)
      .attr('y', 20)
      .attr('text-anchor', 'middle')
      .attr('fill', '#ecf0f1')
      .attr('font-size', '12px')
      .attr('font-weight', 'bold')
      .text('⟲');

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
    <div className="repo-fingerprint-container relative">
      {/* Indicador de Zoom */}
      <div className="absolute top-4 left-4 bg-gray-800/90 text-white px-3 py-2 rounded-lg shadow-lg text-sm font-mono z-10">
        🔍 {(zoomLevel * 100).toFixed(0)}%
      </div>
      
      {/* Instruções */}
      <div className="absolute bottom-4 left-4 bg-gray-800/90 text-white px-3 py-2 rounded-lg shadow-lg text-xs z-10 max-w-xs">
        <p className="font-semibold mb-1">💡 Controles:</p>
        <ul className="space-y-0.5 text-gray-300">
          <li>• <strong>Scroll</strong>: Zoom in/out</li>
          <li>• <strong>Arrastar</strong>: Mover visualização</li>
          <li>• <strong>Hover</strong>: Ver detalhes</li>
        </ul>
      </div>

      <svg ref={svgRef}></svg>
    </div>
  );
};

    