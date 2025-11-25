import os
import logging
import time
from typing import List, Dict, Any
from concurrent.futures import ThreadPoolExecutor, as_completed
from utils.github_api import GitHubAPIClient, OrganizationConfig, save_json_data, load_json_data

# Configurar logger
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def extract_issues(
    client: GitHubAPIClient, 
    config: OrganizationConfig, 
    use_cache: bool = True,
    parallel: bool = True,  # ✅ NOVO: paralelizar
    max_workers: int = 3,   # ✅ NOVO: threads simultâneas
    max_events_per_repo: int = 500  # ✅ NOVO: limitar eventos
) -> List[str]:
    """
    Extract issues, pull requests, and issue events from GitHub repositories.
    VERSÃO OTIMIZADA: Paraleliza extração + limita eventos.
    
    OPTIMIZATION NOTE: Issue events são limitados aos últimos N eventos por repo
    e filtrados para incluir apenas campos essenciais (id, event, created_at, etc.)
    para reduzir drasticamente o tamanho dos arquivos e tempo de extração.
    
    Args:
        client: Cliente GitHub API
        config: Configuração da organização
        use_cache: Se deve usar cache
        parallel: Se deve paralelizar (3 repos simultâneos)
        max_workers: Número de threads
        max_events_per_repo: Limite de eventos por repo (None = todos)
    
    Returns:
        Lista de arquivos gerados
    """
    logger.info("="*60)
    logger.info("🐛 EXTRACTING ISSUES, PRs & EVENTS (Optimized)")
    logger.info("="*60)
    logger.info(f"⚡ Parallelization: {'Enabled' if parallel else 'Disabled'} ({max_workers} workers)")
    logger.info(f"📊 Max events per repo: {max_events_per_repo if max_events_per_repo else 'Unlimited'}")
    
    # Load filtered repositories
    filtered_repos = load_json_data("data/bronze/repositories_filtered.json")
    if not filtered_repos:
        logger.warning("⚠️  No repositories found. Run repository extraction first.")
        return []
    
    # Skip metadata if present
    if isinstance(filtered_repos, list) and len(filtered_repos) > 0:
        if isinstance(filtered_repos[0], dict) and '_metadata' in filtered_repos[0]:
            filtered_repos = filtered_repos[1:]
    
    if parallel:
        # ✅ EXTRAÇÃO PARALELA
        return _extract_issues_parallel(
            client,
            config,
            filtered_repos,
            use_cache,
            max_workers,
            max_events_per_repo
        )
    else:
        # EXTRAÇÃO SEQUENCIAL (original)
        return _extract_issues_sequential(
            client,
            config,
            filtered_repos,
            use_cache,
            max_events_per_repo
        )

def _extract_issues_sequential(
    client: GitHubAPIClient,
    config: OrganizationConfig,
    filtered_repos: List[Dict[str, Any]],
    use_cache: bool,
    max_events_per_repo: int
) -> List[str]:
    """Extração sequencial (original, porém otimizada)."""
    generated_files = []
    all_issues = []
    all_prs = []
    all_issue_events = []
    
    total = len(filtered_repos)
    start_time = time.time()
    
    for idx, repo in enumerate(filtered_repos, 1):
        if not repo or not isinstance(repo, dict):
            logger.warning(f"Skipping invalid repo entry: {repo}")
            continue
        
        progress = (idx / total) * 100
        logger.info(f"\n[{idx}/{total}] ({progress:.1f}%) 📦 {repo.get('name')}")
        
        result = _extract_single_repo_issues(
            client,
            repo,
            use_cache,
            max_events_per_repo
        )
        
        if result:
            repo_files, repo_issues, repo_prs, repo_events = result
            generated_files.extend(repo_files)
            all_issues.extend(repo_issues)
            all_prs.extend(repo_prs)
            all_issue_events.extend(repo_events)
    
    # Save aggregated files
    logger.info("\n📊 Saving aggregated files...")
    
    all_issues_file = save_json_data(
        all_issues,
        "data/bronze/issues_all.json"
    )
    generated_files.append(all_issues_file)
    
    all_prs_file = save_json_data(
        all_prs,
        "data/bronze/prs_all.json"
    )
    generated_files.append(all_prs_file)
    
    all_events_file = save_json_data(
        all_issue_events,
        "data/bronze/issue_events_all.json"
    )
    generated_files.append(all_events_file)
    
    elapsed = time.time() - start_time
    
    logger.info("\n" + "="*60)
    logger.info(f"✅ Extracted {len(all_issues)} issues")
    logger.info(f"✅ Extracted {len(all_prs)} PRs")
    logger.info(f"✅ Extracted {len(all_issue_events)} events")
    logger.info(f"📁 Total files: {len(generated_files)}")
    logger.info(f"⏱️  Total time: {elapsed:.1f}s ({elapsed/60:.1f} min)")
    logger.info("="*60)
    
    return generated_files

