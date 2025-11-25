import os
import logging
import time
from typing import List, Dict, Any, Optional
from concurrent.futures import ThreadPoolExecutor, as_completed
from utils.github_api import GitHubAPIClient, OrganizationConfig, save_json_data, load_json_data

# Configurar logger
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def extract_commits(
    client: GitHubAPIClient,
    config: OrganizationConfig,
    use_cache: bool = True,
    method: str = "graphql",
    parallel: bool = True,  # ✅ NOVO: paralelizar
    max_workers: int = 3,   # ✅ NOVO: threads simultâneas
    since: Optional[str] = None,
    until: Optional[str] = None,
    max_commits_per_repo: Optional[int] = None,
    page_size: int = 50,
) -> List[str]:
    """
    Extract commits from GitHub repositories.
    VERSÃO OTIMIZADA: Paraleliza extração + usa GraphQL quando possível.
    
    Args:
        client: Cliente GitHub API
        config: Configuração da organização
        use_cache: Se deve usar cache
        method: 'rest' ou 'graphql' (GraphQL é mais rápido)
        parallel: Se deve paralelizar (3 repos simultâneos)
        max_workers: Número de threads
        since: Data inicial (ISO-8601)
        until: Data final (ISO-8601)
        max_commits_per_repo: Limite de commits por repo
        page_size: Tamanho da página para paginação
    
    Returns:
        Lista de arquivos gerados
    """
    logger.info("="*60)
    logger.info(f"💾 EXTRACTING COMMITS (Method: {method.upper()}, Optimized)")
    logger.info("="*60)
    logger.info(f"⚡ Parallelization: {'Enabled' if parallel else 'Disabled'} ({max_workers} workers)")
    logger.info(f"📅 Date range: {since or 'all'} → {until or 'now'}")
    logger.info(f"📊 Max commits per repo: {max_commits_per_repo or 'Unlimited'}")
    
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
        return _extract_commits_parallel(
            client,
            config,
            filtered_repos,
            use_cache,
            method,
            max_workers,
            since,
            until,
            max_commits_per_repo,
            page_size
        )
    else:
        # EXTRAÇÃO SEQUENCIAL (original)
        return _extract_commits_sequential(
            client,
            config,
            filtered_repos,
            use_cache,
            method,
            since,
            until,
            max_commits_per_repo,
            page_size
        )

def _extract_commits_sequential(
    client: GitHubAPIClient,
    config: OrganizationConfig,
    filtered_repos: List[Dict[str, Any]],
    use_cache: bool,
    method: str,
    since: Optional[str],
    until: Optional[str],
    max_commits_per_repo: Optional[int],
    page_size: int
) -> List[str]:
    """Extração sequencial (original, porém otimizada)."""
    generated_files = []
    all_commits: List[Dict[str, Any]] = []
    
    total = len(filtered_repos)
    start_time = time.time()
    
    for idx, repo in enumerate(filtered_repos, 1):
        if not repo or not isinstance(repo, dict):
            logger.warning(f"Skipping invalid repo entry: {repo}")
            continue
        
        progress = (idx / total) * 100
        logger.info(f"\n[{idx}/{total}] ({progress:.1f}%) 📦 {repo.get('name')}")
        
        result = _extract_single_repo_commits(
            client,
            repo,
            use_cache,
            method,
            since,
            until,
            max_commits_per_repo,
            page_size
        )
        
        if result:
            repo_file, repo_commits = result
            generated_files.append(repo_file)
            all_commits.extend(repo_commits)
    
    # Save aggregated file
    logger.info("\n📊 Saving aggregated commits file...")
    all_commits_file = save_json_data(
        all_commits,
        "data/bronze/commits_all.json"
    )
    generated_files.append(all_commits_file)
    
    elapsed = time.time() - start_time
    
    logger.info("\n" + "="*60)
    logger.info(f"✅ Extracted {len(all_commits)} total commits")
    logger.info(f"📁 Total files: {len(generated_files)}")
    logger.info(f"⏱️  Total time: {elapsed:.1f}s ({elapsed/60:.1f} min)")
    logger.info("="*60)
    
    return generated_files

