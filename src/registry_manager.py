
import os
import json
from datetime import datetime
from typing import Dict, List, Any
from utils.github_api import load_json_data, save_json_data

def create_master_registry() -> str:
    
    master_registry = {
        'created_at': datetime.now().isoformat(),
        'layers': {
            'bronze': {}
        },
        'file_inventory': []
    }
    
    # BRONZE SCAN
    bronze_files = scan_data_directory('data/bronze')
    master_registry['layers']['bronze'] = categorize_bronze_files(bronze_files)
    
    # Create complete file inventory
    all_files = bronze_files
    master_registry['file_inventory'] = [{
        'file_path': f,
        'layer': 'bronze',
        'size_bytes': os.path.getsize(f) if os.path.exists(f) else 0,
        'modified_at': datetime.fromtimestamp(os.path.getmtime(f)).isoformat() if os.path.exists(f) else None
    } for f in all_files]
    
    # Save master registry
    registry_file = save_json_data(
        master_registry,
        "data/master_registry.json",
        timestamp=False
    )
    
    return registry_file

def scan_data_directory(directory: str) -> List[str]:

    files = []
    if os.path.exists(directory):
        for root, dirs, filenames in os.walk(directory):
            for filename in filenames:
                if filename.endswith('.json'):
                    files.append(os.path.join(root, filename))
    return files

def categorize_bronze_files(files: List[str]) -> Dict[str, List[str]]:
  
    categories = {
        'repositories': [],
        'issues': [],
        'prs': [],
        'commits': [],
        'events': [],
        'raw': []
    }
    
    for file_path in files:
        filename = os.path.basename(file_path)
        
        if 'repo' in filename.lower():
            categories['repositories'].append(file_path)
        elif 'issue' in filename.lower() and 'event' not in filename.lower():
            categories['issues'].append(file_path)
        elif 'pr' in filename.lower():
            categories['prs'].append(file_path)
        elif 'commit' in filename.lower():
            categories['commits'].append(file_path)
        elif 'event' in filename.lower():
            categories['events'].append(file_path)
        else:
            categories['raw'].append(file_path)
    
    return categories


def create_bronze_dependencies() -> Dict[str, Any]:
    """Create dependency mapping for bronze layer extractions"""
    
    dependencies = {
        'extraction_dependencies': {
            'repositories': {
                'depends_on': [],
                'required_for': ['issues', 'commits']
            },
            'issues': {
                'depends_on': ['repositories'],
                'required_for': []
            },
            'commits': {
                'depends_on': ['repositories'],
                'required_for': []
            }
        }
    }
    
    return dependencies

def generate_data_catalog() -> str:

    catalog = {
        'generated_at': datetime.now().isoformat(),
        'bronze_layer': {
            'description': 'Raw data extracted directly from GitHub API',
            'entities': {
                'repositories_raw.json': 'Complete raw repository data from GitHub API',
                'repositories_filtered.json': 'Filtered repositories excluding forks and blacklisted repos',
                'repositories_detailed.json': 'Detailed repository information with additional metadata',
                'issues_all.json': 'All issues across repositories',
                'prs_all.json': 'All pull requests across repositories',
                'commits_all.json': 'All commits across repositories',
                'issue_events_all.json': 'All issue-related events (comments, labels, etc.)'
            }
        },

        'usage_patterns': {
            'raw_data_analysis': [
                'data/bronze/repositories_filtered.json',
                'data/bronze/commits_all.json',
                'data/bronze/issues_all.json'
            ],
            'repository_insights': [
                'data/bronze/repositories_raw.json',
                'data/bronze/repositories_detailed.json'
            ],
            'activity_tracking': [
                'data/bronze/commits_all.json',
                'data/bronze/issues_all.json',
                'data/bronze/prs_all.json'
            ]
        }
    }
    
    catalog_file = save_json_data(
        catalog,
        "data/data_catalog.json",
        timestamp=False
    )
    
    return catalog_file

if __name__ == "__main__":
    print("Creating data registry and catalog...")
    
    master_registry_file = create_master_registry()
    print(f"Created master registry: {master_registry_file}")
    
    catalog_file = generate_data_catalog()
    print(f"Created data catalog: {catalog_file}")
    
    print("\nData management system initialized successfully!")