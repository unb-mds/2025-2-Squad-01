#!/usr/bin/env python3

from collections import defaultdict
from typing import List, Dict, Any
from pathlib import Path
from utils.github_api import save_json_data, load_json_data
import os
import glob

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
            if node.get('type') == 'file':
                extension = node.get('extension', '')
                language = detect_language_by_extension(extension)
                size = node.get('size', 0)
                
                language_stats[language]['count'] += 1
                language_stats[language]['total_size'] += size
                language_stats[language]['files'].append({
                    'path': node.get('path'),
                    'name': node.get('name'),
                    'size': size,
                    'extension': extension
                })
            
            elif node.get('type') == 'directory' and 'children' in node:
                traverse_tree(node['children'], node.get('path', ''))
    
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
            'sample_files': sample_files,  # Amostra limitada
            'sample_size': len(sample_files),  # Quantos arquivos na amostra
            'has_more': len(all_files) > max_sample_files  # Indica se há mais arquivos
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
    save_detailed: bool = False
) -> List[str]:
    """
    Processa todos os arquivos de estrutura do bronze e analisa linguagens.
    
    Args:
        max_sample_files: Número máximo de arquivos de exemplo por linguagem
        sample_strategy: 'largest' para maiores arquivos, 'first' para primeiros
        save_detailed: Se True, salva lista completa de arquivos em arquivo separado
    
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
    
    print(f"\nLanguage analysis completed! Generated {len(generated_files)} files")
    print(f"Configuration: max_sample_files={max_sample_files}, strategy={sample_strategy}")
    
    return generated_files