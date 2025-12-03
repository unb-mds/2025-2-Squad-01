"""
Testes unitários para o módulo bronze_extract.

Testa a orquestração da extração da camada Bronze.
"""

import pytest
from unittest.mock import patch, MagicMock
import sys


class TestBronzeExtract:
    """Testes para o script bronze_extract"""
    
    def test_main_extracts_all_layers(self, capsys):
        """Testa que main extrai todas as camadas Bronze"""
        with patch('sys.argv', ['bronze_extract.py', '--token', 'test-token']):
            with patch('bronze.repositories.extract_repositories', return_value=['repo.json']):
                with patch('bronze.issues.extract_issues', return_value=['issues.json']):
                    with patch('bronze.commits.extract_commits', return_value=['commits.json']):
                        with patch('bronze.members.extract_members', return_value=['members.json']):
                            with patch('utils.github_api.update_data_registry'):
                                with patch('utils.github_api.GitHubAPIClient'):
                                    from src import bronze_extract
                                    
                                    bronze_extract.main()
        
        captured = capsys.readouterr()
        assert "Starting Bronze layer extraction" in captured.out
        assert "Extracting repositories" in captured.out
        assert "Extracting issues and pull requests" in captured.out
        assert "Extracting commits" in captured.out
        assert "Extracting organization members" in captured.out
        assert "Bronze extraction completed successfully" in captured.out
    
    def test_main_with_org_argument(self, capsys):
        """Testa que main aceita argumento --org"""
        with patch('sys.argv', ['bronze_extract.py', '--token', 'test-token', '--org', 'my-org']):
            with patch('bronze.repositories.extract_repositories', return_value=[]):
                with patch('bronze.issues.extract_issues', return_value=[]):
                    with patch('bronze.commits.extract_commits', return_value=[]):
                        with patch('bronze.members.extract_members', return_value=[]):
                            with patch('utils.github_api.update_data_registry'):
                                with patch('utils.github_api.GitHubAPIClient'):
                                    from src import bronze_extract
                                    
                                    bronze_extract.main()
        
        captured = capsys.readouterr()
        assert "organization: my-org" in captured.out

    
    def test_main_with_cache_flag(self):
        """Testa que main passa o flag --cache para os extractors"""
        with patch('sys.argv', ['bronze_extract.py', '--token', 'test-token', '--cache']):
            with patch('bronze.repositories.extract_repositories') as mock_repos:
                with patch('bronze.issues.extract_issues') as mock_issues:
                    with patch('bronze.commits.extract_commits') as mock_commits:
                        with patch('bronze.members.extract_members') as mock_members:
                            with patch('utils.github_api.update_data_registry'):
                                with patch('utils.github_api.GitHubAPIClient'):
                                    mock_repos.return_value = []
                                    mock_issues.return_value = []
                                    mock_commits.return_value = []
                                    mock_members.return_value = []
                                    
                                    from src import bronze_extract
                                    
                                    bronze_extract.main()
                                    
                                    # Verify use_cache=True was passed
                                    assert mock_repos.call_args[1]['use_cache'] is True
                                    assert mock_issues.call_args[1]['use_cache'] is True
                                    assert mock_commits.call_args[1]['use_cache'] is True
                                    assert mock_members.call_args[1]['use_cache'] is True
    
    def test_main_with_commits_method_graphql(self):
        """Testa que main aceita --commits-method graphql"""
        with patch('sys.argv', ['bronze_extract.py', '--token', 'test-token', '--commits-method', 'graphql']):
            with patch('bronze.repositories.extract_repositories', return_value=[]):
                with patch('bronze.issues.extract_issues', return_value=[]):
                    with patch('bronze.commits.extract_commits') as mock_commits:
                        with patch('bronze.members.extract_members', return_value=[]):
                            with patch('utils.github_api.update_data_registry'):
                                with patch('utils.github_api.GitHubAPIClient'):
                                    mock_commits.return_value = []
                                    
                                    from src import bronze_extract
                                    
                                    bronze_extract.main()
                                    
                                    assert mock_commits.call_args[1]['method'] == 'graphql'
    
    def test_main_with_time_range(self):
        """Testa que main aceita argumentos --since e --until"""
        with patch('sys.argv', ['bronze_extract.py', '--token', 'test-token', 
                                '--since', '2024-01-01T00:00:00Z', 
                                '--until', '2024-12-31T23:59:59Z']):
            with patch('bronze.repositories.extract_repositories', return_value=[]):
                with patch('bronze.issues.extract_issues', return_value=[]):
                    with patch('bronze.commits.extract_commits') as mock_commits:
                        with patch('bronze.members.extract_members', return_value=[]):
                            with patch('utils.github_api.update_data_registry'):
                                with patch('utils.github_api.GitHubAPIClient'):
                                    mock_commits.return_value = []
                                    
                                    from src import bronze_extract
                                    
                                    bronze_extract.main()
                                    
                                    assert mock_commits.call_args[1]['since'] == '2024-01-01T00:00:00Z'
                                    assert mock_commits.call_args[1]['until'] == '2024-12-31T23:59:59Z'
    
    def test_main_with_max_commits_per_repo(self):
        """Testa que main aceita --max-commits-per-repo"""
        with patch('sys.argv', ['bronze_extract.py', '--token', 'test-token', '--max-commits-per-repo', '1000']):
            with patch('bronze.repositories.extract_repositories', return_value=[]):
                with patch('bronze.issues.extract_issues', return_value=[]):
                    with patch('bronze.commits.extract_commits') as mock_commits:
                        with patch('bronze.members.extract_members', return_value=[]):
                            with patch('utils.github_api.update_data_registry'):
                                with patch('utils.github_api.GitHubAPIClient'):
                                    mock_commits.return_value = []
                                    
                                    from src import bronze_extract
                                    
                                    bronze_extract.main()
                                    
                                    assert mock_commits.call_args[1]['max_commits_per_repo'] == 1000
    
    def test_main_with_active_branches(self):
        """Testa que main aceita --include-active-branches e --active-days"""
        with patch('sys.argv', ['bronze_extract.py', '--token', 'test-token', 
                                '--include-active-branches', '--active-days', '60']):
            with patch('bronze.repositories.extract_repositories', return_value=[]):
                with patch('bronze.issues.extract_issues', return_value=[]):
                    with patch('bronze.commits.extract_commits') as mock_commits:
                        with patch('bronze.members.extract_members', return_value=[]):
                            with patch('utils.github_api.update_data_registry'):
                                with patch('utils.github_api.GitHubAPIClient'):
                                    mock_commits.return_value = []
                                    
                                    from src import bronze_extract
                                    
                                    bronze_extract.main()
                                    
                                    assert mock_commits.call_args[1]['include_active_branches'] is True
                                    assert mock_commits.call_args[1]['active_days'] == 60
    
    def test_main_with_custom_page_size(self):
        """Testa que main aceita --commits-page-size"""
        with patch('sys.argv', ['bronze_extract.py', '--token', 'test-token', '--commits-page-size', '100']):
            with patch('bronze.repositories.extract_repositories', return_value=[]):
                with patch('bronze.issues.extract_issues', return_value=[]):
                    with patch('bronze.commits.extract_commits') as mock_commits:
                        with patch('bronze.members.extract_members', return_value=[]):
                            with patch('utils.github_api.update_data_registry'):
                                with patch('utils.github_api.GitHubAPIClient'):
                                    mock_commits.return_value = []
                                    
                                    from src import bronze_extract
                                    
                                    bronze_extract.main()
                                    
                                    assert mock_commits.call_args[1]['page_size'] == 100
    
    def test_main_with_time_chunks(self):
        """Testa que main aceita --time-chunks"""
        with patch('sys.argv', ['bronze_extract.py', '--token', 'test-token', '--time-chunks', '5']):
            with patch('bronze.repositories.extract_repositories', return_value=[]):
                with patch('bronze.issues.extract_issues', return_value=[]):
                    with patch('bronze.commits.extract_commits') as mock_commits:
                        with patch('bronze.members.extract_members', return_value=[]):
                            with patch('utils.github_api.update_data_registry'):
                                with patch('utils.github_api.GitHubAPIClient'):
                                    mock_commits.return_value = []
                                    
                                    from src import bronze_extract
                                    
                                    bronze_extract.main()
                                    
                                    assert mock_commits.call_args[1]['time_chunks'] == 5
    
    def test_main_displays_all_files(self, capsys):
        """Testa que main exibe todos os arquivos gerados"""
        with patch('sys.argv', ['bronze_extract.py', '--token', 'test-token']):
            with patch('bronze.repositories.extract_repositories', return_value=['repo1.json', 'repo2.json']):
                with patch('bronze.issues.extract_issues', return_value=['issues.json']):
                    with patch('bronze.commits.extract_commits', return_value=['commits.json']):
                        with patch('bronze.members.extract_members', return_value=['members.json']):
                            with patch('utils.github_api.update_data_registry'):
                                with patch('utils.github_api.GitHubAPIClient'):
                                    from src import bronze_extract
                                    
                                    bronze_extract.main()
        
        captured = capsys.readouterr()
        assert "Generated 5 files" in captured.out
        assert "repo1.json" in captured.out
        assert "repo2.json" in captured.out
        assert "issues.json" in captured.out
        assert "commits.json" in captured.out
        assert "members.json" in captured.out
    
    def test_main_handles_extraction_error(self, capsys):
        """Testa tratamento de erro durante extração"""
        with patch('sys.argv', ['bronze_extract.py', '--token', 'test-token']):
            with patch('bronze.repositories.extract_repositories', side_effect=Exception("API Error")):
                with patch('utils.github_api.GitHubAPIClient'):
                    from src import bronze_extract
                    
                    with pytest.raises(SystemExit) as exc_info:
                        bronze_extract.main()
                    
                    assert exc_info.value.code == 1
        
        captured = capsys.readouterr()
        assert "Error during bronze extraction" in captured.out
        assert "API Error" in captured.out
    
    def test_main_extracts_in_correct_order(self):
        """Testa que as extrações são feitas na ordem correta"""
        call_order = []
        
        def track_repos(*args, **kwargs):
            call_order.append('repos')
            return []
        
        def track_issues(*args, **kwargs):
            call_order.append('issues')
            return []
        
        def track_commits(*args, **kwargs):
            call_order.append('commits')
            return []
        
        def track_members(*args, **kwargs):
            call_order.append('members')
            return []
        
        with patch('sys.argv', ['bronze_extract.py', '--token', 'test-token']):
            with patch('bronze.repositories.extract_repositories', side_effect=track_repos):
                with patch('bronze.issues.extract_issues', side_effect=track_issues):
                    with patch('bronze.commits.extract_commits', side_effect=track_commits):
                        with patch('bronze.members.extract_members', side_effect=track_members):
                            with patch('utils.github_api.update_data_registry'):
                                with patch('utils.github_api.GitHubAPIClient'):
                                    from src import bronze_extract
                                    
                                    bronze_extract.main()
        
        assert call_order == ['repos', 'issues', 'commits', 'members']
    
    def test_main_displays_timestamp(self, capsys):
        """Testa que main exibe timestamp de início"""
        with patch('sys.argv', ['bronze_extract.py', '--token', 'test-token']):
            with patch('bronze.repositories.extract_repositories', return_value=[]):
                with patch('bronze.issues.extract_issues', return_value=[]):
                    with patch('bronze.commits.extract_commits', return_value=[]):
                        with patch('bronze.members.extract_members', return_value=[]):
                            with patch('utils.github_api.update_data_registry'):
                                with patch('utils.github_api.GitHubAPIClient'):
                                    from src import bronze_extract
                                    
                                    bronze_extract.main()
        
        captured = capsys.readouterr()
        assert "Started at:" in captured.out
    
    def test_main_requires_token_argument(self):
        """Testa que main requer o argumento --token"""
        with patch('sys.argv', ['bronze_extract.py']):
            from src import bronze_extract
            
            with pytest.raises(SystemExit):
                bronze_extract.main()
    
    def test_main_initializes_github_client(self, capsys):
        """Testa que main inicializa o GitHubAPIClient com o token"""
        with patch('sys.argv', ['bronze_extract.py', '--token', 'my-secret-token']):
            with patch('bronze.repositories.extract_repositories', return_value=[]):
                with patch('bronze.issues.extract_issues', return_value=[]):
                    with patch('bronze.commits.extract_commits', return_value=[]):
                        with patch('bronze.members.extract_members', return_value=[]):
                            with patch('utils.github_api.update_data_registry'):
                                with patch('utils.github_api.GitHubAPIClient'):
                                    from src import bronze_extract
                                    
                                    bronze_extract.main()
        
        # Verifica que o processo foi concluído sem erro
        captured = capsys.readouterr()
        assert "Bronze extraction completed successfully" in captured.out
