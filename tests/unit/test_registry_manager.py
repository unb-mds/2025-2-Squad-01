"""
Unit tests for src/registry_manager.py
Tests registry creation, file scanning, and categorization.
"""
import pytest
import os
from unittest.mock import MagicMock, patch, mock_open
from registry_manager import (
    scan_data_directory,
    categorize_bronze_files,
    create_bronze_dependencies,
    generate_data_catalog,
    create_master_registry
)


class TestScanDataDirectory:
    """Tests for scan_data_directory function"""
    
    def test_scan_finds_json_files(self):
        """Testa que encontra arquivos JSON no diretório"""
        with patch('os.path.exists', return_value=True):
            with patch('os.walk') as mock_walk:
                mock_walk.return_value = [
                    ('/data/bronze', [], ['file1.json', 'file2.json', 'readme.txt'])
                ]
                
                result = scan_data_directory('/data/bronze')
                
                assert len(result) == 2
                assert all(f.endswith('.json') for f in result)
    
    def test_scan_directory_not_exists(self):
        """Testa que retorna lista vazia quando diretório não existe"""
        with patch('os.path.exists', return_value=False):
            result = scan_data_directory('/nonexistent')
            assert result == []
    
    def test_scan_recursive_subdirectories(self):
        """Testa que escaneia recursivamente subdiretórios"""
        with patch('os.path.exists', return_value=True):
            with patch('os.walk') as mock_walk:
                mock_walk.return_value = [
                    ('/data/bronze', ['sub'], ['file1.json']),
                    ('/data/bronze/sub', [], ['file2.json'])
                ]
                
                result = scan_data_directory('/data/bronze')
                
                assert len(result) == 2
    
    def test_scan_ignores_non_json_files(self):
        """Testa que ignora arquivos não-JSON"""
        with patch('os.path.exists', return_value=True):
            with patch('os.walk') as mock_walk:
                mock_walk.return_value = [
                    ('/data', [], ['data.json', 'readme.md', 'config.yaml', 'script.py'])
                ]
                
                result = scan_data_directory('/data')
                
                assert len(result) == 1
                assert result[0].endswith('data.json')
    
    def test_scan_empty_directory(self):
        """Testa que retorna lista vazia para diretório vazio"""
        with patch('os.path.exists', return_value=True):
            with patch('os.walk') as mock_walk:
                mock_walk.return_value = [('/data', [], [])]
                
                result = scan_data_directory('/data')
                
                assert result == []


class TestCategorizeBronzeFiles:
    """Tests for categorize_bronze_files function"""
    
    def test_categorize_repository_files(self):
        """Testa categorização de arquivos de repositórios"""
        files = [
            'data/bronze/repositories_raw.json',
            'data/bronze/repositories_filtered.json'
        ]
        
        result = categorize_bronze_files(files)
        
        assert len(result['repositories']) == 2
        assert all('repo' in f.lower() for f in result['repositories'])
    
    def test_categorize_issue_files(self):
        """Testa categorização de arquivos de issues"""
        files = [
            'data/bronze/issues_all.json',
            'data/bronze/issues_myapp.json'
        ]
        
        result = categorize_bronze_files(files)
        
        assert len(result['issues']) == 2
    
    def test_categorize_pr_files(self):
        """Testa categorização de arquivos de PRs"""
        files = [
            'data/bronze/prs_all.json',
            'data/bronze/prs_myapp.json'
        ]
        
        result = categorize_bronze_files(files)
        
        assert len(result['prs']) == 2
    
    def test_categorize_commit_files(self):
        """Testa categorização de arquivos de commits"""
        files = [
            'data/bronze/commits_all.json',
            'data/bronze/commits_myapp.json'
        ]
        
        result = categorize_bronze_files(files)
        
        assert len(result['commits']) == 2
    
    def test_categorize_event_files(self):
        """Testa categorização de arquivos de eventos"""
        files = [
            'data/bronze/issue_events_all.json',
            'data/bronze/issue_events_myapp.json'
        ]
        
        result = categorize_bronze_files(files)
        
        assert len(result['events']) == 2
    
    def test_categorize_raw_files(self):
        """Testa categorização de arquivos não reconhecidos como 'raw'"""
        files = [
            'data/bronze/unknown_data.json',
            'data/bronze/custom_export.json'
        ]
        
        result = categorize_bronze_files(files)
        
        assert len(result['raw']) == 2
    
    def test_categorize_mixed_files(self):
        """Testa categorização de mix de diferentes tipos"""
        files = [
            'data/bronze/repositories_raw.json',
            'data/bronze/issues_all.json',
            'data/bronze/commits_all.json',
            'data/bronze/prs_all.json',
            'data/bronze/issue_events_all.json',
            'data/bronze/unknown.json'
        ]
        
        result = categorize_bronze_files(files)
        
        assert len(result['repositories']) == 1
        assert len(result['issues']) == 1
        assert len(result['commits']) == 1
        assert len(result['prs']) == 1
        assert len(result['events']) == 1
        assert len(result['raw']) == 1
    
    def test_categorize_case_insensitive(self):
        """Testa que categorização é case-insensitive"""
        files = [
            'data/bronze/REPOSITORIES_RAW.json',
            'data/bronze/Issues_All.json'
        ]
        
        result = categorize_bronze_files(files)
        
        assert len(result['repositories']) == 1
        assert len(result['issues']) == 1
    
    def test_categorize_returns_all_categories(self):
        """Testa que retorna todas as categorias esperadas"""
        result = categorize_bronze_files([])
        
        expected_categories = ['repositories', 'issues', 'prs', 'commits', 'events', 'raw']
        assert all(cat in result for cat in expected_categories)
    
    def test_categorize_issue_events_not_as_issues(self):
        """Testa que issue_events não é categorizado como issues"""
        files = ['data/bronze/issue_events_all.json']
        
        result = categorize_bronze_files(files)
        
        assert len(result['events']) == 1
        assert len(result['issues']) == 0


