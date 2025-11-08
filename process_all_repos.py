"""
Script principal para processar análise de commits de todos os repositórios.
Executa enriquecimento e processamento em lote.
"""
import sys
import subprocess
import argparse
from pathlib import Path

def run_command(cmd: list, description: str) -> int:
    """
    Executa comando e retorna código de saída.
    
    Args:
        cmd: Lista com comando e argumentos
        description: Descrição da operação
        
    Returns:
        Código de saída do processo
    """
    print(f"\n{'='*60}")
    print(f"STEP: {description}")
    print(f"{'='*60}\n")
    
    try:
        result = subprocess.run(cmd, check=True)
        return result.returncode
    except subprocess.CalledProcessError as e:
        print(f"\n❌ Step failed with code {e.returncode}")
        return e.returncode
    except Exception as e:
        print(f"\n❌ Error running step: {e}")
        return 1

def main():
    """Pipeline completo: enrichment → processing → done"""
    parser = argparse.ArgumentParser(
        description='Process commit analysis for all repositories'
    )
    parser.add_argument(
        '--token',
        required=True,
        help='GitHub personal access token'
    )
    parser.add_argument(
        '--max-repos',
        type=int,
        help='Maximum number of repositories to process (for testing)'
    )
    parser.add_argument(
        '--skip-enrich',
        action='store_true',
        help='Skip enrichment step (only process already enriched data)'
    )
    parser.add_argument(
        '--owner',
        default='unb-mds',
        help='GitHub organization/owner name'
    )
    
    args = parser.parse_args()
    
    print(f"\n{'#'*60}")
    print(f"# COMMIT ANALYSIS PIPELINE - ALL REPOSITORIES")
    print(f"{'#'*60}")
    print(f"Owner: {args.owner}")
    if args.max_repos:
        print(f"Max repos: {args.max_repos}")
    if args.skip_enrich:
        print(f"⚠️  Skipping enrichment step")
    print(f"{'#'*60}\n")
    
    # Step 1: Enriquecimento (opcional)
    if not args.skip_enrich:
        enrich_cmd = [
            sys.executable,
            'batch_enrich_commits.py',
            '--token', args.token,
            '--owner', args.owner
        ]
        
        if args.max_repos:
            enrich_cmd.extend(['--max-repos', str(args.max_repos)])
        
        code = run_command(enrich_cmd, "Enriching commits with GitHub API")
        
        if code != 0:
            print("\n❌ Enrichment step failed. Aborting pipeline.")
            return code
    
    # Step 2: Processamento
    process_cmd = [
        sys.executable,
        'batch_process_commits.py'
    ]
    
    if args.max_repos:
        process_cmd.extend(['--max-repos', str(args.max_repos)])
    
    code = run_command(process_cmd, "Processing enriched data by author")
    
    if code != 0:
        print("\n❌ Processing step failed.")
        return code
    
    # Sucesso!
    print(f"\n{'#'*60}")
    print(f"# ✅ PIPELINE COMPLETED SUCCESSFULLY")
    print(f"{'#'*60}")
    print(f"\nNext steps:")
    print(f"1. Check files in front-end/public/commits_by_author_*.json")
    print(f"2. Update frontend to list all available repositories")
    print(f"3. Access the commit analysis page to view results")
    print(f"{'#'*60}\n")
    
    return 0

if __name__ == "__main__":
    sys.exit(main())
