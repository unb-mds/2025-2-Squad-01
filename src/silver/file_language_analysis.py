#!/usr/bin/env python3
## este arquivo precisa ser alterado provavelmente
from collections import defaultdict
from typing import List, Dict, Any
from pathlib import Path
from utils.github_api import save_json_data, load_json_data
import os
import glob
import json

def detect_language_by_extension(extension: str) -> str:
    """
    Map archive extensios for programming language.
    """
    extension_map = {
        '.py': 'Python',
        '.js': 'JavaScript',
        '.ts': 'TypeScript',
        '.tsx': 'TypeScript',
        '.jsx': 'JavaScript',
        '.java': 'Java',
        '.cpp': 'C++',
        '.c': 'C',
        '.h': 'C/C++ Header',
        '.hpp': 'C++ Header',
        '.cs': 'C#',
        '.go': 'Go',
        '.rs': 'Rust',
        '.rb': 'Ruby',
        '.php': 'PHP',
        '.swift': 'Swift',
        '.kt': 'Kotlin',
        '.scala': 'Scala',
        '.r': 'R',
        '.m': 'Objective-C',
        '.html': 'HTML',
        '.css': 'CSS',
        '.scss': 'SCSS',
        '.sass': 'Sass',
        '.less': 'Less',
        '.vue': 'Vue',
        '.sql': 'SQL',
        '.sh': 'Shell',
        '.bash': 'Bash',
        '.zsh': 'Zsh',
        '.json': 'JSON',
        '.xml': 'XML',
        '.yaml': 'YAML',
        '.yml': 'YAML',
        '.md': 'Markdown',
        '.txt': 'Text',
        '': 'No Extension'
    }
    
    return extension_map.get(extension.lower(), 'Unknown')

def _process_pack_node(node: Dict[str, Any]) -> Dict[str, Any]:
    """
    Função auxiliar recursiva: Processa um único nó, calculando 'value' (tamanho)
    de baixo para cima.
    """
    node_type = node.get('type', '')

    if node_type in ['file', 'blob']:
        # É um arquivo. Calcula seu 'value'.
        object_data = node.get('object', {})
        name = node.get('name', '')
        size = node.get('size', 0) or object_data.get('byteSize', 0)

        if size == 0:
            return None # Ignora arquivos vazios

        extension = '.' + name.split('.')[-1] if '.' in name else ''
        language = detect_language_by_extension(extension)

        return {
            'name': name,
            'type': 'file',
            'language': language,
            'value': size, # 'value' é o tamanho do arquivo
            'path': node.get('path', '')
        }

    elif node_type in ['directory', 'tree']:
        # É um diretório. Processa filhos e soma seus 'value's.
        children_data = node.get('children', [])
        if not children_data:
            object_data = node.get('object', {})
            children_data = object_data.get('entries', [])

        child_nodes = []
        total_size = 0

        if children_data:
            for child in children_data:
                child_node = _process_pack_node(child) # Chamada recursiva
                if child_node:
                    child_nodes.append(child_node)
                    total_size += child_node.get('value', 0) # Soma o 'value' do filho

        if total_size == 0 and not child_nodes:
            return None # Ignora diretórios vazios

        return {
            'name': node.get('name', ''),
            'type': 'directory',
            'path': node.get('path', ''),
            'children': child_nodes,
            'value': total_size # 'value' é a soma de todos os filhos
        }

    return None

def build_pack_hierarchy_from_tree_list(tree: List[Dict[str, Any]], repo_name: str) -> Dict[str, Any]:
    """
    Substitui convert_tree_to_hierarchy. Constrói a hierarquia
    aninhada com 'value' (tamanho agregado) para D3.pack().
    """
    root_children = []
    total_root_size = 0
    for node in tree:
        child_node = _process_pack_node(node)
        if child_node:
            root_children.append(child_node)
            total_root_size += child_node.get('value', 0)

    return {
        'name': repo_name, 
        'type': 'directory',
        'children': root_children,
        'value': total_root_size
    }

