import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

interface UserActivityData {
  name: string;
  repositories?: string[];
  activities: {
    commits: number;
    issues_created: number;
    issues_closed: number;
    prs_created: number;
    prs_closed: number;
    comments: number;
  };
  dailyValues: number[]; // Array de valores para cada dia/mês
  dailyDetails: Array<{
    commits: number;
    issues_created: number;
    issues_closed: number;
    prs_created: number;
    prs_closed: number;
    comments: number;
  }>;
}

interface CalendarHeatmapProps {
  userData: UserActivityData[];
  mode?: 'weekly' | 'monthly'; // 'weekly' = 7 dias, 'monthly' = 12 meses
  cellSize?: number; // Tamanho de cada célula em pixels
  margin?: { top: number; right: number; bottom: number; left: number };
  colorScheme?: string; // Paleta de cores (ex: 'Blues', 'Greens', 'Reds')
  dateLabels?: string[]; // Labels das datas (ex: datas reais ou nomes dos meses)
}

const CalendarHeatmap: React.FC<CalendarHeatmapProps> = ({
  userData,
  mode = 'weekly',
  cellSize = 160,
  margin = { top: 20, right: 30, bottom: 20, left: 125 },
  colorScheme = 'Blues',
  dateLabels = [],
}) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || userData.length === 0) return;

    // Definir cores para cada métrica (harmoniosas com o tema escuro)
    const metricColors = {
      commits: 'rgba(96, 165, 250, 0.8)',        // Azul suave
      prs_created: 'rgba(134, 239, 172, 0.8)',   // Verde claro
      prs_closed: 'rgba(74, 222, 128, 0.8)',     // Verde mais escuro
      issues_created: 'rgba(251, 191, 36, 0.8)', // Amarelo/Âmbar
      issues_closed: 'rgba(251, 146, 60, 0.8)',  // Laranja
      comments: 'rgba(196, 181, 253, 0.8)',      // Roxo claro
    };

    // Configurar dimensões
    const cols = userData.length > 0 ? userData[0].dailyValues.length : (mode === 'weekly' ? 7 : 12);
    const rows = userData.length; // Uma linha por usuário
    const cellHeight = cellSize * 1.2;
    const labelWidth = 150;
    const headerHeight = 40; // Espaço extra para labels das datas
    const width = labelWidth + cols * (cellSize + 5) + margin.left + margin.right + 20; // +20 padding extra
    const height = rows * (cellHeight + 10) + margin.top + margin.bottom + headerHeight;

    // Limpar SVG anterior
    d3.select(svgRef.current).selectAll('*').remove();

    // Criar SVG
    const svg = d3
      .select(svgRef.current)
      .attr('width', width)
      .attr('height', height);

    // Encontrar min/max dos valores para escala de cor
    const allValues = userData.flatMap(user => user.dailyValues);
    const minValue = allValues.length > 0 ? Math.min(...allValues) : 0;
    const maxValue = allValues.length > 0 ? Math.max(...allValues) : 1;

    // Escala de cor
    const colorScale = d3
      .scaleLinear<string>()
      .domain([minValue, maxValue])
      .range(['rgba(100, 120, 140, 0.4)', 'rgba(150, 180, 220, 0.7)']);

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

    // Criar filtro de sombra para texto
    const textShadowFilter = defs
      .append('filter')
      .attr('id', 'textShadow')
      .attr('x', '-50%')
      .attr('y', '-50%')
      .attr('width', '200%')
      .attr('height', '200%');

    textShadowFilter
      .append('feDropShadow')
      .attr('dx', 2)
      .attr('dy', 3)
      .attr('stdDeviation', 2)
      .attr('flood-color', '#000000')
      .attr('flood-opacity', 0.7);

    // Grupo principal
    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top + 30})`);

    // Usar dateLabels fornecidos ou gerar labels genéricos
    let labelsToUse = dateLabels;
    if (!dateLabels || dateLabels.length === 0) {
      labelsToUse = mode === 'weekly' 
        ? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
        : ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    }
    
    // Se ainda houver colunas sem labels, gerar datas a partir da última disponível
    if (labelsToUse.length < cols) {
      const newLabels = [...labelsToUse];
      
      // Pegar a última data disponível
      if (labelsToUse.length > 0) {
        const lastLabel = labelsToUse[labelsToUse.length - 1];
        
        // Extrair a data do formato "Nov 11 (Mon)" ou similar
        const dateMatch = lastLabel.match(/(\w{3})\s+(\d+)/);
        if (dateMatch) {
          const monthStr = dateMatch[1];
          const day = parseInt(dateMatch[2]);
          
          // Criar data base
          const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
          const monthIndex = months.indexOf(monthStr);
          const currentYear = new Date().getFullYear();
          let baseDate = new Date(currentYear, monthIndex, day);
          
          // Gerar as datas faltantes
          for (let i = labelsToUse.length; i < cols; i++) {
            baseDate.setDate(baseDate.getDate() + 1);
            
            const newDay = baseDate.getDate();
            const newMonth = months[baseDate.getMonth()];
            
            if (mode === 'weekly') {
              const dayName = baseDate.toLocaleDateString('en-US', { weekday: 'short' });
              newLabels.push(`${newMonth} ${newDay} (${dayName})`);
            } else {
              const monthName = baseDate.toLocaleDateString('en-US', { month: 'long' });
              newLabels.push(`${newMonth} ${newDay} (${monthName})`);
            }
          }
        } else {
          // Se não conseguir extrair, usar formato genérico
          for (let i = labelsToUse.length; i < cols; i++) {
            newLabels.push(`Day ${i + 1}`);
          }
        }
      } else {
        // Se não houver labels, gerar a partir de hoje
        const today = new Date();
        for (let i = 0; i < cols; i++) {
          const date = new Date(today);
          date.setDate(today.getDate() - (cols - 1 - i));
          
          const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
          const monthDay = `${months[date.getMonth()]} ${date.getDate()}`;
          
          if (mode === 'weekly') {
            const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
            newLabels.push(`${monthDay} (${dayName})`);
          } else {
            const monthName = date.toLocaleDateString('en-US', { month: 'long' });
            newLabels.push(`${monthDay} (${monthName})`);
          }
        }
      }
      
      labelsToUse = newLabels;
    }

    // Adicionar legenda na parte superior
    for (let col = 0; col < cols; col++) {
      const labelX = labelWidth + 10 + col * (cellSize + 5) + (cellSize - 4) / 2;
      const labelY = -20;

      g.append('text')
        .attr('x', labelX)
        .attr('y', labelY)
        .attr('text-anchor', 'middle')
        .attr('font-size', '10px')
        .attr('font-weight', 'bold')
        .attr('fill', 'rgba(200, 200, 200, 0.9)')
        .text(labelsToUse[col] || '');
    }

    // Adicionar título "Authors" alinhado com os nomes dos usuários
    g.append('text')
      .attr('x', -20)
      .attr('y', -20)
      .attr('text-anchor', 'end')
      .attr('font-size', '12px')
      .attr('font-weight', 'bold')
      .attr('fill', 'rgba(200, 200, 200, 0.9)')
      .text('Authors:');

    // Adicionar título "Weekly Total" no mesmo nível das datas, acima do primeiro placeholder
    g.append('text')
      .attr('x', labelWidth - 150 + (cellSize - 4) / 2)
      .attr('y', -20)
      .attr('text-anchor', 'middle')
      .attr('font-size', '12px')
      .attr('font-weight', 'bold')
      .attr('fill', 'rgba(200, 200, 200, 0.9)')
      .text('Total Activities:');

    // Criar grid de retângulos
    for (let row = 0; row < rows; row++) {
      const user = userData[row];
      
      // Adicionar label da fileira com nome do usuário
      g.append('text')
        .attr('x', -8)
        .attr('y', row * (cellHeight + 10) + (cellHeight - 4) / 2)
        .attr('text-anchor', 'end')
        .attr('dy', '0.35em')
        .attr('font-size', '12px')
        .attr('font-weight', 'bold')
        .attr('fill', 'rgba(200, 200, 200, 0.8)')
        .text(user.name || `User ${row + 1}`);

      // Adicionar 6 valores vazios (placeholders) na esquerda
      for (let placeholder = 0; placeholder < 6; placeholder++) {
        const cellX = labelWidth - 150 + placeholder * (cellSize + 5);
        const cellY = row * (cellHeight + 10);
        const sectionHeight = (cellHeight - 4) / 6;

        // Retângulo principal
        g.append('rect')
          .attr('x', cellX)
          .attr('y', cellY)
          .attr('width', cellSize - 4)
          .attr('height', cellHeight - 4)
          .attr('fill', 'rgba(50, 50, 50, 0.3)')
          .attr('stroke', 'rgba(100, 100, 100, 0.3)')
          .attr('stroke-width', 1)
          .attr('opacity', 0.5);

        // Adicionar 6 divisões verticais
        for (let section = 1; section < 6; section++) {
          g.append('line')
            .attr('x1', cellX)
            .attr('y1', cellY + section * sectionHeight)
            .attr('x2', cellX + cellSize - 4)
            .attr('y2', cellY + section * sectionHeight)
            .attr('stroke', 'rgba(100, 100, 100, 0.6)')
            .attr('stroke-width', 0.8);
        }

        // Adicionar texto no primeiro placeholder de cada fileira
        if (placeholder === 0) {
          const activities = user.activities;
          const activityValues = [
            activities.commits,
            activities.prs_created,
            activities.prs_closed,
            activities.issues_created,
            activities.issues_closed,
            activities.comments,
          ];
          const activityLabels = [
            'Commits',
            'PRs Created',
            'PRs Closed',
            'Issues Created',
            'Issues Closed',
            'Comments',
          ];
          const activityColorKeys = [
            'commits',
            'prs_created',
            'prs_closed',
            'issues_created',
            'issues_closed',
            'comments',
          ] as const;

          // Adicionar texto em cada seção centralizado
          activityValues.forEach((value, sectionIdx) => {
            const sectionY = cellY + sectionIdx * sectionHeight;
            const centerY = sectionY + sectionHeight / 2;
            const colorKey = activityColorKeys[sectionIdx];

            // Valor em números com cor da métrica (centralizado)
            g.append('text')
              .attr('x', cellX + (cellSize - 4) / 2)
              .attr('y', centerY + 5)
              .attr('text-anchor', 'middle')
              .attr('font-size', '14px')
              .attr('font-weight', 'normal')
              .attr('fill', metricColors[colorKey])
              .style('pointer-events', 'none')
              .text(`${value} ${activityLabels[sectionIdx]}`);
          });
        }
      }

      // Adicionar retângulos com os valores diários
      for (let col = 0; col < cols; col++) {
        const value = user.dailyValues[col] || 0;
        const cellX = labelWidth + 10 + col * (cellSize + 5);
        const cellY = row * (cellHeight + 10);
        const sectionHeight = (cellHeight - 4) / 6;

        g.append('rect')
          .attr('x', cellX)
          .attr('y', cellY)
          .attr('width', cellSize - 4)
          .attr('height', cellHeight - 4)
          .attr('fill', colorScale(value))
          .attr('stroke', 'rgba(200, 220, 240, 0.5)')
          .attr('stroke-width', 1.5)
          .attr('filter', 'url(#shadow)')
          .attr('opacity', 0.8)
          .style('cursor', 'pointer')
          .on('mouseover', function () {
            d3.select(this)
              .transition()
              .duration(200)
              .attr('opacity', 1)
              .attr('stroke-width', 2)
              .attr('stroke', 'rgba(220, 240, 255, 0.8)');
          })
          .on('mouseout', function () {
            d3.select(this)
              .transition()
              .duration(200)
              .attr('opacity', 0.9)
              .attr('stroke-width', 1.5)
              .attr('stroke', 'rgba(200, 220, 240, 0.5)');
          });

        // Adicionar 6 divisões verticais
        for (let section = 1; section < 6; section++) {
          g.append('line')
            .attr('x1', cellX)
            .attr('y1', cellY + section * sectionHeight)
            .attr('x2', cellX + cellSize - 4)
            .attr('y2', cellY + section * sectionHeight)
            .attr('stroke', 'rgba(150, 180, 220, 0.5)')
            .attr('stroke-width', 0.7);
        }

        // Adicionar valores individuais em cada seção com cores
        if (user.dailyDetails && user.dailyDetails[col]) {
          const details = user.dailyDetails[col];
          const metricValues = [
            details.commits,
            details.prs_created,
            details.prs_closed,
            details.issues_created,
            details.issues_closed,
            details.comments,
          ];
          const metricColorKeys = [
            'commits',
            'prs_created',
            'prs_closed',
            'issues_created',
            'issues_closed',
            'comments',
          ] as const;

          // Mostrar valor em cada seção se for > 0 (centralizado)
          metricValues.forEach((metricValue, sectionIdx) => {
            if (metricValue > 0) {
              const sectionY = cellY + sectionIdx * sectionHeight;
              const centerY = sectionY + sectionHeight / 2;
              const colorKey = metricColorKeys[sectionIdx];

              g.append('text')
                .attr('x', cellX + (cellSize - 4) / 2)
                .attr('y', centerY)
                .attr('text-anchor', 'middle')
                .attr('dy', '0.35em')
                .attr('font-size', '12px')
                .attr('font-weight', 'bold')
                .attr('fill', metricColors[colorKey])
                .attr('filter', 'url(#textShadow)')
                .style('pointer-events', 'none')
                .text(`${metricValue} ${metricColorKeys[sectionIdx].replace('_', ' ').replace('s ', '(s) ')}`);
            }
          });
        }
      }
    }
  }, [userData, mode, cellSize, margin, colorScheme, dateLabels]);

  return (
    <div 
      className="calendar-heatmap-container"
      style={{
        width: '100%',
        overflowX: 'auto',
        overflowY: 'hidden',
        flexShrink: 0,
      }}
    >
      <svg ref={svgRef} style={{ display: 'block', minWidth: '100%' }}></svg>
    </div>
  );
};

export default CalendarHeatmap;
