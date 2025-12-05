"""
PDF Data Processor - Silver Layer
Processa dados da camada Bronze e gera JSONs agregados prontos para exportação PDF.
Segue arquitetura Medallion: Bronze → Silver → PDF Export
"""

import json
from pathlib import Path
from datetime import datetime
from typing import Dict, List, Any, Optional
from collections import defaultdict


class PDFDataProcessor:
    """Processa dados para exportação PDF sem processamento no front-end."""
    
    def __init__(self, bronze_dir: str = "data/bronze", output_dir: str = "data/silver/pdf"):
        self.bronze_dir = Path(bronze_dir)
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(parents=True, exist_ok=True)
    
    def process_repository(self, repo_name: str) -> Dict[str, Any]:
        """
        Processa todos os dados de um repositório e gera JSON agregado.
        
        Args:
            repo_name: Nome do repositório (ex: "2025-2-Squad-01")
        
        Returns:
            Dict com dados agregados prontos para PDF
        """
        print(f"📊 Processando dados para PDF: {repo_name}")
        
        # Carregar dados brutos
        commits = self._load_bronze_file(f"commits_{repo_name}.json")
        issues = self._load_bronze_file(f"issues_{repo_name}.json")
        prs = self._load_bronze_file(f"prs_{repo_name}.json")
        repo_info = self._load_bronze_file(f"repo_{repo_name}.json")
        
        # Processar commits por autor
        commits_by_author = self._aggregate_commits_by_author(commits)
        
        # Processar issues por autor
        issues_by_author = self._aggregate_issues_by_author(issues)
        
        # Processar PRs por autor
        prs_by_author = self._aggregate_prs_by_author(prs)
        
        # Consolidar membros
        members = self._consolidate_members(
            commits_by_author, 
            issues_by_author, 
            prs_by_author
        )
        
        # Preparar dados agregados
        aggregated_data = {
            "_metadata": {
                "repo_name": repo_name,
                "processed_at": datetime.now().isoformat(),
                "processor": "pdf_data_processor.py",
                "layer": "silver"
            },
            "repository": {
                "name": repo_name,
                "description": repo_info.get("description", ""),
                "created_at": repo_info.get("created_at", ""),
                "updated_at": repo_info.get("updated_at", ""),
                "language": repo_info.get("language", ""),
                "license": repo_info.get("license", {}).get("name", "") if isinstance(repo_info.get("license"), dict) else ""
            },
            "stats": {
                "total_commits": len(commits),
                "total_issues": len(issues),
                "total_prs": len(prs),
                "total_members": len(members)
            },
            "members": members,
            "recent_commits": self._format_recent_commits(commits[:50]),
            "recent_issues": self._format_recent_issues(issues[:50]),
            "recent_prs": self._format_recent_prs(prs[:50])
        }
        
        # Salvar JSON processado
        output_file = self.output_dir / f"pdf_data_{repo_name}.json"
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(aggregated_data, f, indent=2, ensure_ascii=False)
        
        print(f"✅ Dados processados salvos em: {output_file}")
        return aggregated_data
    
    def _load_bronze_file(self, filename: str) -> List[Dict]:
        """Carrega arquivo JSON da camada Bronze."""
        file_path = self.bronze_dir / filename
        
        if not file_path.exists():
            print(f"⚠️  Arquivo não encontrado: {filename}")
            return []
        
        with open(file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        # Remover metadata se existir
        if isinstance(data, list) and len(data) > 0:
            if isinstance(data[0], dict) and "_metadata" in data[0]:
                data = data[1:]  # Skip metadata
        
        return data
    
    def _aggregate_commits_by_author(self, commits: List[Dict]) -> Dict[str, int]:
        """Agrega commits por autor."""
        commits_by_author = defaultdict(int)
        
        for commit in commits:
            # Extrair autor (ordem de prioridade)
            author = (
                commit.get("author", {}).get("login") or
                commit.get("commit", {}).get("author", {}).get("login") or
                commit.get("commit", {}).get("author", {}).get("name") or
                commit.get("author", {}).get("name") or
                "Unknown"
            )
            commits_by_author[author] += 1
        
        return dict(commits_by_author)
    
    def _aggregate_issues_by_author(self, issues: List[Dict]) -> Dict[str, int]:
        """Agrega issues por autor."""
        issues_by_author = defaultdict(int)
        
        for issue in issues:
            author = issue.get("user", {}).get("login", "Unknown")
            issues_by_author[author] += 1
        
        return dict(issues_by_author)
    
    def _aggregate_prs_by_author(self, prs: List[Dict]) -> Dict[str, int]:
        """Agrega PRs por autor."""
        prs_by_author = defaultdict(int)
        
        for pr in prs:
            author = pr.get("user", {}).get("login", "Unknown")
            prs_by_author[author] += 1
        
        return dict(prs_by_author)
    
    def _consolidate_members(
        self, 
        commits_by_author: Dict[str, int],
        issues_by_author: Dict[str, int],
        prs_by_author: Dict[str, int]
    ) -> List[Dict[str, Any]]:
        """Consolida estatísticas de todos os membros."""
        all_authors = set(
            list(commits_by_author.keys()) +
            list(issues_by_author.keys()) +
            list(prs_by_author.keys())
        )
        
        members = []
        for author in all_authors:
            commits = commits_by_author.get(author, 0)
            issues = issues_by_author.get(author, 0)
            prs = prs_by_author.get(author, 0)
            
            members.append({
                "login": author,
                "commits": commits,
                "issues": issues,
                "prs": prs,
                "total_contributions": commits + issues + prs
            })
        
        # Ordenar por contribuições (maior para menor)
        members.sort(key=lambda x: x["total_contributions"], reverse=True)
        
        return members
    
    def _format_recent_commits(self, commits: List[Dict]) -> List[Dict]:
        """Formata commits recentes para exibição no PDF."""
        formatted = []
        
        for commit in commits:
            # Extrair autor
            author = (
                commit.get("author", {}).get("login") or
                commit.get("commit", {}).get("author", {}).get("name") or
                "Unknown"
            )
            
            # Extrair mensagem
            message = commit.get("commit", {}).get("message", "")
            
            # Extrair data
            date = (
                commit.get("commit", {}).get("author", {}).get("date") or
                commit.get("created_at", "")
            )
            
            # Extrair mudanças
            additions = commit.get("additions", 0) or commit.get("stats", {}).get("additions", 0)
            deletions = commit.get("deletions", 0) or commit.get("stats", {}).get("deletions", 0)
            
            formatted.append({
                "author": author,
                "message": message,
                "date": date,
                "additions": additions,
                "deletions": deletions
            })
        
        return formatted
    
    def _format_recent_issues(self, issues: List[Dict]) -> List[Dict]:
        """Formata issues recentes para exibição no PDF."""
        formatted = []
        
        for issue in issues:
            formatted.append({
                "number": issue.get("number", 0),
                "title": issue.get("title", ""),
                "author": issue.get("user", {}).get("login", "Unknown"),
                "state": issue.get("state", "open"),
                "created_at": issue.get("created_at", ""),
                "closed_at": issue.get("closed_at")
            })
        
        return formatted
    
    def _format_recent_prs(self, prs: List[Dict]) -> List[Dict]:
        """Formata PRs recentes para exibição no PDF."""
        formatted = []
        
        for pr in prs:
            # Determinar estado
            if pr.get("merged_at"):
                state = "merged"
            else:
                state = pr.get("state", "open")
            
            formatted.append({
                "number": pr.get("number", 0),
                "title": pr.get("title", ""),
                "author": pr.get("user", {}).get("login", "Unknown"),
                "state": state,
                "created_at": pr.get("created_at", ""),
                "merged_at": pr.get("merged_at")
            })
        
        return formatted
    
    def process_all_repositories(self):
        """Processa todos os repositórios encontrados na camada Bronze."""
        # Encontrar todos os arquivos de commits
        commit_files = list(self.bronze_dir.glob("commits_*.json"))
        
        print(f"\n📦 Encontrados {len(commit_files)} repositórios para processar\n")
        
        for commit_file in commit_files:
            # Extrair nome do repositório
            repo_name = commit_file.stem.replace("commits_", "")
            
            try:
                self.process_repository(repo_name)
            except Exception as e:
                print(f"❌ Erro ao processar {repo_name}: {e}")
        
        print(f"\n✅ Processamento concluído! Arquivos salvos em: {self.output_dir}")


def main():
    """Função principal para execução standalone."""
    processor = PDFDataProcessor()
    processor.process_all_repositories()


if __name__ == "__main__":
    main()
