#!/usr/bin/env python3

import os
import logging
from typing import List, Dict, Any
from utils.github_api import GitHubAPIClient, OrganizationConfig, save_json_data, load_json_data

# Configurar logger
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def extract_repository_structure(
    client: GitHubAPIClient, 
    config: OrganizationConfig, 
    use_cache: bool = True
    
) -> List[str]:
    """
    Extrai estrutura de arquivos de todos os repositórios filtrados usando GraphQL.
    
    Args:
        client: Cliente da API do GitHub
        config: Configuração da organização
        use_cache: Se deve usar cache
    
    Returns:
        Lista de caminhos dos arquivos structure_{repo}.json gerados
    """
    logger.info("="*60)
    logger.info("🌳 EXTRACTING REPOSITORY STRUCTURES (GraphQL)")
    logger.info("="*60)
    
    # Carregar repositórios filtrados
    filtered_repos = load_json_data("data/bronze/repositories_filtered.json")
    
    if not filtered_repos:
        logger.warning("⚠️  No filtered repositories found. Run repository extraction first.")
        return []
    
    # Remover metadata se existir
    if isinstance(filtered_repos, list) and len(filtered_repos) > 0:
        if isinstance(filtered_repos[0], dict) and '_metadata' in filtered_repos[0]:
            filtered_repos = filtered_repos[1:]
    
    generated_files = []
    successful = 0
    failed = 0
    
    for repo in filtered_repos:
        if not repo or not isinstance(repo, dict):
            logger.warning(f"Skipping invalid repo entry: {repo}")
            failed += 1
            continue
        
        repo_name = repo.get('name', 'unknown')
        full_name = repo.get('full_name', repo_name)
        default_branch = repo.get('default_branch', 'main')
        
        # Extrair owner do full_name
        if '/' not in full_name:
            logger.warning(f"Skipping {repo_name}: invalid full_name format")
            failed += 1
            continue
        
        owner, name_only = full_name.split('/', 1)
        
        logger.info(f"\n📂 Processing: {repo_name}")
        logger.info(f"   Owner: {owner}")
        logger.info(f"   Branch: {default_branch}")
        logger.info(f"   Method: GraphQL (fixed)")
        
        try:
            # 👇 SEMPRE USAR GRAPHQL
            structure = client.graphql_repository_tree(
                owner=owner,
                repo=name_only,
                branch=default_branch,
                use_cache=use_cache
            )
            
            # Validar dados mínimos
            if not structure or not structure.get('tree'):
                logger.warning(f"   ⚠️  No files found in {repo_name}")
                failed += 1
                continue
            
            total_items = len(structure['tree'])
            
            if total_items == 0:
                logger.warning(f"   ⚠️  Empty tree for {repo_name}")
                failed += 1
                continue
            
            # Adicionar metadados do repositório
            structure['repository_metadata'] = {
                'id': repo.get('id'),
                'full_name': full_name,
                'description': repo.get('description'),
                'created_at': repo.get('created_at'),
                'updated_at': repo.get('updated_at'),
                'language': repo.get('language'),
                'size': repo.get('size'),
                'stars': repo.get('stargazers_count', 0),
                'forks': repo.get('forks_count', 0),
                'open_issues': repo.get('open_issues_count', 0),
            }
            
            # Salvar structure_{repo}.json
            output_file = save_json_data(
                structure,
                f"data/bronze/structure_{repo_name}.json",
                timestamp=False  # Nome fixo para facilitar lookup
            )
            
            generated_files.append(output_file)
            successful += 1
            
            logger.info(f"   ✅ Saved: {output_file}")
            logger.info(f"   📊 Files: {total_items}")
            
        except Exception as e:
            logger.error(f"   ❌ Error extracting {repo_name}: {str(e)}")
            failed += 1
            continue
    
    # Resumo final
    logger.info("\n" + "="*60)
    logger.info(f"✅ Successful: {successful}")
    logger.info(f"❌ Failed: {failed}")
    logger.info(f"📁 Total files generated: {len(generated_files)}")
    logger.info("="*60)
    
    return generated_files