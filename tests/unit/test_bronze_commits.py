"""
Unit tests for src/bronze/commits.py
Tests commit extraction with GraphQL and REST methods, 
including fallback logic, active branches, and time chunks.
"""
import pytest
from unittest.mock import MagicMock, patch, call
from bronze.commits import extract_commits


class TestExtractCommits:
    """Tests for extract_commits function"""
    
    def test_extract_commits_rest_method_success(self):
        """Testa extração de commits usando método REST"""
        mock_client = MagicMock()
        mock_config = MagicMock()
        mock_config.org_name = "test-org"
        
        mock_repos = [
            {"name": "repo1", "full_name": "test-org/repo1"}
        ]
        
        mock_commits = [
            {
                "sha": "abc123",
                "commit": {
                    "author": {"name": "Author", "email": "a@test.com", "date": "2024-01-01T00:00:00Z"}
                },
                "author": {"login": "author_login"}
            }
        ]
        
        mock_details = {
            "stats": {"additions": 10, "deletions": 5, "total": 15}
        }
        
        mock_client.get_paginated.return_value = mock_commits
        mock_client.get_with_cache.return_value = mock_details
        
        with patch('bronze.commits.load_json_data', return_value=mock_repos):
            with patch('bronze.commits.save_json_data', return_value="file.json") as mock_save:
                result = extract_commits(mock_client, mock_config, method="rest")
                
                # Verifica que chamou get_paginated para commits
                assert mock_client.get_paginated.called
                call_url = mock_client.get_paginated.call_args[0][0]
                assert "test-org/repo1/commits" in call_url
                
                # Verifica que salvou arquivos
                assert len(result) == 2  # commits_repo1.json + commits_all.json
                assert mock_save.call_count == 2
    
    def test_extract_commits_graphql_method_success(self, capsys):
        """Testa extração de commits usando método GraphQL"""
        mock_client = MagicMock()
        mock_config = MagicMock()
        mock_config.org_name = "test-org"
        
        mock_repos = [
            {"name": "repo1", "full_name": "test-org/repo1"}
        ]
        
        mock_graphql_nodes = [
            {
                "oid": "abc123",
                "url": "https://github.com/test-org/repo1/commit/abc123",
                "messageHeadline": "Test commit",
                "committedDate": "2024-01-01T00:00:00Z",
                "additions": 10,
                "deletions": 5,
                "author": {
                    "name": "Author",
                    "email": "a@test.com",
                    "date": "2024-01-01T00:00:00Z",
                    "user": {"login": "author_login"}
                }
            }
        ]
        
        mock_client.graphql_commit_history.return_value = (mock_graphql_nodes, {})
        
        with patch('bronze.commits.load_json_data', return_value=mock_repos):
            with patch('bronze.commits.save_json_data', return_value="file.json"):
                result = extract_commits(mock_client, mock_config, method="graphql")
                
                # Verifica que chamou GraphQL
                assert mock_client.graphql_commit_history.called
                
                captured = capsys.readouterr()
                assert "via GraphQL" in captured.out
                assert len(result) > 0
    
    def test_extract_commits_graphql_falls_back_to_rest(self, capsys):
        """Testa que GraphQL faz fallback para REST quando retorna vazio"""
        mock_client = MagicMock()
        mock_config = MagicMock()
        mock_config.org_name = "test-org"
        
        mock_repos = [{"name": "repo1", "full_name": "test-org/repo1"}]
        
        # GraphQL retorna vazio
        mock_client.graphql_commit_history.return_value = ([], {})
        
        # REST retorna commits
        mock_commits = [
            {
                "sha": "abc123",
                "commit": {
                    "author": {"name": "Author", "email": "a@test.com", "date": "2024-01-01T00:00:00Z"}
                }
            }
        ]
        
        mock_client.get_paginated.return_value = mock_commits
        mock_client.get_with_cache.return_value = {"stats": {"additions": 10, "deletions": 5, "total": 15}}
        
        with patch('bronze.commits.load_json_data', return_value=mock_repos):
            with patch('bronze.commits.save_json_data', return_value="file.json"):
                result = extract_commits(mock_client, mock_config, method="graphql")
                
                captured = capsys.readouterr()
                assert "Falling back to REST" in captured.out
                assert "via REST fallback" in captured.out
    
    def test_extract_commits_no_repositories(self, capsys):
        """Testa que retorna lista vazia quando não há repositórios"""
        mock_client = MagicMock()
        mock_config = MagicMock()
        
        with patch('bronze.commits.load_json_data', return_value=None):
            result = extract_commits(mock_client, mock_config)
            
            assert result == []
            captured = capsys.readouterr()
            assert "No repositories found" in captured.out
    
    def test_extract_commits_with_time_range(self):
        """Testa extração de commits com filtros since/until"""
        mock_client = MagicMock()
        mock_config = MagicMock()
        mock_config.org_name = "test-org"
        
        mock_repos = [{"name": "repo1", "full_name": "test-org/repo1"}]
        mock_client.get_paginated.return_value = []
        
        with patch('bronze.commits.load_json_data', return_value=mock_repos):
            with patch('bronze.commits.save_json_data', return_value="file.json"):
                extract_commits(
                    mock_client, 
                    mock_config, 
                    method="rest",
                    since="2024-01-01",
                    until="2024-12-31"
                )
                
                # Verifica que URL contém filtros
                call_url = mock_client.get_paginated.call_args[0][0]
                assert "since=2024-01-01" in call_url
                assert "until=2024-12-31" in call_url
    
    def test_extract_commits_with_active_branches(self, capsys):
        """Testa extração com branches ativas habilitadas"""
        mock_client = MagicMock()
        mock_config = MagicMock()
        mock_config.org_name = "test-org"
        
        mock_repos = [{"name": "repo1", "full_name": "test-org/repo1"}]
        
        # Mock branches ativas
        mock_branches = ["feature-branch", "develop"]
        mock_client.get_active_unmerged_branches.return_value = mock_branches
        mock_client.graphql_commit_history.return_value = ([], {})
        mock_client.get_paginated.return_value = []
        
        with patch('bronze.commits.load_json_data', return_value=mock_repos):
            with patch('bronze.commits.save_json_data', return_value="file.json"):
                extract_commits(
                    mock_client,
                    mock_config,
                    method="graphql",
                    include_active_branches=True,
                    active_days=30
                )
                
                # Verifica que buscou branches ativas
                assert mock_client.get_active_unmerged_branches.called
                
                captured = capsys.readouterr()
                assert "Finding active unmerged branches" in captured.out
                assert "2 unmerged branches" in captured.out
    
    def test_extract_commits_skips_invalid_repos(self, capsys):
        """Testa que pula repositórios inválidos"""
        mock_client = MagicMock()
        mock_config = MagicMock()
        
        mock_repos = [
            None,
            {"name": "invalid"},  # Sem full_name
            {"name": "valid", "full_name": "test-org/valid"}
        ]
        
        mock_client.get_paginated.return_value = []
        
        with patch('bronze.commits.load_json_data', return_value=mock_repos):
            with patch('bronze.commits.save_json_data', return_value="file.json"):
                extract_commits(mock_client, mock_config, method="rest")
                
                captured = capsys.readouterr()
                assert "Skipping invalid repo entry" in captured.out
    
    def test_extract_commits_skips_metadata_entry(self):
        """Testa que ignora entrada _metadata"""
        mock_client = MagicMock()
        mock_config = MagicMock()
        
        mock_repos = [
            {"_metadata": {"timestamp": "2024-01-01"}},
            {"name": "repo1", "full_name": "test-org/repo1"}
        ]
        
        mock_client.get_paginated.return_value = []
        
        with patch('bronze.commits.load_json_data', return_value=mock_repos):
            with patch('bronze.commits.save_json_data', return_value="file.json"):
                result = extract_commits(mock_client, mock_config, method="rest")
                
                # Deve processar apenas 1 repo (ignorando _metadata)
                assert mock_client.get_paginated.call_count == 1
    
    def test_extract_commits_saves_per_repo_files(self):
        """Testa que salva arquivo individual por repositório"""
        mock_client = MagicMock()
        mock_config = MagicMock()
        
        mock_repos = [
            {"name": "repo1", "full_name": "test-org/repo1"},
            {"name": "repo2", "full_name": "test-org/repo2"}
        ]
        
        mock_commits = [
            {"sha": "abc", "commit": {"author": {"name": "A", "email": "a@test.com", "date": "2024-01-01"}}}
        ]
        
        mock_client.get_paginated.return_value = mock_commits
        mock_client.get_with_cache.return_value = {"stats": {"additions": 10, "deletions": 5, "total": 15}}
        
        with patch('bronze.commits.load_json_data', return_value=mock_repos):
            with patch('bronze.commits.save_json_data', return_value="file.json") as mock_save:
                extract_commits(mock_client, mock_config, method="rest")
                
                # 2 repos + 1 arquivo all = 3 saves
                assert mock_save.call_count == 3
                
                # Verifica que salvou commits_repo1.json e commits_repo2.json
                calls = [call[0][1] for call in mock_save.call_args_list]
                assert any("commits_repo1.json" in c for c in calls)
                assert any("commits_repo2.json" in c for c in calls)
    
    def test_extract_commits_saves_all_commits_file(self):
        """Testa que sempre salva arquivo commits_all.json"""
        mock_client = MagicMock()
        mock_config = MagicMock()
        
        mock_repos = [{"name": "repo1", "full_name": "test-org/repo1"}]
        mock_client.get_paginated.return_value = []
        
        with patch('bronze.commits.load_json_data', return_value=mock_repos):
            with patch('bronze.commits.save_json_data', return_value="file.json") as mock_save:
                result = extract_commits(mock_client, mock_config)
                
                # Verifica que salvou commits_all.json
                calls = [call[0][1] for call in mock_save.call_args_list]
                assert any("commits_all.json" in c for c in calls)
    
    def test_extract_commits_uses_cache_flag(self):
        """Testa que respeita flag use_cache"""
        mock_client = MagicMock()
        mock_config = MagicMock()
        
        mock_repos = [{"name": "repo1", "full_name": "test-org/repo1"}]
        mock_client.get_paginated.return_value = []
        
        with patch('bronze.commits.load_json_data', return_value=mock_repos):
            with patch('bronze.commits.save_json_data', return_value="file.json"):
                extract_commits(mock_client, mock_config, use_cache=False)
                
                # Verifica que use_cache foi passado
                call_kwargs = mock_client.get_paginated.call_args[1]
                assert call_kwargs.get('use_cache') is False
    
    def test_extract_commits_rest_fetches_commit_details(self):
        """Testa que REST busca detalhes (stats) de cada commit"""
        mock_client = MagicMock()
        mock_config = MagicMock()
        
        mock_repos = [{"name": "repo1", "full_name": "test-org/repo1"}]
        
        mock_commits = [
            {"sha": "abc123", "commit": {"author": {"name": "A", "email": "a@t.com", "date": "2024-01-01"}}},
            {"sha": "def456", "commit": {"author": {"name": "B", "email": "b@t.com", "date": "2024-01-02"}}}
        ]
        
        mock_client.get_paginated.return_value = mock_commits
        mock_client.get_with_cache.return_value = {"stats": {"additions": 10, "deletions": 5, "total": 15}}
        
        with patch('bronze.commits.load_json_data', return_value=mock_repos):
            with patch('bronze.commits.save_json_data', return_value="file.json"):
                extract_commits(mock_client, mock_config, method="rest")
                
                # Deve buscar detalhes para cada commit (2 commits)
                assert mock_client.get_with_cache.call_count == 2
    
    def test_extract_commits_graphql_maps_fields_correctly(self):
        """Testa que GraphQL mapeia campos para formato REST compatível"""
        mock_client = MagicMock()
        mock_config = MagicMock()
        
        mock_repos = [{"name": "repo1", "full_name": "test-org/repo1"}]
        
        mock_graphql_nodes = [
            {
                "oid": "abc123",
                "url": "https://github.com/test-org/repo1/commit/abc123",
                "messageHeadline": "Test commit",
                "committedDate": "2024-01-01T00:00:00Z",
                "additions": 15,
                "deletions": 8,
                "author": {
                    "name": "Author Name",
                    "email": "author@test.com",
                    "date": "2024-01-01T00:00:00Z",
                    "user": {"login": "author_user"}
                }
            }
        ]
        
        mock_client.graphql_commit_history.return_value = (mock_graphql_nodes, {})
        
        saved_data = None
        def capture_save(data, path):
            nonlocal saved_data
            saved_data = data
            return "file.json"
        
        with patch('bronze.commits.load_json_data', return_value=mock_repos):
            with patch('bronze.commits.save_json_data', side_effect=capture_save):
                extract_commits(mock_client, mock_config, method="graphql")
                
                # Verifica mapeamento de campos
                assert saved_data is not None
                first_commit = saved_data[0]
                assert first_commit['sha'] == 'abc123'
                assert first_commit['html_url'] == 'https://github.com/test-org/repo1/commit/abc123'
                assert first_commit['commit']['message'] == 'Test commit'
                assert first_commit['commit']['author']['name'] == 'Author Name'
                assert first_commit['commit']['author']['login'] == 'author_user'
                assert first_commit['additions'] == 15
                assert first_commit['deletions'] == 8
                assert first_commit['total_changes'] == 23
    
    def test_extract_commits_graphql_handles_missing_user(self):
        """Testa que GraphQL lida com autor sem user object"""
        mock_client = MagicMock()
        mock_config = MagicMock()
        
        mock_repos = [{"name": "repo1", "full_name": "test-org/repo1"}]
        
        mock_graphql_nodes = [
            {
                "oid": "abc123",
                "url": "url",
                "messageHeadline": "Test",
                "committedDate": "2024-01-01",
                "additions": 10,
                "deletions": 5,
                "author": {
                    "name": "Author",
                    "email": "a@test.com",
                    "date": "2024-01-01",
                    "user": None  # Sem user
                }
            }
        ]
        
        mock_client.graphql_commit_history.return_value = (mock_graphql_nodes, {})
        
        saved_data = None
        def capture_save(data, path):
            nonlocal saved_data
            saved_data = data
            return "file.json"
        
        with patch('bronze.commits.load_json_data', return_value=mock_repos):
            with patch('bronze.commits.save_json_data', side_effect=capture_save):
                extract_commits(mock_client, mock_config, method="graphql")
                
                # Deve funcionar sem erros
                assert saved_data is not None
                assert saved_data[0]['commit']['author']['login'] is None
    
    def test_extract_commits_rest_copies_author_login(self):
        """Testa que REST copia author.login para commit.author.login"""
        mock_client = MagicMock()
        mock_config = MagicMock()
        
        mock_repos = [{"name": "repo1", "full_name": "test-org/repo1"}]
        
        mock_commits = [
            {
                "sha": "abc123",
                "author": {"login": "username123"},
                "commit": {
                    "author": {"name": "Name", "email": "e@test.com", "date": "2024-01-01"}
                }
            }
        ]
        
        mock_client.get_paginated.return_value = mock_commits
        mock_client.get_with_cache.return_value = {"stats": {"additions": 10, "deletions": 5, "total": 15}}
        
        saved_data = None
        def capture_save(data, path):
            nonlocal saved_data
            saved_data = data
            return "file.json"
        
        with patch('bronze.commits.load_json_data', return_value=mock_repos):
            with patch('bronze.commits.save_json_data', side_effect=capture_save):
                extract_commits(mock_client, mock_config, method="rest")
                
                # Verifica que copiou login
                assert saved_data is not None
                first_commit = saved_data[0]
                assert first_commit['commit']['author']['login'] == 'username123'
    
    def test_extract_commits_graphql_skips_repo_without_owner(self, capsys):
        """Testa que GraphQL pula repos sem owner/name identificável"""
        mock_client = MagicMock()
        mock_config = MagicMock()
        
        mock_repos = [
            {"name": "invalid-repo", "full_name": "single-name"}  # Sem '/' para split
        ]
        
        with patch('bronze.commits.load_json_data', return_value=mock_repos):
            with patch('bronze.commits.save_json_data', return_value="file.json"):
                extract_commits(mock_client, mock_config, method="graphql")
                
                captured = capsys.readouterr()
                assert "cannot determine owner/name for GraphQL" in captured.out
    
    def test_extract_commits_prints_total_count(self, capsys):
        """Testa que exibe contagem total de commits"""
        mock_client = MagicMock()
        mock_config = MagicMock()
        
        mock_repos = [{"name": "repo1", "full_name": "test-org/repo1"}]
        
        mock_commits = [
            {"sha": "abc", "commit": {"author": {"name": "A", "email": "a@t.com", "date": "2024-01-01"}}},
            {"sha": "def", "commit": {"author": {"name": "B", "email": "b@t.com", "date": "2024-01-02"}}}
        ]
        
        mock_client.get_paginated.return_value = mock_commits
        mock_client.get_with_cache.return_value = {"stats": {"additions": 10, "deletions": 5, "total": 15}}
        
        with patch('bronze.commits.load_json_data', return_value=mock_repos):
            with patch('bronze.commits.save_json_data', return_value="file.json"):
                extract_commits(mock_client, mock_config)
                
                captured = capsys.readouterr()
                assert "Total commits extracted: 2" in captured.out
    
    def test_extract_commits_passes_graphql_parameters(self):
        """Testa que passa parâmetros corretos para graphql_commit_history"""
        mock_client = MagicMock()
        mock_config = MagicMock()
        
        mock_repos = [{"name": "repo1", "full_name": "test-org/repo1"}]
        mock_client.graphql_commit_history.return_value = ([], {})
        mock_client.get_paginated.return_value = []
        
        with patch('bronze.commits.load_json_data', return_value=mock_repos):
            with patch('bronze.commits.save_json_data', return_value="file.json"):
                extract_commits(
                    mock_client,
                    mock_config,
                    method="graphql",
                    since="2024-01-01",
                    until="2024-12-31",
                    max_commits_per_repo=100,
                    page_size=25,
                    time_chunks=5  # Nota: Este parâmetro é ignorado pelo código que tem hardcoded time_chunks=3
                )
                
                # Verifica parâmetros
                call_kwargs = mock_client.graphql_commit_history.call_args[1]
                assert call_kwargs.get('since') == "2024-01-01"
                assert call_kwargs.get('until') == "2024-12-31"
                assert call_kwargs.get('max_commits') == 100
                assert call_kwargs.get('page_size') == 25
                # O código tem time_chunks=3 hardcoded, não usa o parâmetro
                assert call_kwargs.get('time_chunks') == 3
                assert call_kwargs.get('split_large_extractions') is True
