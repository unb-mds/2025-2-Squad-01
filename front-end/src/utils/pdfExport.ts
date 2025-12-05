import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export interface PDFExportOptions {
  repoName: string;
  startDate?: string;
  endDate?: string;
  includeSections: {
    overview: boolean;
    members: boolean;
    commits: boolean;
    issues: boolean;
    prs: boolean;
    collaboration: boolean;
  };
}

export interface RepositoryData {
  name: string;
  description?: string;
  stats: {
    totalCommits: number;
    totalIssues: number;
    totalPRs: number;
    totalMembers: number;
    createdAt: string;
    updatedAt: string;
  };
  members?: Array<{
    login: string;
    commits: number;
    issues: number;
    prs: number;
    contributions: number;
  }>;
  commits?: Array<{
    author: string;
    message: string;
    date: string;
    additions: number;
    deletions: number;
  }>;
  issues?: Array<{
    title: string;
    author: string;
    state: string;
    createdAt: string;
    closedAt?: string;
  }>;
  pullRequests?: Array<{
    title: string;
    author: string;
    state: string;
    createdAt: string;
    mergedAt?: string;
  }>;
}

export class PDFExporter {
  private pdf: jsPDF;
  private pageHeight: number;
  private pageWidth: number;
  private margin: number;
  private currentY: number;
  private lineHeight: number;

  constructor() {
    this.pdf = new jsPDF('p', 'mm', 'a4');
    this.pageHeight = this.pdf.internal.pageSize.getHeight();
    this.pageWidth = this.pdf.internal.pageSize.getWidth();
    this.margin = 15;
    this.currentY = this.margin;
    this.lineHeight = 7;
  }

  private addNewPageIfNeeded(requiredSpace: number = 20): void {
    if (this.currentY + requiredSpace > this.pageHeight - this.margin) {
      this.pdf.addPage();
      this.currentY = this.margin;
    }
  }

  private addTitle(text: string, fontSize: number = 20): void {
    this.addNewPageIfNeeded(15);
    this.pdf.setFontSize(fontSize);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text(text, this.margin, this.currentY);
    this.currentY += fontSize / 2;
  }

  private addSubtitle(text: string): void {
    this.addNewPageIfNeeded(10);
    this.pdf.setFontSize(14);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text(text, this.margin, this.currentY);
    this.currentY += 10;
  }

  private addText(text: string, fontSize: number = 10, bold: boolean = false): void {
    this.addNewPageIfNeeded();
    this.pdf.setFontSize(fontSize);
    this.pdf.setFont('helvetica', bold ? 'bold' : 'normal');
    
    // Quebra de linha automática
    const maxWidth = this.pageWidth - (this.margin * 2);
    const lines = this.pdf.splitTextToSize(text, maxWidth);
    
    lines.forEach((line: string) => {
      this.addNewPageIfNeeded();
      this.pdf.text(line, this.margin, this.currentY);
      this.currentY += this.lineHeight;
    });
  }

  private addSeparator(): void {
    this.addNewPageIfNeeded();
    this.pdf.setLineWidth(0.5);
    this.pdf.line(this.margin, this.currentY, this.pageWidth - this.margin, this.currentY);
    this.currentY += 5;
  }

  private addTable(headers: string[], rows: string[][], columnWidths?: number[]): void {
    // Calcular larguras das colunas
    const totalWidth = this.pageWidth - (this.margin * 2);
    const colWidths = columnWidths || headers.map(() => totalWidth / headers.length);
    const rowHeight = 8;
    const fontSize = 8;

    // Header
    this.addNewPageIfNeeded(rowHeight * 2);
    this.pdf.setFontSize(fontSize);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.setFillColor(41, 128, 185);
    this.pdf.setTextColor(255, 255, 255);
    this.pdf.rect(this.margin, this.currentY, totalWidth, rowHeight, 'F');
    
    let xPos = this.margin;
    headers.forEach((header, i) => {
      this.pdf.text(header, xPos + 2, this.currentY + 6, {
        maxWidth: colWidths[i] - 4
      });
      xPos += colWidths[i];
    });
    this.currentY += rowHeight;

    // Rows
    this.pdf.setFont('helvetica', 'normal');
    this.pdf.setTextColor(0, 0, 0);
    
    rows.forEach((row, rowIndex) => {
      this.addNewPageIfNeeded(rowHeight);
      
      if (rowIndex % 2 === 0) {
        this.pdf.setFillColor(245, 245, 245);
        this.pdf.rect(this.margin, this.currentY, totalWidth, rowHeight, 'F');
      }
      
      xPos = this.margin;
      row.forEach((cell, colIndex) => {
        // Usar maxWidth para truncar automaticamente
        this.pdf.text(cell, xPos + 2, this.currentY + 6, {
          maxWidth: colWidths[colIndex] - 4
        });
        xPos += colWidths[colIndex];
      });
      
      this.currentY += rowHeight;
    });

    this.currentY += 5;
  }