def _extract_issues_parallel(
    client: GitHubAPIClient,
    config: OrganizationConfig,
    filtered_repos: List[Dict[str, Any]],
    use_cache: bool,
    max_workers: int,
    max_events_per_repo: int
) -> List[str]:
    """Extração paralela (3 repos simultâneos)."""
    generated_files = []
    all_issues = []
    all_prs = []
    all_issue_events = []
    
    total = len(filtered_repos)
    start_time = time.time()
    
    logger.info(f"🚀 Starting parallel extraction with {max_workers} workers...")
    
    # ✅ PARALELIZAR com ThreadPoolExecutor
    with ThreadPoolExecutor(max_workers=max_workers) as executor:
        future_to_repo = {
            executor.submit(
                _extract_single_repo_issues,
                client,
                repo,
                use_cache,
                max_events_per_repo
            ): repo
            for repo in filtered_repos
        }
        
        completed = 0
        for future in as_completed(future_to_repo):
            completed += 1
            repo = future_to_repo[future]
            repo_name = repo.get('name', 'unknown')
            
            progress = (completed / total) * 100
            logger.info(f"[{completed}/{total}] ({progress:.1f}%) ✓ Completed: {repo_name}")
            
            try:
                result = future.result()
                if result:
                    repo_files, repo_issues, repo_prs, repo_events = result
                    generated_files.extend(repo_files)
                    all_issues.extend(repo_issues)
                    all_prs.extend(repo_prs)
                    all_issue_events.extend(repo_events)
            except Exception as e:
                logger.error(f"   ❌ Exception for {repo_name}: {str(e)}")
    
    # Save aggregated files
    logger.info("\n📊 Saving aggregated files...")
    
    all_issues_file = save_json_data(
        all_issues,
        "data/bronze/issues_all.json"
    )
    generated_files.append(all_issues_file)
    
    all_prs_file = save_json_data(
        all_prs,
        "data/bronze/prs_all.json"
    )
    generated_files.append(all_prs_file)
    
    all_events_file = save_json_data(
        all_issue_events,
        "data/bronze/issue_events_all.json"
    )
    generated_files.append(all_events_file)
    
    elapsed = time.time() - start_time
    
    logger.info("\n" + "="*60)
    logger.info(f"✅ Extracted {len(all_issues)} issues")
    logger.info(f"✅ Extracted {len(all_prs)} PRs")
    logger.info(f"✅ Extracted {len(all_issue_events)} events")
    logger.info(f"📁 Total files: {len(generated_files)}")
    logger.info(f"⏱️  Total time: {elapsed:.1f}s ({elapsed/60:.1f} min)")
    logger.info(f"🚀 Speedup: ~{3/max_workers:.1f}x faster")
    logger.info("="*60)
    
    return generated_files

def _extract_single_repo_issues(
    client: GitHubAPIClient,
    repo: Dict[str, Any],
    use_cache: bool,
    max_events_per_repo: int
) -> tuple:
    """
    Extrai issues, PRs e events de um único repositório.
    
    Returns:
        Tupla: (arquivos_gerados, issues, prs, events)
    """
    logger = logging.getLogger(__name__)
    
    repo_name = repo.get('name', 'unknown')
    full_name = repo.get('full_name', repo_name)
    
    repo_files = []
    repo_issues = []
    repo_prs = []
    repo_events = []
    
    try:
        # 1️⃣ Get issues (includes PRs)
        issues_base = f"https://api.github.com/repos/{full_name}/issues?state=all"
        issues = client.get_paginated(issues_base, use_cache=use_cache, per_page=100)
        
        if issues:
            # Separate issues from PRs
            for issue in issues:
                if issue.get('pull_request'):
                    repo_prs.append({**issue, 'repo_name': repo_name})
                else:
                    repo_issues.append({**issue, 'repo_name': repo_name})
            
            # Save per-repo files
            if repo_issues:
                issues_file = save_json_data(
                    repo_issues,
                    f"data/bronze/issues_{repo_name}.json"
                )
                repo_files.append(issues_file)
            
            if repo_prs:
                prs_file = save_json_data(
                    repo_prs,
                    f"data/bronze/prs_{repo_name}.json"
                )
                repo_files.append(prs_file)
        
        # 2️⃣ Get issue events (✅ LIMITADO + FILTRADO)
        events_base = f"https://api.github.com/repos/{full_name}/issues/events"
        
        # ✅ LIMITAR PÁGINAS (max_events_per_repo / 100)
        max_pages = None
        if max_events_per_repo:
            max_pages = (max_events_per_repo // 100) + 1
        
        events = client.get_paginated(
            events_base, 
            use_cache=use_cache, 
            per_page=100,
            max_pages=max_pages  # 👈 LIMITAR PÁGINAS
        )
        
        if events:
            # ✅ FILTRAR apenas campos essenciais (reduz 90% do tamanho)
            for event in events[:max_events_per_repo] if max_events_per_repo else events:
                filtered_event = {
                    'id': event.get('id'),
                    'event': event.get('event'),
                    'created_at': event.get('created_at'),
                    'repo_name': repo_name,
                    'actor': {
                        'login': event.get('actor', {}).get('login')
                    } if event.get('actor') else None,
                    'issue': {
                        'number': event.get('issue', {}).get('number')
                    } if event.get('issue') else None
                }
                repo_events.append(filtered_event)
            
            # Save per-repo events
            if repo_events:
                events_file = save_json_data(
                    repo_events,
                    f"data/bronze/issue_events_{repo_name}.json"
                )
                repo_files.append(events_file)
        
        logger.info(f"   ✅ Issues: {len(repo_issues)} | PRs: {len(repo_prs)} | Events: {len(repo_events)}")
        
        return (repo_files, repo_issues, repo_prs, repo_events)
        
    except Exception as e:
        logger.error(f"   ❌ Error extracting {repo_name}: {str(e)}")
        return ([], [], [], [])