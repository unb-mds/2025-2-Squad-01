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
        # Programming Languages
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
        
        # Web Technologies
        '.html': 'HTML',
        '.htm': 'HTML',
        '.css': 'CSS',
        '.scss': 'SCSS',
        '.sass': 'Sass',
        '.less': 'Less',
        '.vue': 'Vue',
        
        # Data & Config
        '.sql': 'SQL',
        '.json': 'JSON',
        '.xml': 'XML',
        '.yaml': 'YAML',
        '.yml': 'YAML',
        '.toml': 'TOML',
        '.ini': 'INI',
        '.env': 'Environment',
        '.conf': 'Config',
        '.cfg': 'Config',
        
        # Shell Scripts
        '.sh': 'Shell',
        '.bash': 'Bash',
        '.zsh': 'Zsh',
        '.fish': 'Fish',
        '.ps1': 'PowerShell',
        '.bat': 'Batch',
        '.cmd': 'Batch',
        
        # Documentation
        '.md': 'Markdown',
        '.markdown': 'Markdown',
        '.rst': 'reStructuredText',
        '.txt': 'Text',
        '.tex': 'LaTeX',
        '.pdf': 'PDF',
        
        # Images
        '.png': 'PNG Image',
        '.jpg': 'JPEG Image',
        '.jpeg': 'JPEG Image',
        '.gif': 'GIF Image',
        '.svg': 'SVG Image',
        '.webp': 'WebP Image',
        '.ico': 'Icon',
        '.bmp': 'Bitmap Image',
        '.tiff': 'TIFF Image',
        '.tif': 'TIFF Image',
        
        # Fonts
        '.ttf': 'TrueType Font',
        '.otf': 'OpenType Font',
        '.woff': 'WOFF Font',
        '.woff2': 'WOFF2 Font',
        '.eot': 'EOT Font',
        
        # Media
        '.mp4': 'MP4 Video',
        '.webm': 'WebM Video',
        '.mov': 'QuickTime Video',
        '.avi': 'AVI Video',
        '.mp3': 'MP3 Audio',
        '.wav': 'WAV Audio',
        '.ogg': 'OGG Audio',
        
        # Archives
        '.zip': 'ZIP Archive',
        '.tar': 'TAR Archive',
        '.gz': 'GZIP Archive',
        '.rar': 'RAR Archive',
        '.7z': '7-Zip Archive',
        
        # Build & Package
        '.lock': 'Lock File',
        '.log': 'Log File',
        '.gitignore': 'Git Ignore',
        '.dockerignore': 'Docker Ignore',
        
        '': 'No Extension'
    }
    
    return extension_map.get(extension.lower(), 'Unknown')

def convert_tree_to_hierarchy(tree: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Converte árvore flat do GraphQL em hierarquia para Circle Pack.
    Preserva estrutura de diretórios e arquivos.
    
    Args:
        tree: Lista de nós da árvore (arquivos e diretórios) do GraphQL
    
    Returns:
        Dicionário com hierarquia aninhada pronta para d3.pack()
    """
    def build_node(node: Dict[str, Any]) -> Dict[str, Any]:
        """Constrói um nó da hierarquia recursivamente."""
        node_type = node.get('type', '')
        
        if node_type in ['file', 'blob']:
            # Arquivo - nó folha
            object_data = node.get('object', {})
            name = node.get('name', '')
            
            # Extrair extensão
            extension = ''
            if '.' in name:
                extension = '.' + name.split('.')[-1]
            
            # Determinar linguagem
            language = detect_language_by_extension(extension)
            
            # Tamanho pode estar em 'size' ou 'object.byteSize'
            size = node.get('size', 0) or object_data.get('byteSize', 0)
            
            return {
                'name': name,
                'type': 'file',
                'language': language,
                'size': size,
                'extension': extension,
                'path': node.get('path', '')
            }
        elif node_type in ['directory', 'tree']:
            # Diretório - nó pai
            children = node.get('children', [])
            if not children:
                object_data = node.get('object', {})
                children = object_data.get('entries', [])
            
            # Construir filhos recursivamente
            child_nodes = []
            for child in children:
                child_node = build_node(child)
                if child_node:  # Apenas adicionar se não for None
                    child_nodes.append(child_node)
            
            return {
                'name': node.get('name', ''),
                'type': 'directory',
                'path': node.get('path', ''),
                'children': child_nodes
            }
        
        return None
   
    # Construir hierarquia recursivamente
    root_children = []
    for node in tree:
        node_result = build_node(node)
        if node_result:
            root_children.append(node_result)
    
    hierarchy = {
        'name': 'root',
        'type': 'directory',
        'children': root_children
    }
    
    return hierarchy

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
        
        language_summary.append({
            'language': language,
            'file_count': stats['count'],
            'total_bytes': stats['total_size'],
            'percentage': round(percentage, 2),
            'files': sample_files,  # Amostra limitada
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
            hierarchy = convert_tree_to_hierarchy(structure_data['tree'])
            
            hierarchy_data = {
                'repository': repo_name,
                'owner': structure_data.get('owner'),
                'branch': structure_data.get('branch'),
                'extracted_at': structure_data.get('extracted_at'),
                'hierarchy': hierarchy
            }
            
            hierarchy_file = save_json_data(
                hierarchy_data,
                f"data/silver/hierarchy_{repo_name}.json"
            )
            generated_files.append(hierarchy_file)
            print(f"  ✅ Hierarchy saved: {hierarchy_file}")


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