  private addStatCard(label: string, value: string | number, color: [number, number, number]): void {
    const cardWidth = 40;
    const cardHeight = 20;

    this.pdf.setFillColor(...color);
    this.pdf.roundedRect(this.margin, this.currentY, cardWidth, cardHeight, 2, 2, 'F');
    
    this.pdf.setTextColor(255, 255, 255);
    this.pdf.setFontSize(10);
    this.pdf.setFont('helvetica', 'normal');
    this.pdf.text(label, this.margin + 2, this.currentY + 8);
    
    this.pdf.setFontSize(16);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text(value.toString(), this.margin + 2, this.currentY + 16);
    
    this.pdf.setTextColor(0, 0, 0);
  }

  private addStatsRow(stats: Array<{ label: string; value: string | number; color: [number, number, number] }>): void {
    this.addNewPageIfNeeded(25);
    
    const cardWidth = 40;
    const gap = 5;
    let xPos = this.margin;

    stats.forEach((stat) => {
      if (xPos + cardWidth > this.pageWidth - this.margin) {
        this.currentY += 25;
        xPos = this.margin;
        this.addNewPageIfNeeded(25);
      }

      this.pdf.setFillColor(...stat.color);
      this.pdf.roundedRect(xPos, this.currentY, cardWidth, 20, 2, 2, 'F');
      
      this.pdf.setTextColor(255, 255, 255);
      this.pdf.setFontSize(8);
      this.pdf.setFont('helvetica', 'normal');
      this.pdf.text(stat.label, xPos + 2, this.currentY + 8);
      
      this.pdf.setFontSize(14);
      this.pdf.setFont('helvetica', 'bold');
      this.pdf.text(stat.value.toString(), xPos + 2, this.currentY + 16);
      
      xPos += cardWidth + gap;
    });

    this.pdf.setTextColor(0, 0, 0);
    this.currentY += 30;
  }

