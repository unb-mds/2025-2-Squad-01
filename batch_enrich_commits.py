"""
Script para enriquecer commits de múltiplos repositórios com estatísticas de adições/deleções.
Processa todos os arquivos de commits na camada bronze que ainda não foram enriquecidos.
"""
import json
import os
import sys
import time
import requests
from pathlib import Path
from typing import Dict, Any, Optional

def load_json(file_path: str) -> Any:
    """Carrega arquivo JSON com encoding UTF-8."""
    with open(file_path, 'r', encoding='utf-8') as f:
        return json.load(f)

def save_json(file_path: str, data: Any) -> None:
    """Salva dados em arquivo JSON com encoding UTF-8."""
    with open(file_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

def fetch_commit_with_stats(owner: str, repo: str, sha: str, token: str) -> Optional[Dict[str, Any]]:
    """
    Busca detalhes de um commit via REST API incluindo stats de adições/deleções.
    
    Args:
        owner: Nome do dono do repositório
        repo: Nome do repositório
        sha: SHA do commit
        token: Token de acesso do GitHub
        
    Returns:
        Dados do commit com stats ou None se falhar
    """
    url = f"https://api.github.com/repos/{owner}/{repo}/commits/{sha}"
    headers = {
        "Authorization": f"token {token}",
        "Accept": "application/vnd.github.v3+json"
    }
    
    try:
        response = requests.get(url, headers=headers, timeout=10)
        if response.status_code == 200:
            return response.json()
        elif response.status_code == 404:
            print(f"    ⚠️  Commit {sha[:7]} not found (possibly from fork)")
            return None
        else:
            print(f"    ❌ Error fetching {sha[:7]}: {response.status_code}")
            return None
    except Exception as e:
        print(f"    ❌ Exception fetching {sha[:7]}: {e}")
        return None

def enrich_commits_file(
    input_file: str,
    output_file: str,
    owner: str,
    repo_name: str,
    token: str
) -> Dict[str, int]:
    """
    Enriquece arquivo de commits com estatísticas de adições/deleções.
    
    Args:
        input_file: Caminho do arquivo de commits original
        output_file: Caminho do arquivo de saída enriquecido
        owner: Nome do dono do repositório
        repo_name: Nome do repositório
        token: Token de acesso do GitHub
        
    Returns:
        Dicionário com estatísticas do processamento
    """
    print(f"\n📂 Processing: {repo_name}")
    
    # Carrega commits existentes
    commits = load_json(input_file)
    if not isinstance(commits, list):
        print(f"  ❌ Invalid format (expected list)")
        return {"total": 0, "enriched": 0, "with_stats": 0, "failed": 0}
    
    total = len(commits)
    enriched = 0
    with_stats = 0
    failed = 0
    
    print(f"  Total commits to process: {total}")
    
    for i, commit in enumerate(commits, 1):
        # Progresso a cada 50 commits
        if i % 50 == 0 or i == total:
            print(f"  Progress: {i}/{total} ({i*100//total}%)")
        
        # Pula se já tem stats
        if 'stats' in commit and commit['stats']:
            with_stats += 1
            continue
            
        sha = commit.get('sha') or commit.get('node_id', '')
        if not sha:
            failed += 1
            continue
        
        # Busca dados completos do commit
        full_commit = fetch_commit_with_stats(owner, repo_name, sha, token)
        
        if full_commit and 'stats' in full_commit:
            commit['stats'] = full_commit['stats']
            enriched += 1
            with_stats += 1
        else:
            failed += 1
        
        # Rate limiting: 0.1s entre requests (~600 req/min)
        time.sleep(0.1)
    
    # Salva arquivo enriquecido
    save_json(output_file, commits)
    
    stats = {
        "total": total,
        "enriched": enriched,
        "with_stats": with_stats,
        "failed": failed
    }
    
    print(f"  ✅ Completed: {with_stats}/{total} commits have stats ({enriched} newly enriched)")
    return stats

def extract_repo_name_from_filename(filename: str) -> Optional[str]:
    """
    Extrai o nome do repositório do nome do arquivo.
    
    Args:
        filename: Nome do arquivo (ex: commits_2025-2-Squad-01.json)
        
    Returns:
        Nome do repositório (ex: 2025-2-Squad-01) ou None
    """
    if not filename.startswith('commits_') or not filename.endswith('.json'):
        return None
    
    # Remove prefixo e sufixo
    repo_name = filename[8:-5]  # Remove 'commits_' e '.json'
    
    # Ignora arquivos especiais
    if repo_name in ['all', 'carlarocha'] or '_with_stats' in repo_name or '_graphql' in repo_name:
        return None
        
    return repo_name

def main():
    """Processa todos os arquivos de commits no diretório bronze."""
    import argparse
    
    parser = argparse.ArgumentParser(description='Batch enrich commits with stats')
    parser.add_argument('--token', required=True, help='GitHub token')
    parser.add_argument('--owner', default='unb-mds', help='Repository owner')
    parser.add_argument('--bronze-dir', default='data/bronze', help='Bronze directory path')
    parser.add_argument('--max-repos', type=int, help='Maximum number of repos to process')
    
    args = parser.parse_args()
    
    bronze_dir = Path(args.bronze_dir)
    if not bronze_dir.exists():
        print(f"❌ Bronze directory not found: {bronze_dir}")
        return 1
    
    # Lista todos os arquivos de commits
    commit_files = list(bronze_dir.glob('commits_*.json'))
    
    # Filtra apenas arquivos que ainda não foram enriquecidos
    repos_to_process = []
    for commit_file in commit_files:
        repo_name = extract_repo_name_from_filename(commit_file.name)
        if repo_name:
            # Verifica se já existe arquivo _with_stats
            output_file = bronze_dir / f"commits_{repo_name}_with_stats.json"
            if not output_file.exists():
                repos_to_process.append((repo_name, commit_file, output_file))
    
    total_repos = len(repos_to_process)
    
    if args.max_repos:
        repos_to_process = repos_to_process[:args.max_repos]
        print(f"⚠️  Limiting to {args.max_repos} repositories")
    
    print(f"\n{'='*60}")
    print(f"BATCH COMMIT ENRICHMENT")
    print(f"{'='*60}")
    print(f"Total repositories to enrich: {len(repos_to_process)}/{total_repos}")
    print(f"Owner: {args.owner}")
    print(f"{'='*60}\n")
    
    if not repos_to_process:
        print("✅ All repositories already enriched!")
        return 0
    
    # Estatísticas globais
    global_stats = {
        "repos_processed": 0,
        "repos_failed": 0,
        "total_commits": 0,
        "total_enriched": 0,
        "total_with_stats": 0
    }
    
    start_time = time.time()
    
    for i, (repo_name, input_file, output_file) in enumerate(repos_to_process, 1):
        print(f"\n[{i}/{len(repos_to_process)}] Repository: {repo_name}")
        
        try:
            stats = enrich_commits_file(
                str(input_file),
                str(output_file),
                args.owner,
                repo_name,
                args.token
            )
            
            global_stats["repos_processed"] += 1
            global_stats["total_commits"] += stats["total"]
            global_stats["total_enriched"] += stats["enriched"]
            global_stats["total_with_stats"] += stats["with_stats"]
            
        except Exception as e:
            print(f"  ❌ Failed to process {repo_name}: {e}")
            global_stats["repos_failed"] += 1
    
    elapsed = time.time() - start_time
    
    # Relatório final
    print(f"\n{'='*60}")
    print(f"BATCH PROCESSING COMPLETE")
    print(f"{'='*60}")
    print(f"Repositories processed: {global_stats['repos_processed']}")
    print(f"Repositories failed: {global_stats['repos_failed']}")
    print(f"Total commits: {global_stats['total_commits']}")
    print(f"Newly enriched: {global_stats['total_enriched']}")
    print(f"With stats: {global_stats['total_with_stats']}")
    print(f"Time elapsed: {elapsed:.1f}s ({elapsed/60:.1f} minutes)")
    print(f"{'='*60}\n")
    
    return 0

if __name__ == "__main__":
    sys.exit(main())
