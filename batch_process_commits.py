"""
Script para processar commits enriquecidos de múltiplos repositórios.
Gera dados agregados por autor e semana para cada repositório.
"""
import json
import os
import sys
from pathlib import Path
from datetime import datetime
from collections import defaultdict
from typing import Dict, Any, List

def load_json(file_path: str) -> Any:
    """Carrega arquivo JSON com encoding UTF-8."""
    with open(file_path, 'r', encoding='utf-8') as f:
        return json.load(f)

def save_json(file_path: str, data: Any) -> None:
    """Salva dados em arquivo JSON com encoding UTF-8."""
    with open(file_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

def get_week_key(date_str: str) -> str:
    """
    Converte data ISO para chave de semana (YYYY-Www).
    
    Args:
        date_str: Data em formato ISO (ex: 2024-10-15T10:30:00Z)
        
    Returns:
        Chave da semana (ex: 2024-W42)
    """
    try:
        dt = datetime.fromisoformat(date_str.replace('Z', '+00:00'))
        iso_calendar = dt.isocalendar()
        return f"{iso_calendar[0]}-W{iso_calendar[1]:02d}"
    except:
        return "unknown"

def process_repo_commits(input_file: str, output_file: str, repo_name: str) -> Dict[str, Any]:
    """
    Processa commits de um repositório e gera dados agregados por autor.
    
    Args:
        input_file: Arquivo de commits enriquecidos
        output_file: Arquivo de saída com dados processados
        repo_name: Nome do repositório
        
    Returns:
        Estatísticas do processamento
    """
    print(f"\n📊 Processing: {repo_name}")
    
    commits = load_json(input_file)
    
    if not isinstance(commits, list):
        print(f"  ❌ Invalid format")
        return {"commits": 0, "authors": 0}
    
    # Agrupa por autor e semana
    author_data = defaultdict(lambda: defaultdict(lambda: {
        'commits': 0,
        'additions': 0,
        'deletions': 0,
        'total_lines': 0
    }))
    
    total_commits = 0
    commits_with_stats = 0
    
    for commit in commits:
        # Extrai autor
        author = "Unknown"
        if commit.get('commit', {}).get('author', {}).get('name'):
            author = commit['commit']['author']['name']
        elif commit.get('author', {}).get('login'):
            author = commit['author']['login']
        
        # Extrai data
        date_str = commit.get('commit', {}).get('author', {}).get('date', '')
        week = get_week_key(date_str)
        
        # Extrai estatísticas
        stats = commit.get('stats', {})
        additions = stats.get('additions', 0)
        deletions = stats.get('deletions', 0)
        
        if stats:
            commits_with_stats += 1
        
        # Agrega dados
        author_data[author][week]['commits'] += 1
        author_data[author][week]['additions'] += additions
        author_data[author][week]['deletions'] += deletions
        
        total_commits += 1
    
    # Converte para formato final com totais cumulativos
    result = []
    
    for author, weeks in author_data.items():
        # Ordena semanas cronologicamente
        sorted_weeks = sorted(weeks.items())
        
        cumulative_total = 0
        author_commits = []
        
        for week, data in sorted_weeks:
            cumulative_total += (data['additions'] - data['deletions'])
            
            author_commits.append({
                'week': week,
                'commits': data['commits'],
                'additions': data['additions'],
                'deletions': data['deletions'],
                'total_lines': cumulative_total,
                'changes_per_commit': (data['additions'] + data['deletions']) / data['commits'] if data['commits'] > 0 else 0
            })
        
        # Calcula totais do autor
        total_additions = sum(w['additions'] for w in author_commits)
        total_deletions = sum(w['deletions'] for w in author_commits)
        total_commits_author = sum(w['commits'] for w in author_commits)
        
        result.append({
            'author': author,
            'total_commits': total_commits_author,
            'total_additions': total_additions,
            'total_deletions': total_deletions,
            'final_total_lines': cumulative_total,
            'weeks': author_commits
        })
    
    # Ordena por número de commits (decrescente)
    result.sort(key=lambda x: x['total_commits'], reverse=True)
    
    # Salva resultado
    save_json(output_file, result)
    
    stats = {
        "commits": total_commits,
        "commits_with_stats": commits_with_stats,
        "authors": len(result)
    }
    
    print(f"  ✅ Processed: {total_commits} commits, {len(result)} authors, {commits_with_stats} with stats")
    
    return stats

def extract_repo_name_from_filename(filename: str) -> str:
    """Extrai nome do repo do arquivo _with_stats.json"""
    if not filename.startswith('commits_') or not filename.endswith('_with_stats.json'):
        return None
    
    # Remove 'commits_' e '_with_stats.json'
    return filename[8:-16]

def main():
    """Processa todos os repositórios enriquecidos."""
    import argparse
    
    parser = argparse.ArgumentParser(description='Batch process enriched commits')
    parser.add_argument('--bronze-dir', default='data/bronze', help='Bronze directory')
    parser.add_argument('--output-dir', default='front-end/public', help='Output directory')
    parser.add_argument('--max-repos', type=int, help='Max repos to process')
    
    args = parser.parse_args()
    
    bronze_dir = Path(args.bronze_dir)
    output_dir = Path(args.output_dir)
    
    if not bronze_dir.exists():
        print(f"❌ Bronze directory not found: {bronze_dir}")
        return 1
    
    output_dir.mkdir(parents=True, exist_ok=True)
    
    # Lista todos os arquivos _with_stats.json
    enriched_files = list(bronze_dir.glob('commits_*_with_stats.json'))
    
    repos_to_process = []
    for enriched_file in enriched_files:
        repo_name = extract_repo_name_from_filename(enriched_file.name)
        if repo_name:
            output_file = output_dir / f"commits_by_author_{repo_name}.json"
            repos_to_process.append((repo_name, enriched_file, output_file))
    
    if args.max_repos:
        repos_to_process = repos_to_process[:args.max_repos]
    
    print(f"\n{'='*60}")
    print(f"BATCH COMMITS PROCESSING")
    print(f"{'='*60}")
    print(f"Repositories to process: {len(repos_to_process)}")
    print(f"Output directory: {output_dir}")
    print(f"{'='*60}\n")
    
    if not repos_to_process:
        print("⚠️  No enriched files found to process")
        return 0
    
    # Estatísticas globais
    global_stats = {
        "repos_processed": 0,
        "total_commits": 0,
        "total_authors": 0,
        "repos_failed": 0
    }
    
    for i, (repo_name, input_file, output_file) in enumerate(repos_to_process, 1):
        print(f"[{i}/{len(repos_to_process)}] {repo_name}")
        
        try:
            stats = process_repo_commits(str(input_file), str(output_file), repo_name)
            
            global_stats["repos_processed"] += 1
            global_stats["total_commits"] += stats["commits"]
            global_stats["total_authors"] += stats["authors"]
            
        except Exception as e:
            print(f"  ❌ Failed: {e}")
            global_stats["repos_failed"] += 1
    
    # Relatório final
    print(f"\n{'='*60}")
    print(f"PROCESSING COMPLETE")
    print(f"{'='*60}")
    print(f"Repositories processed: {global_stats['repos_processed']}")
    print(f"Repositories failed: {global_stats['repos_failed']}")
    print(f"Total commits: {global_stats['total_commits']}")
    print(f"Total authors: {global_stats['total_authors']}")
    print(f"{'='*60}\n")
    
    return 0

if __name__ == "__main__":
    sys.exit(main())