def calculate_language_stats(
    tree: List[Dict[str, Any]], 
    max_sample_files: int = 10,
    sample_strategy: str = 'largest'
) -> Dict[str, Any]:
    """
    Calcula estatísticas de linguagens recursivamente na árvore de arquivos.
    
    Args:
        tree: Árvore de arquivos e diretórios
        max_sample_files: Número máximo de arquivos de exemplo por linguagem (padrão: 10)
        sample_strategy: Estratégia de amostragem - 'largest' (maiores) ou 'first' (primeiros)
    
    Returns:
        Dicionário com estatísticas agregadas e amostras limitadas
    """

    # Estrutura otimizada: armazena todos temporariamente, mas limita na saída final
    language_stats = defaultdict(lambda: {'count': 0, 'total_size': 0, 'files': []})
    
    def traverse_tree(nodes: List[Dict[str, Any]], parent_path: str = ""):
        for node in nodes:
            node_type = node.get('type', '')

            if node_type in ['file', 'blob']:
                
                object_data = node.get('object', {})
                extension = node.get('extension', '')
                if not extension and 'name' in node:
                    name = node.get('name', '')
                    if '.' in name:
                        extension = '.' + name.split('.')[-1]
            
                language = detect_language_by_extension(extension)
            
                # Tamanho pode estar em 'size' ou 'object.byteSize'
                size = node.get('size', 0) or object_data.get('byteSize', 0)
            
                language_stats[language]['count'] += 1
                language_stats[language]['total_size'] += size
                language_stats[language]['files'].append({
                    'path': node.get('path', parent_path),
                    'name': node.get('name', ''),
                    'size': size,
                    'extension': extension
            })
        
            elif node_type in ['directory', 'tree']:  #ADICIONAR 'tree'
                # GraphQL usa 'object.entries' para filhos
                children = node.get('children', [])
                if not children:
                    object_data = node.get('object', {})
                    children = object_data.get('entries', [])
                
                if children:
                    traverse_tree(children, node.get('path', parent_path))
    
    traverse_tree(tree)
    
    # Calcular percentuais
    total_size = sum(stats['total_size'] for stats in language_stats.values())
    

    language_summary = []
    for language, stats in language_stats.items():
        percentage = (stats['total_size'] / total_size * 100) if total_size > 0 else 0
        
        # Selecionar amostra de arquivos baseado na estratégia
        all_files = stats['files']
        
        if sample_strategy == 'largest':
            # Pegar os N maiores arquivos
            sample_files = sorted(all_files, key=lambda x: x['size'], reverse=True)[:max_sample_files]
        else:  # 'first'
            # Pegar os N primeiros arquivos
            sample_files = all_files[:max_sample_files]
        has_more = len(all_files) > max_sample_files
        
        language_summary.append({
            'language': language,
            'file_count': stats['count'],
            'total_bytes': stats['total_size'],
            'percentage': round(percentage, 2),
            'files': sample_files,  # Amostra limitada
            'has_more': has_more
        })            
    
    # Ordenar por percentual
    language_summary.sort(key=lambda x: x['percentage'], reverse=True)
    
    return {
        'total_files': sum(stats['count'] for stats in language_stats.values()),
        'total_bytes': total_size,
        'languages': language_summary
    }

def process_file_language_analysis(
    max_sample_files: int = 10,
    sample_strategy: str = 'largest',
    save_detailed: bool = False,
    save_hierarchy: bool = True
) -> List[str]:
    """
    Processa todos os arquivos de estrutura do bronze e analisa linguagens.
    
    Args:
        max_sample_files: Número máximo de arquivos de exemplo por linguagem
        sample_strategy: 'largest' para maiores arquivos, 'first' para primeiros
        save_detailed: Se True, salva lista completa de arquivos em arquivo separado
        save_hierarchy: Se True, gera arquivo hierarchy_*.json para Circle Pack visualization

    Returns:
        Lista de caminhos de arquivos gerados
    """
    
    # Encontrar todos os arquivos de estrutura
    structure_files = glob.glob("data/bronze/structure_*.json")
    
    if not structure_files:
        print("No structure files found in bronze layer")
        return []
    
    generated_files = []
    all_repo_analyses = []
    
    for structure_file in structure_files:
        repo_name = Path(structure_file).stem.replace('structure_', '')
        print(f"Analyzing languages for: {repo_name}")
        
        structure_data = load_json_data(structure_file)
        if not structure_data or 'tree' not in structure_data:
            print(f"  Skipping {repo_name}: invalid structure data")
            continue
        
        
         # Calcular estatísticas de linguagem com amostragem limitada
        language_stats = calculate_language_stats(
            structure_data['tree'],
            max_sample_files=max_sample_files,
            sample_strategy=sample_strategy
        )
        
        analysis = {
            'repository': repo_name,
            'owner': structure_data.get('owner'),
            'branch': structure_data.get('branch'),
            'analyzed_at': structure_data.get('extracted_at'),
            'sample_config': {
                'max_files_per_language': max_sample_files,
                'strategy': sample_strategy
            },
            **language_stats
        }
        
        all_repo_analyses.append(analysis)
        
        # Salvar análise individual
        analysis_file = save_json_data(
            analysis,
            f"data/silver/language_analysis_{repo_name}.json"
        )
        generated_files.append(analysis_file)
        print(f"  ✅ Language analysis saved: {analysis_file}")


        if save_hierarchy:
            hierarchy = build_pack_hierarchy_from_tree_list(structure_data['tree'], repo_name)            
            hierarchy_data = {
                'repository': repo_name,
                'owner': structure_data.get('owner'),
                'branch': structure_data.get('branch'),
                'extracted_at': structure_data.get('extracted_at'),
                'hierarchy': hierarchy
            }
            
            hierarchy_file = save_json_data(
                hierarchy_data,
                f"data/silver/repo_tree_pack_{repo_name}.json"
            )
            generated_files.append(str(hierarchy_file))
            print(f"  ✅ Repo Tree Pack saved: {hierarchy_file}")


                # Opcionalmente salvar lista completa em arquivo separado
        if save_detailed:
            # Recalcular SEM limite de amostra para arquivo detalhado
            detailed_stats = calculate_language_stats(
                structure_data['tree'],
                max_sample_files=999999,  # Sem limite
                sample_strategy=sample_strategy
            )
            
            detailed_file = save_json_data(
                {
                    'repository': repo_name,
                    'owner': structure_data.get('owner'),
                    **detailed_stats
                },
                f"data/silver/language_analysis_{repo_name}_detailed.json"
            )
            generated_files.append(detailed_file)
            print(f"  ✓ Detailed analysis saved: {detailed_file}") 
    
    # Salvar análise consolidada
    if all_repo_analyses:
        consolidated_file = save_json_data(
            all_repo_analyses,
            "data/silver/language_analysis_all.json"
        )
        generated_files.append(consolidated_file)
        print(f"\n✅ Consolidated analysis saved: {consolidated_file}")

    
    print(f"\nLanguage analysis completed! Generated {len(generated_files)} files")
    print(f"Configuration: max_sample_files={max_sample_files}, strategy={sample_strategy}")

    return generated_files