class TestCreateBronzeDependencies:
    """Tests for create_bronze_dependencies function"""
    
    def test_returns_dependency_structure(self):
        """Testa que retorna estrutura de dependências"""
        result = create_bronze_dependencies()
        
        assert 'extraction_dependencies' in result
        assert isinstance(result['extraction_dependencies'], dict)
    
    def test_repositories_have_no_dependencies(self):
        """Testa que repositories não tem dependências"""
        result = create_bronze_dependencies()
        
        repos = result['extraction_dependencies']['repositories']
        assert repos['depends_on'] == []
    
    def test_repositories_required_for_others(self):
        """Testa que repositories é necessário para issues e commits"""
        result = create_bronze_dependencies()
        
        repos = result['extraction_dependencies']['repositories']
        assert 'issues' in repos['required_for']
        assert 'commits' in repos['required_for']
    
    def test_issues_depend_on_repositories(self):
        """Testa que issues depende de repositories"""
        result = create_bronze_dependencies()
        
        issues = result['extraction_dependencies']['issues']
        assert 'repositories' in issues['depends_on']
    
    def test_commits_depend_on_repositories(self):
        """Testa que commits depende de repositories"""
        result = create_bronze_dependencies()
        
        commits = result['extraction_dependencies']['commits']
        assert 'repositories' in commits['depends_on']


class TestGenerateDataCatalog:
    """Tests for generate_data_catalog function"""
    
    def test_creates_catalog_with_timestamp(self):
        """Testa que cria catálogo com timestamp"""
        with patch('registry_manager.save_json_data', return_value='catalog.json') as mock_save:
            result = generate_data_catalog()
            
            assert mock_save.called
            catalog_data = mock_save.call_args[0][0]
            assert 'generated_at' in catalog_data
    
    def test_includes_bronze_layer_description(self):
        """Testa que inclui descrição da camada Bronze"""
        with patch('registry_manager.save_json_data', return_value='catalog.json') as mock_save:
            generate_data_catalog()
            
            catalog_data = mock_save.call_args[0][0]
            assert 'bronze_layer' in catalog_data
            assert 'description' in catalog_data['bronze_layer']
    
    def test_includes_entity_definitions(self):
        """Testa que inclui definições de entidades"""
        with patch('registry_manager.save_json_data', return_value='catalog.json') as mock_save:
            generate_data_catalog()
            
            catalog_data = mock_save.call_args[0][0]
            entities = catalog_data['bronze_layer']['entities']
            
            assert 'repositories_raw.json' in entities
            assert 'issues_all.json' in entities
            assert 'commits_all.json' in entities
    
    def test_includes_usage_patterns(self):
        """Testa que inclui padrões de uso"""
        with patch('registry_manager.save_json_data', return_value='catalog.json') as mock_save:
            generate_data_catalog()
            
            catalog_data = mock_save.call_args[0][0]
            assert 'usage_patterns' in catalog_data
            
            patterns = catalog_data['usage_patterns']
            assert 'raw_data_analysis' in patterns
            assert 'repository_insights' in patterns
            assert 'activity_tracking' in patterns
    
    def test_saves_to_correct_path(self):
        """Testa que salva no caminho correto"""
        with patch('registry_manager.save_json_data', return_value='catalog.json') as mock_save:
            generate_data_catalog()
            
            call_args = mock_save.call_args[0]
            assert 'data_catalog.json' in call_args[1]
    
    def test_saves_without_timestamp(self):
        """Testa que salva sem timestamp no nome do arquivo"""
        with patch('registry_manager.save_json_data', return_value='catalog.json') as mock_save:
            generate_data_catalog()
            
            call_kwargs = mock_save.call_args[1]
            assert call_kwargs.get('timestamp') is False