  private formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  async generateRepositoryReport(data: RepositoryData, options: PDFExportOptions): Promise<void> {
    // Capa
    this.addTitle('Relatorio de Repositorio', 24);
    this.currentY += 10;
    this.addTitle(data.name, 18);
    this.currentY += 5;
    
    if (data.description) {
      this.addText(data.description, 11);
    }
    
    this.currentY += 10;
    this.addText(`Periodo: ${options.startDate ? this.formatDate(options.startDate) : 'Inicio'} ate ${options.endDate ? this.formatDate(options.endDate) : 'Hoje'}`, 10, true);
    this.addText(`Gerado em: ${this.formatDate(new Date().toISOString())}`, 10);
    
    this.currentY += 20;
    this.addSeparator();

    // Overview
    if (options.includeSections.overview) {
      this.addSubtitle('Visao Geral');
      
      this.addStatsRow([
        { label: 'Total Commits', value: data.stats.totalCommits, color: [52, 152, 219] },
        { label: 'Total Issues', value: data.stats.totalIssues, color: [155, 89, 182] },
        { label: 'Total PRs', value: data.stats.totalPRs, color: [46, 204, 113] },
        { label: 'Membros', value: data.stats.totalMembers, color: [241, 196, 15] }
      ]);

      this.addText(`Criado em: ${this.formatDate(data.stats.createdAt)}`, 10);
      this.addText(`Última atualização: ${this.formatDate(data.stats.updatedAt)}`, 10);
      this.currentY += 10;
      this.addSeparator();
    }

    // Membros
    if (options.includeSections.members && data.members && data.members.length > 0) {
      this.addSubtitle('Atividade dos Membros');
      
      const memberRows = data.members
        .sort((a, b) => b.contributions - a.contributions)
        .slice(0, 20)
        .map(member => [
          member.login,
          member.commits.toString(),
          member.issues.toString(),
          member.prs.toString(),
          member.contributions.toString()
        ]);

      // Larguras: Membro (60mm), Commits (25mm), Issues (25mm), PRs (25mm), Total (25mm)
      this.addTable(
        ['Membro', 'Commits', 'Issues', 'PRs', 'Total'],
        memberRows,
        [60, 25, 25, 25, 25]
      );
      
      this.addSeparator();
    }

    // Commits
    if (options.includeSections.commits && data.commits && data.commits.length > 0) {
      this.addSubtitle('Commits Recentes');
      
      const commitRows = data.commits.slice(0, 15).map(commit => [
        commit.author,
        commit.message.substring(0, 40) + (commit.message.length > 40 ? '...' : ''),
        this.formatDate(commit.date),
        `+${commit.additions}/-${commit.deletions}`
      ]);

      // Larguras: Autor (35mm), Mensagem (75mm), Data (30mm), Mudanças (30mm)
      this.addTable(
        ['Autor', 'Mensagem', 'Data', 'Mudancas'],
        commitRows,
        [35, 75, 30, 30]
      );
      
      this.addSeparator();
    }

    // Issues
    if (options.includeSections.issues && data.issues && data.issues.length > 0) {
      this.addSubtitle('Issues');
      
      const issueRows = data.issues.slice(0, 15).map(issue => [
        issue.title.substring(0, 35) + (issue.title.length > 35 ? '...' : ''),
        issue.author,
        issue.state === 'closed' ? 'Fechada' : 'Aberta',
        this.formatDate(issue.createdAt)
      ]);

      // Larguras: Título (80mm), Autor (35mm), Status (25mm), Data (30mm)
      this.addTable(
        ['Titulo', 'Autor', 'Status', 'Data'],
        issueRows,
        [80, 35, 25, 30]
      );
      
      this.addSeparator();
    }

    // Pull Requests
    if (options.includeSections.prs && data.pullRequests && data.pullRequests.length > 0) {
      this.addSubtitle('Pull Requests');
      
      const prRows = data.pullRequests.slice(0, 15).map(pr => [
        pr.title.substring(0, 35) + (pr.title.length > 35 ? '...' : ''),
        pr.author,
        pr.state === 'merged' ? 'Merged' : pr.state === 'closed' ? 'Fechado' : 'Aberto',
        this.formatDate(pr.createdAt)
      ]);

      // Larguras: Título (80mm), Autor (35mm), Status (25mm), Data (30mm)
      this.addTable(
        ['Titulo', 'Autor', 'Status', 'Data'],
        prRows,
        [80, 35, 25, 30]
      );
    }

    // Footer em todas as páginas
    const totalPages = this.pdf.internal.pages.length - 1;
    for (let i = 1; i <= totalPages; i++) {
      this.pdf.setPage(i);
      this.pdf.setFontSize(8);
      this.pdf.setTextColor(128, 128, 128);
      this.pdf.text(
        `Página ${i} de ${totalPages}`,
        this.pageWidth / 2,
        this.pageHeight - 10,
        { align: 'center' }
      );
      this.pdf.text(
        `Gerado por Portfolio MDS - ${new Date().toLocaleDateString('pt-BR')}`,
        this.pageWidth / 2,
        this.pageHeight - 5,
        { align: 'center' }
      );
    }
  }

  async captureElementAsPDF(elementId: string, fileName: string): Promise<void> {
    const element = document.getElementById(elementId);
    if (!element) {
      throw new Error(`Element with id "${elementId}" not found`);
    }

    const canvas = await html2canvas(element, {
      scale: 2,
      logging: false,
      useCORS: true
    });

    const imgData = canvas.toDataURL('image/png');
    const imgWidth = this.pageWidth - (this.margin * 2);
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    this.addNewPageIfNeeded(imgHeight);
    this.pdf.addImage(imgData, 'PNG', this.margin, this.currentY, imgWidth, imgHeight);
    this.currentY += imgHeight + 10;
  }

  save(fileName: string): void {
    this.pdf.save(`${fileName}.pdf`);
  }

  getBlob(): Blob {
    return this.pdf.output('blob');
  }
}
