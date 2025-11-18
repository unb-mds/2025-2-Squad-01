#!/usr/bin/env python3

import argparse
import sys
import os
from datetime import datetime
import shutil
import json
from pathlib import Path

# Add src to path 
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from utils.github_api import update_data_registry
from silver.file_language_analysis import process_file_language_analysis
# Import other silver processing modules as needed

def main():
    parser = argparse.ArgumentParser(description='Process Bronze data to Silver layer')
    parser.add_argument('--org', default='unb-mds', help='GitHub organization name')
    
    args = parser.parse_args()
    
    print(f"Starting Silver layer processing")
    print(f"Started at: {datetime.now().isoformat()}")
    
    try:
        #individual processors
        from silver.member_analytics import process_member_analytics
        from silver.contribution_metrics import process_contribution_metrics
        from silver.collaboration_networks import process_collaboration_networks
        from silver.temporal_analysis import process_temporal_analysis
        from silver.file_language_analysis import process_file_language_analysis
        
        # Process data in logical order
        print("\nProcessing member analytics...")
        member_files = process_member_analytics()
        
        print("\nProcessing contribution metrics...")
        contrib_files = process_contribution_metrics()
        
        print("\nProcessing collaboration networks...")
        collab_files = process_collaboration_networks()
        
        print("\nProcessing temporal analysis...")
        temporal_files = process_temporal_analysis()

        print("\nProcessing file language analysis...")
        language_files = process_file_language_analysis(
            max_sample_files=10,
            sample_strategy='largest',
            save_detailed=False,
            save_hierarchy=True 
        )

        #  registry
        all_files = member_files + contrib_files + collab_files + temporal_files + language_files
        print("\nPublishing files to front-end and generating index...")
    
        # Define o diretório de ORIGEM (onde o Python salvou)
        SILVER_DIR = Path("data/silver") 
        # Define o diretório de DESTINO (onde o React vai ler)
        FRONT_END_DIR = Path("front-end/public/data/silver") 

        # Garante que o diretório de destino exista
        FRONT_END_DIR.mkdir(parents=True, exist_ok=True)
        
        available_repos_list = []
        
        # Itera sobre TODOS os arquivos que acabamos de gerar em data/silver
        for file_path_str in all_files:
            file_path = Path(file_path_str)
            
            # Confirma que o arquivo realmente está no diretório Silver
            if file_path.parent.name == 'silver':
                
                # Filtra apenas os arquivos que o front-end realmente precisa
                # (Adicione outros JSONs do front-end se necessário)
                if file_path.name.startswith("language_analysis_") or \
                file_path.name.startswith("repo_tree_pack_") or \
                file_path.name.startswith("collaboration_edges") or \
                file_path.name.startswith("activity_heatmap"):
                    
                    try:
                        # 1. Copia o arquivo de 'data/silver' para 'front-end/public/data/silver'
                        shutil.copy(file_path, FRONT_END_DIR)
                        
                        # 2. Usa 'language_analysis' como base para o índice
                        if file_path.name.startswith("language_analysis_"):
                            repo_name = file_path.stem.replace("language_analysis_", "")
                            if repo_name != "all" and repo_name not in available_repos_list:
                                available_repos_list.append(repo_name)
                                
                    except Exception as e:
                        print(f"  ERROR copying {file_path.name} to front-end: {e}")

        print(f"  {len(available_repos_list)} repositórios copiados para {FRONT_END_DIR}.")
        
        # 3. Salva o índice 'available_repos.json' DIRETAMENTE no front-end
        if available_repos_list:
            # O caminho do índice é no DESTINO
            available_repos_path = FRONT_END_DIR / "available_repos.json" 
            try:
                with open(available_repos_path, 'w', encoding='utf-8') as f:
                    json.dump(available_repos_list, f, indent=2)
                print(f"  ✅ Índice 'available_repos.json' gerado em {FRONT_END_DIR}.")
            except Exception as e:
                print(f"  ERROR saving available_repos.json: {e}")
        update_data_registry('silver', 'all_processed', all_files)
        
        print(f"\nSilver processing completed successfully!")
        print(f"Generated {len(all_files)} files:")
        for file_path in all_files:
            print(f"   - {file_path}")
            
    except Exception as e:
        print(f"\n Error during silver processing: {str(e)}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

if __name__ == "__main__":
    main()