class TestCreateMasterRegistry:
    """Tests for create_master_registry function"""
    
    def test_creates_registry_with_timestamp(self):
        """Testa que cria registro com timestamp"""
        with patch('registry_manager.scan_data_directory', return_value=[]):
            with patch('registry_manager.save_json_data', return_value='registry.json') as mock_save:
                create_master_registry()
                
                registry_data = mock_save.call_args[0][0]
                assert 'created_at' in registry_data
    
    def test_includes_bronze_layer(self):
        """Testa que inclui camada Bronze"""
        with patch('registry_manager.scan_data_directory', return_value=[]):
            with patch('registry_manager.save_json_data', return_value='registry.json') as mock_save:
                create_master_registry()
                
                registry_data = mock_save.call_args[0][0]
                assert 'layers' in registry_data
                assert 'bronze' in registry_data['layers']
    
    def test_scans_bronze_directory(self):
        """Testa que escaneia diretório Bronze"""
        with patch('registry_manager.scan_data_directory', return_value=[]) as mock_scan:
            with patch('registry_manager.save_json_data', return_value='registry.json'):
                create_master_registry()
                
                mock_scan.assert_called_with('data/bronze')
    
    def test_categorizes_bronze_files(self):
        """Testa que categoriza arquivos Bronze"""
        mock_files = ['data/bronze/repos.json', 'data/bronze/issues.json']
        
        with patch('registry_manager.scan_data_directory', return_value=mock_files):
            with patch('registry_manager.categorize_bronze_files') as mock_cat:
                with patch('registry_manager.save_json_data', return_value='registry.json'):
                    with patch('os.path.exists', return_value=True):
                        with patch('os.path.getsize', return_value=1024):
                            with patch('os.path.getmtime', return_value=1234567890):
                                create_master_registry()
                    
                                mock_cat.assert_called_once_with(mock_files)
    
    def test_creates_file_inventory(self):
        """Testa que cria inventário de arquivos"""
        mock_files = ['data/bronze/repos.json']
        
        with patch('registry_manager.scan_data_directory', return_value=mock_files):
            with patch('registry_manager.save_json_data', return_value='registry.json') as mock_save:
                with patch('os.path.exists', return_value=True):
                    with patch('os.path.getsize', return_value=1024):
                        with patch('os.path.getmtime', return_value=1234567890):
                            create_master_registry()
                
                            registry_data = mock_save.call_args[0][0]
                            assert 'file_inventory' in registry_data
                            assert len(registry_data['file_inventory']) == 1
    
    def test_file_inventory_includes_metadata(self):
        """Testa que inventário inclui metadados dos arquivos"""
        mock_files = ['data/bronze/repos.json']
        
        with patch('registry_manager.scan_data_directory', return_value=mock_files):
            with patch('registry_manager.save_json_data', return_value='registry.json') as mock_save:
                with patch('os.path.exists', return_value=True):
                    with patch('os.path.getsize', return_value=2048):
                        with patch('os.path.getmtime', return_value=1234567890.5):
                            create_master_registry()
                
                            registry_data = mock_save.call_args[0][0]
                            file_entry = registry_data['file_inventory'][0]
                            
                            assert 'file_path' in file_entry
                            assert 'layer' in file_entry
                            assert 'size_bytes' in file_entry
                            assert 'modified_at' in file_entry
                            assert file_entry['size_bytes'] == 2048
    
    def test_saves_to_correct_path(self):
        """Testa que salva no caminho correto"""
        with patch('registry_manager.scan_data_directory', return_value=[]):
            with patch('registry_manager.save_json_data', return_value='registry.json') as mock_save:
                create_master_registry()
                
                call_args = mock_save.call_args[0]
                assert 'master_registry.json' in call_args[1]
    
    def test_saves_without_timestamp(self):
        """Testa que salva sem timestamp no nome"""
        with patch('registry_manager.scan_data_directory', return_value=[]):
            with patch('registry_manager.save_json_data', return_value='registry.json') as mock_save:
                create_master_registry()
                
                call_kwargs = mock_save.call_args[1]
                assert call_kwargs.get('timestamp') is False
    
    def test_returns_registry_file_path(self):
        """Testa que retorna caminho do arquivo de registro"""
        with patch('registry_manager.scan_data_directory', return_value=[]):
            with patch('registry_manager.save_json_data', return_value='/path/to/registry.json'):
                result = create_master_registry()
                
                assert result == '/path/to/registry.json'
    
    def test_handles_nonexistent_files_in_inventory(self):
        """Testa que lida com arquivos que não existem ao criar inventário"""
        mock_files = ['data/bronze/missing.json']
        
        with patch('registry_manager.scan_data_directory', return_value=mock_files):
            with patch('registry_manager.save_json_data', return_value='registry.json') as mock_save:
                with patch('os.path.exists', return_value=False):
                    create_master_registry()
                    
                    registry_data = mock_save.call_args[0][0]
                    file_entry = registry_data['file_inventory'][0]
                    
                    assert file_entry['size_bytes'] == 0
                    assert file_entry['modified_at'] is None