def _extract_commits_parallel(
    client: GitHubAPIClient,
    config: OrganizationConfig,
    filtered_repos: List[Dict[str, Any]],
    use_cache: bool,
    method: str,
    max_workers: int,
    since: Optional[str],
    until: Optional[str],
    max_commits_per_repo: Optional[int],
    page_size: int
) -> List[str]:
    """Extração paralela (3 repos simultâneos)."""
    generated_files = []
    all_commits: List[Dict[str, Any]] = []
    
    total = len(filtered_repos)
    start_time = time.time()
    
    logger.info(f"🚀 Starting parallel extraction with {max_workers} workers...")
    
    # ✅ PARALELIZAR com ThreadPoolExecutor
    with ThreadPoolExecutor(max_workers=max_workers) as executor:
        future_to_repo = {
            executor.submit(
                _extract_single_repo_commits,
                client,
                repo,
                use_cache,
                method,
                since,
                until,
                max_commits_per_repo,
                page_size
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
                    repo_file, repo_commits = result
                    generated_files.append(repo_file)
                    all_commits.extend(repo_commits)
            except Exception as e:
                logger.error(f"   ❌ Exception for {repo_name}: {str(e)}")
    
    # Save aggregated file
    logger.info("\n📊 Saving aggregated commits file...")
    all_commits_file = save_json_data(
        all_commits,
        "data/bronze/commits_all.json"
    )
    generated_files.append(all_commits_file)
    
    elapsed = time.time() - start_time
    
    logger.info("\n" + "="*60)
    logger.info(f"✅ Extracted {len(all_commits)} total commits")
    logger.info(f"📁 Total files: {len(generated_files)}")
    logger.info(f"⏱️  Total time: {elapsed:.1f}s ({elapsed/60:.1f} min)")
    logger.info(f"🚀 Speedup: ~{3/max_workers:.1f}x faster")
    logger.info("="*60)
    
    return generated_files

def _extract_single_repo_commits(
    client: GitHubAPIClient,
    repo: Dict[str, Any],
    use_cache: bool,
    method: str,
    since: Optional[str],
    until: Optional[str],
    max_commits_per_repo: Optional[int],
    page_size: int
) -> Optional[tuple]:
    """
    Extrai commits de um único repositório.
    
    Returns:
        Tupla: (arquivo_gerado, lista_de_commits) ou None se falhou
    """
    logger = logging.getLogger(__name__)
    
    repo_name = repo.get('name', 'unknown')
    full_name = repo.get('full_name', repo_name)
    owner = full_name.split('/')[0] if '/' in full_name else None
    name_only = full_name.split('/')[1] if '/' in full_name else full_name
    
    data_commits: List[Dict[str, Any]] = []
    
    try:
        # ✅ PREFERIR GRAPHQL (mais rápido: 1 request vs N requests)
        if method.lower() == "graphql":
            if not owner:
                logger.warning(f"   ⚠️  Cannot determine owner for GraphQL, falling back to REST")
                return _extract_rest_commits(
                    client, repo, full_name, repo_name, use_cache, since, until, page_size
                )
            
            # GraphQL: busca commits com estatísticas em 1 requisição
            nodes, meta = client.graphql_commit_history(
                owner=owner,
                repo=name_only,
                page_size=page_size,
                max_commits=max_commits_per_repo,
                since=since,
                until=until,
                use_cache=use_cache,
            )

            # Mapear GraphQL → formato REST (compatibilidade downstream)
            for n in nodes:
                sha = n.get('oid')
                author = n.get('author') or {}
                committer = n.get('committer') or {}
                committed_date = n.get('committedDate')
                message = n.get('messageHeadline')
                additions = n.get('additions')
                deletions = n.get('deletions')
                total_changes = (additions or 0) + (deletions or 0) if (additions is not None and deletions is not None) else None

                data_commits.append({
                    'sha': sha,
                    'html_url': n.get('url'),
                    'commit': {
                        'author': {
                            'name': author.get('name'),
                            'email': author.get('email'),
                            'date': author.get('date') or committed_date,
                            'login': (author.get('user') or {}).get('login') if isinstance(author.get('user'), dict) else None,
                        },
                        'committer': {
                            'name': committer.get('name'),
                            'email': committer.get('email'),
                            'date': committer.get('date') or committed_date,
                            'login': (committer.get('user') or {}).get('login') if isinstance(committer.get('user'), dict) else None,
                        },
                        'message': message,
                    },
                    'additions': additions,
                    'deletions': deletions,
                    'total_changes': total_changes,
                    'repo_name': repo_name,
                })

            if not nodes:
                logger.warning(f"   ⚠️  GraphQL returned 0 commits, falling back to REST")
                return _extract_rest_commits(
                    client, repo, full_name, repo_name, use_cache, since, until, page_size
                )
            
            logger.info(f"   ✅ Commits: {len(nodes)} (GraphQL)")
        
        else:
            # REST: busca lista de commits + detalhes individuais (mais lento)
            result = _extract_rest_commits(
                client, repo, full_name, repo_name, use_cache, since, until, page_size
            )
            if result:
                return result
            return None
        
        # Salvar commits do repo
        if data_commits:
            repo_commits_file = save_json_data(
                data_commits,
                f"data/bronze/commits_{repo_name}.json"
            )
            return (repo_commits_file, data_commits)
        
        return None
        
    except Exception as e:
        logger.error(f"   ❌ Error extracting {repo_name}: {str(e)}")
        return None

def _extract_rest_commits(
    client: GitHubAPIClient,
    repo: Dict[str, Any],
    full_name: str,
    repo_name: str,
    use_cache: bool,
    since: Optional[str],
    until: Optional[str],
    page_size: int
) -> Optional[tuple]:
    """
    Extrai commits via REST API (fallback mais lento).
    Faz 1 request para listar + 1 request POR COMMIT para obter estatísticas.
    """
    logger = logging.getLogger(__name__)
    
    data_commits: List[Dict[str, Any]] = []
    
    try:
        # Construir URL com filtros de data
        commits_base = f"https://api.github.com/repos/{full_name}/commits"
        if since or until:
            sep = '&' if ('?' in commits_base) else '?'
            if since:
                commits_base = f"{commits_base}{sep}since={since}"
                sep = '&'
            if until:
                commits_base = f"{commits_base}{sep}until={until}"
        
        # Buscar lista de commits (paginado)
        commits = client.get_paginated(commits_base, use_cache=use_cache, per_page=page_size)
        
        if not commits:
            logger.warning(f"   ⚠️  No commits found via REST")
            return None
        
        # ⚠️ GARGALO: 1 request adicional POR commit para obter stats
        # Limitar a 100 commits para evitar demora excessiva
        commits_to_process = commits[:100] if len(commits) > 100 else commits
        
        for commit in commits_to_process:
            sha = commit.get('sha')
            additions = None
            deletions = None
            total_changes = None
            
            if sha:
                # ⚠️ REQUEST EXTRA (lento)
                details_url = f"https://api.github.com/repos/{full_name}/commits/{sha}"
                details = client.get_with_cache(details_url, use_cache)
                if details and isinstance(details, dict):
                    stats = details.get('stats') or {}
                    additions = stats.get('additions')
                    deletions = stats.get('deletions')
                    total_changes = stats.get('total')
            
            # Garantir que commit.commit.author.login existe
            commit_data = {**commit}
            if 'commit' in commit_data and 'author' in commit_data['commit']:
                if 'author' in commit_data and isinstance(commit_data['author'], dict) and 'login' in commit_data['author']:
                    commit_data['commit']['author']['login'] = commit_data['author']['login']
            
            data_commits.append({
                **commit_data,
                'repo_name': repo_name,
                'additions': additions,
                'deletions': deletions,
                'total_changes': total_changes,
            })
        
        logger.info(f"   ✅ Commits: {len(data_commits)} (REST)")
        
        if data_commits:
            repo_commits_file = save_json_data(
                data_commits,
                f"data/bronze/commits_{repo_name}.json"
            )
            return (repo_commits_file, data_commits)
        
        return None
        
    except Exception as e:
        logger.error(f"   ❌ REST extraction failed: {str(e)}")
        return None