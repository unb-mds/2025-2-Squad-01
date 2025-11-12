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

def calculate_language_stats(tree: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Calcula estatísticas de linguagens recursivamente na árvore de arquivos.
    """
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
        language_summary.append({
            'language': language,
            'file_count': stats['count'],
            'total_bytes': stats['total_size'],
            'percentage': round(percentage, 2),
            'files': stats['files']
        })
    
    # Ordenar por percentual
    language_summary.sort(key=lambda x: x['percentage'], reverse=True)
    
    return {
        'total_files': sum(stats['count'] for stats in language_stats.values()),
        'total_bytes': total_size,
        'languages': language_summary
    }

def process_file_language_analysis() -> List[str]:
    """
    Processa todos os arquivos de estrutura do bronze e analisa linguagens.
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
        
        # Calcular estatísticas de linguagem
        language_stats = calculate_language_stats(structure_data['tree'])
        
        analysis = {
            'repository': repo_name,
            'owner': structure_data.get('owner'),
            'branch': structure_data.get('branch'),
            'analyzed_at': structure_data.get('extracted_at'),
            **language_stats
        }
        
        all_repo_analyses.append(analysis)
        
        # Salvar análise individual
        analysis_file = save_json_data(
            analysis,
            f"data/silver/language_analysis_{repo_name}.json"
        )
        generated_files.append(analysis_file)
    
    # Salvar análise consolidada
    if all_repo_analyses:
        consolidated_file = save_json_data(
            all_repo_analyses,
            "data/silver/language_analysis_all.json"
        )
        generated_files.append(consolidated_file)
    
    print(f"\nLanguage analysis completed! Generated {len(generated_files)} files")
    return generated_files