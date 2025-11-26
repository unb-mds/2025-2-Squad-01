import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

interface CalendarHeatmapProps {
  data: Array<{ 
    date: string | Date; 
    value: number;
    authors?: Array<{
      name: string;
      commits: number;
      issues_created: number;
      issues_closed: number;
      prs_created: number;
      prs_closed: number;
      comments: number;
      repositories?: string[];
    }>;
  }>;
  mode?: 'weekly' | 'monthly'; // 'weekly' = 7 dias, 'monthly' = 12 meses
  rows?: number; // Número de linhas de retângulos
  cellSize?: number; // Tamanho de cada célula em pixels
  margin?: { top: number; right: number; bottom: number; left: number };
  colorScheme?: string; // Paleta de cores (ex: 'Blues', 'Greens', 'Reds')
}

const CalendarHeatmap: React.FC<CalendarHeatmapProps> = ({
  data,
  mode = 'weekly',
  rows = 4,
  cellSize = 160,
  margin = { top: 20, right: 20, bottom: 20, left: 100 },
  colorScheme = 'Blues',
}) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    console.log('CalendarHeatmap - Dados recebidos:', data);
    console.log('CalendarHeatmap - Modo:', mode);
    console.log('CalendarHeatmap - Primeiro item tem authors?', data[0]?.authors);

    // Extrair autores únicos dos dados e seus dados por dia
    let authorsData: Array<{ name: string; stats: any; dailyData: any[] }> = [];
    if (data.length > 0 && data[0]?.authors) {
      const authorMap = new Map<string, any>();
      const cols = mode === 'weekly' ? 7 : 12;
      
      // Primeiro pass: coleta todos os autores e seus dados por dia
      data.forEach((day, dayIndex) => {
        day.authors?.forEach(author => {
          if (!authorMap.has(author.name)) {
            authorMap.set(author.name, {
              stats: { 
                commits: 0,
                issues_created: 0,
                issues_closed: 0,
                prs_created: 0,
                prs_closed: 0,
                comments: 0,
              },
              dailyValues: Array(cols).fill(0)
            });
          }
          
          // Armazenar valor do dia para esse autor
          const dayValue = author.commits + author.issues_created + author.issues_closed + 
                          author.prs_created + author.prs_closed + author.comments;
          
          if (dayIndex < cols) {
            const existing = authorMap.get(author.name);
            existing.dailyValues[dayIndex] = dayValue;
            // Combinar stats totais
            existing.stats.commits += author.commits;
            existing.stats.issues_created += author.issues_created;
            existing.stats.issues_closed += author.issues_closed;
            existing.stats.prs_created += author.prs_created;
            existing.stats.prs_closed += author.prs_closed;
            existing.stats.comments += author.comments;
          }
        });
      });
      
      authorsData = Array.from(authorMap.entries()).map(([name, data]) => ({ 
        name, 
        stats: data.stats,
        dailyData: data.dailyValues
      }));
      
      console.log('Autores extraídos:', authorsData.length);
      console.log('Primeiro autor:', authorsData[0]);
    }

    // Usar número de autores como rows, ou fallback para rows prop
    const numRows = authorsData.length > 0 ? authorsData.length : rows || 10;
    const cols = mode === 'weekly' ? 7 : 12; // 7 dias ou 12 meses

    // Configurar dimensões
    const cellHeight = cellSize * 1.2; // Diminuir altura dos retângulos
    const labelWidth = 150; // Espaço para label da fileira
    const width = labelWidth + cols * (cellSize + 5) + margin.left + margin.right;
    const height = numRows * (cellHeight + 10) + margin.top + margin.bottom;

    // Limpar SVG anterior
    d3.select(svgRef.current).selectAll('*').remove();

    // Criar SVG
    const svg = d3
      .select(svgRef.current)
      .attr('width', width)
      .attr('height', height);

    // Preparar dados vazios se necessário
    const dataToRender = data.length > 0 ? data : Array(cols * rows).fill(null).map((_, i) => ({
      date: `Cell ${i}`,
      value: 0,
    }));

    // Encontrar min/max dos valores para escala de cor
    const values = dataToRender.map((d) => d.value);
    const minValue = values.length > 0 ? Math.min(...values) : 0;
    const maxValue = values.length > 0 ? Math.max(...values) : 1;

    // Escala de cor
    const colorScale = d3
      .scaleLinear<string>()
      .domain([minValue, maxValue])
      .range(['rgba(100, 120, 140, 0.4)', 'rgba(150, 180, 220, 0.7)']); // Paleta azulada transparente

    // Criar defs para sombras
    const defs = svg.append('defs');
    const filter = defs
      .append('filter')
      .attr('id', 'shadow')
      .attr('x', '-50%')
      .attr('y', '-50%')
      .attr('width', '200%')
      .attr('height', '200%');

    filter
      .append('feDropShadow')
      .attr('dx', 0)
      .attr('dy', 2)
      .attr('stdDeviation', 3)
      .attr('flood-opacity', 0.3);

    // Grupo principal
    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Criar grid de retângulos
    for (let row = 0; row < numRows; row++) {
      // Obter nome do autor ou fallback para Week
      const authorName = authorsData.length > 0 ? authorsData[row]?.name : `Week ${row + 1}`;
      const authorStats = authorsData.length > 0 ? authorsData[row]?.stats : null;

      // Adicionar label da fileira
      g.append('text')
        .attr('x', -10)
        .attr('y', row * (cellHeight + 10) + (cellHeight - 4) / 2)
        .attr('text-anchor', 'end')
        .attr('dy', '0.35em')
        .attr('font-size', '12px')
        .attr('font-weight', 'bold')
        .attr('fill', 'rgba(200, 200, 200, 0.8)')
        .text(authorName);

      // Adicionar 6 valores vazios (placeholders) na esquerda
      for (let placeholder = 0; placeholder < 6; placeholder++) {
        const rect = g.append('rect')
          .attr('x', labelWidth - 150 + placeholder * (cellSize + 5))
          .attr('y', row * (cellHeight + 10))
          .attr('width', cellSize - 4)
          .attr('height', cellHeight - 4)
          .attr('fill', 'rgba(50, 50, 50, 0.3)')
          .attr('stroke', 'rgba(100, 100, 100, 0.3)')
          .attr('stroke-width', 1)
          .attr('opacity', 0.5);

        // Adicionar dados do autor ao primeiro placeholder de cada fileira
        if (placeholder === 0 && authorStats) {
          // Texto principal (total activities)
          const totalActivities = authorStats.commits + authorStats.issues_created + 
                                  authorStats.issues_closed + authorStats.prs_created + 
                                  authorStats.prs_closed + authorStats.comments;
          
          g.append('text')
            .attr('x', labelWidth - 150 + (cellSize - 4) / 2 + placeholder * (cellSize + 5))
            .attr('y', row * (cellHeight + 10) + 18)
            .attr('text-anchor', 'middle')
            .attr('font-size', '16px')
            .attr('font-weight', 'bold')
            .attr('fill', 'rgba(255, 255, 255, 0.95)')
            .style('pointer-events', 'none')
            .text(`Activities: ${totalActivities}`);

          // Outras informações em fontes menores, com espaçamento maior
          const infoTexts = [
            `Commits: ${authorStats.commits}`,
            `Created Pull Requests: ${authorStats.prs_created}`,
            `Closed Pull Requests: ${authorStats.prs_closed}`,
            `Issues Created: ${authorStats.issues_created}`,
            `Issues Closed: ${authorStats.issues_closed}`,
            `Comments: ${authorStats.comments}`,
          ];
          const baseY = row * (cellHeight + 10) + 38;
          const lineSpacing = 22;
          infoTexts.forEach((text, idx) => {
            g.append('text')
              .attr('x', labelWidth - 150 + (cellSize - 4) / 2 + placeholder * (cellSize + 5))
              .attr('y', baseY + idx * lineSpacing)
              .attr('text-anchor', 'middle')
              .attr('font-size', '12px')
              .attr('fill', 'rgba(200, 200, 200, 0.85)')
              .style('pointer-events', 'none')
              .text(text);
          });
        }
      }

      for (let col = 0; col < cols; col++) {
        // Usar dados diários do autor se disponível
        const value = authorsData.length > 0 && authorsData[row]?.dailyData 
          ? authorsData[row].dailyData[col] 
          : 0;
        
        const displayDate = data[col]?.date ?? `Day ${col + 1}`;

        g.append('rect')
          .attr('x', labelWidth + 10 + col * (cellSize + 5))
          .attr('y', row * (cellHeight + 10))
          .attr('width', cellSize - 4)
          .attr('height', cellHeight - 4)
          .attr('fill', colorScale(value))
          .attr('stroke', 'rgba(200, 220, 240, 0.5)')
          .attr('stroke-width', 1.5)
          .attr('filter', 'url(#shadow)')
          .attr('opacity', 0.9)
          .style('cursor', 'pointer')
          .style('transition', 'all 0.2s ease')
          .on('mouseover', function () {
            d3.select(this)
              .transition()
              .duration(200)
              .attr('opacity', 1)
              .attr('stroke-width', 2)
              .attr('stroke', 'rgba(220, 240, 255, 0.8)');

            // Mostrar tooltip
            svg
              .append('title')
              .text(`Date: ${displayDate}\nValue: ${value}`);
          })
          .on('mouseout', function () {
            d3.select(this)
              .transition()
              .duration(200)
              .attr('opacity', 0.9)
              .attr('stroke-width', 1.5)
              .attr('stroke', 'rgba(200, 220, 240, 0.5)');
          });

        // Adicionar texto com o valor
        g.append('text')
          .attr('x', labelWidth + 10 + col * (cellSize + 5) + (cellSize - 4) / 2)
          .attr('y', row * (cellHeight + 10) + (cellHeight - 4) / 2)
          .attr('text-anchor', 'middle')
          .attr('dy', '0.35em')
          .attr('font-size', '14px')
          .attr('font-weight', 'bold')
          .attr('fill', 'rgba(255, 255, 255, 0.8)')
          .style('pointer-events', 'none')
          .text(value > 0 ? value : '');
      }
    }
  }, [data, mode, rows, cellSize, margin, colorScheme]);

  return (
    <div className="calendar-heatmap-container">
      <svg ref={svgRef}></svg>
    </div>
  );
};

export default CalendarHeatmap;
