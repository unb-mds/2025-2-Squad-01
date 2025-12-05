"""
Unit tests for src/bronze/issues.py
Tests extraction of issues, pull requests, and issue events.
"""
import pytest
from unittest.mock import MagicMock, patch
from bronze.issues import extract_issues


class TestExtractIssues:
    """Tests for extract_issues function"""
    
    def test_extract_issues_success(self):
        """Testa extração bem-sucedida de issues"""
        mock_client = MagicMock()
        mock_config = MagicMock()
        mock_config.org_name = "test-org"
        
        mock_repos = [
            {"name": "repo1", "full_name": "test-org/repo1"}
        ]
        
        mock_issues = [
            {
                "number": 1,
                "title": "Test issue",
                "state": "open",
                "body": "Issue body"
            }
        ]
        
        mock_client.get_paginated.side_effect = [mock_issues, []]  # issues, events
        
        with patch('bronze.issues.load_json_data', return_value=mock_repos):
            with patch('bronze.issues.save_json_data', return_value="file.json") as mock_save:
                result = extract_issues(mock_client, mock_config)
                
                # Deve salvar 4 arquivos: issues_repo1, issues_all, prs_all, issue_events_all
                assert len(result) >= 3
                assert mock_save.call_count >= 3
    
    def test_extract_issues_separates_prs_from_issues(self):
        """Testa que separa PRs de issues"""
        mock_client = MagicMock()
        mock_config = MagicMock()
        
        mock_repos = [{"name": "repo1", "full_name": "test-org/repo1"}]
        
        mock_mixed_data = [
            {"number": 1, "title": "Issue"},
            {"number": 2, "title": "PR", "pull_request": {"url": "pr_url"}}
        ]
        
        mock_client.get_paginated.side_effect = [mock_mixed_data, []]
        
        saved_data = {}
        def capture_save(data, path):
            saved_data[path] = data
            return path
        
        with patch('bronze.issues.load_json_data', return_value=mock_repos):
            with patch('bronze.issues.save_json_data', side_effect=capture_save):
                extract_issues(mock_client, mock_config)
                
                # Verifica que salvou arquivos separados
                assert any('issues_' in k for k in saved_data.keys())
                assert any('prs_' in k for k in saved_data.keys())
    
    def test_extract_issues_no_repositories(self, capsys):
        """Testa retorno vazio quando não há repositórios"""
        mock_client = MagicMock()
        mock_config = MagicMock()
        
        with patch('bronze.issues.load_json_data', return_value=None):
            result = extract_issues(mock_client, mock_config)
            
            assert result == []
            captured = capsys.readouterr()
            assert "No repositories found" in captured.out
    
    def test_extract_issues_filters_event_fields(self):
        """Testa que filtra campos dos eventos para reduzir tamanho"""
        mock_client = MagicMock()
        mock_config = MagicMock()
        
        mock_repos = [{"name": "repo1", "full_name": "test-org/repo1"}]
        
        mock_events = [
            {
                "id": 123,
                "event": "closed",
                "created_at": "2024-01-01",
                "actor": {"login": "user1", "avatar_url": "url", "type": "User"},
                "issue": {"number": 1, "title": "Issue", "state": "closed"},
                "label": {"name": "bug"},  # Campo extra que deve ser filtrado
                "unnecessary_field": "data"  # Campo desnecessário
            }
        ]
        
        mock_client.get_paginated.side_effect = [[], mock_events]  # issues, events
        
        saved_data = {}
        def capture_save(data, path):
            saved_data[path] = data
            return path
        
        with patch('bronze.issues.load_json_data', return_value=mock_repos):
            with patch('bronze.issues.save_json_data', side_effect=capture_save):
                extract_issues(mock_client, mock_config)
                
                # Verifica que evento foi filtrado
                events_key = next((k for k in saved_data.keys() if 'issue_events_' in k), None)
                assert events_key is not None
                
                filtered_event = saved_data[events_key][0]
                # Verifica campos mantidos
                assert 'id' in filtered_event
                assert 'event' in filtered_event
                assert 'created_at' in filtered_event
                assert 'repo_name' in filtered_event
                assert 'actor' in filtered_event
                assert 'issue' in filtered_event
                # Verifica campos removidos
                assert 'label' not in filtered_event
                assert 'unnecessary_field' not in filtered_event
                # Verifica que actor foi simplificado
                assert filtered_event['actor'] == {'login': 'user1'}
    
    def test_extract_issues_handles_empty_issues(self):
        """Testa que lida com repositórios sem issues"""
        mock_client = MagicMock()
        mock_config = MagicMock()
        
        mock_repos = [{"name": "repo1", "full_name": "test-org/repo1"}]
        
        mock_client.get_paginated.side_effect = [None, None]  # Sem issues, sem events
        
        with patch('bronze.issues.load_json_data', return_value=mock_repos):
            with patch('bronze.issues.save_json_data', return_value="file.json") as mock_save:
                result = extract_issues(mock_client, mock_config)
                
                # Deve salvar pelo menos arquivos agregados (all)
                assert len(result) >= 3
    
    def test_extract_issues_saves_per_repo_files(self):
        """Testa que salva arquivos individuais por repositório"""
        mock_client = MagicMock()
        mock_config = MagicMock()
        
        mock_repos = [
            {"name": "repo1", "full_name": "test-org/repo1"},
            {"name": "repo2", "full_name": "test-org/repo2"}
        ]
        
        mock_issues = [{"number": 1, "title": "Issue"}]
        mock_events = [{"id": 1, "event": "closed", "created_at": "2024-01-01", "actor": {"login": "u"}, "issue": {"number": 1}}]
        
        mock_client.get_paginated.side_effect = [
            mock_issues, mock_events,  # repo1
            mock_issues, mock_events   # repo2
        ]
        
        with patch('bronze.issues.load_json_data', return_value=mock_repos):
            with patch('bronze.issues.save_json_data', return_value="file.json") as mock_save:
                extract_issues(mock_client, mock_config)
                
                # Verifica que salvou arquivos por repo
                calls = [call[0][1] for call in mock_save.call_args_list]
                assert any("issues_repo1" in c for c in calls)
                assert any("issues_repo2" in c for c in calls)
                assert any("issue_events_repo1" in c for c in calls)
                assert any("issue_events_repo2" in c for c in calls)
    
    def test_extract_issues_saves_aggregated_files(self):
        """Testa que sempre salva arquivos agregados (all)"""
        mock_client = MagicMock()
        mock_config = MagicMock()
        
        mock_repos = [{"name": "repo1", "full_name": "test-org/repo1"}]
        mock_client.get_paginated.return_value = []
        
        with patch('bronze.issues.load_json_data', return_value=mock_repos):
            with patch('bronze.issues.save_json_data', return_value="file.json") as mock_save:
                result = extract_issues(mock_client, mock_config)
                
                calls = [call[0][1] for call in mock_save.call_args_list]
                assert any("issues_all.json" in c for c in calls)
                assert any("prs_all.json" in c for c in calls)
                assert any("issue_events_all.json" in c for c in calls)
    
    def test_extract_issues_uses_cache_flag(self):
        """Testa que respeita flag use_cache"""
        mock_client = MagicMock()
        mock_config = MagicMock()
        
        mock_repos = [{"name": "repo1", "full_name": "test-org/repo1"}]
        mock_client.get_paginated.return_value = []
        
        with patch('bronze.issues.load_json_data', return_value=mock_repos):
            with patch('bronze.issues.save_json_data', return_value="file.json"):
                extract_issues(mock_client, mock_config, use_cache=False)
                
                # Verifica que use_cache foi passado
                for call in mock_client.get_paginated.call_args_list:
                    assert call[1].get('use_cache') is False
    
    def test_extract_issues_constructs_correct_urls(self):
        """Testa que constrói URLs corretas"""
        mock_client = MagicMock()
        mock_config = MagicMock()
        
        mock_repos = [{"name": "repo1", "full_name": "test-org/repo1"}]
        mock_client.get_paginated.return_value = []
        
        with patch('bronze.issues.load_json_data', return_value=mock_repos):
            with patch('bronze.issues.save_json_data', return_value="file.json"):
                extract_issues(mock_client, mock_config)
                
                # Verifica URLs chamadas
                calls = [call[0][0] for call in mock_client.get_paginated.call_args_list]
                assert any("/repos/test-org/repo1/issues" in c for c in calls)
                assert any("/repos/test-org/repo1/issues/events" in c for c in calls)
    
    def test_extract_issues_skips_invalid_repos(self, capsys):
        """Testa que pula repositórios inválidos"""
        mock_client = MagicMock()
        mock_config = MagicMock()
        
        mock_repos = [
            None,
            "invalid",
            {"name": "valid", "full_name": "test-org/valid"}
        ]
        
        mock_client.get_paginated.return_value = []
        
        with patch('bronze.issues.load_json_data', return_value=mock_repos):
            with patch('bronze.issues.save_json_data', return_value="file.json"):
                extract_issues(mock_client, mock_config)
                
                captured = capsys.readouterr()
                assert "Skipping invalid repo entry" in captured.out
    
    def test_extract_issues_skips_metadata(self):
        """Testa que ignora entrada _metadata"""
        mock_client = MagicMock()
        mock_config = MagicMock()
        
        mock_repos = [
            {"_metadata": {"timestamp": "2024-01-01"}},
            {"name": "repo1", "full_name": "test-org/repo1"}
        ]
        
        mock_client.get_paginated.return_value = []
        
        with patch('bronze.issues.load_json_data', return_value=mock_repos):
            with patch('bronze.issues.save_json_data', return_value="file.json"):
                extract_issues(mock_client, mock_config)
                
                # Deve processar apenas 1 repo (ignorando _metadata)
                # 2 chamadas por repo (issues + events)
                assert mock_client.get_paginated.call_count == 2
    
    def test_extract_issues_adds_repo_name_to_issues(self):
        """Testa que adiciona repo_name a cada issue"""
        mock_client = MagicMock()
        mock_config = MagicMock()
        
        mock_repos = [{"name": "test-repo", "full_name": "test-org/test-repo"}]
        mock_issues = [{"number": 1, "title": "Issue"}]
        
        mock_client.get_paginated.side_effect = [mock_issues, []]
        
        saved_data = {}
        def capture_save(data, path):
            saved_data[path] = data
            return path
        
        with patch('bronze.issues.load_json_data', return_value=mock_repos):
            with patch('bronze.issues.save_json_data', side_effect=capture_save):
                extract_issues(mock_client, mock_config)
                
                issues_key = next((k for k in saved_data.keys() if 'issues_test-repo' in k), None)
                assert issues_key is not None
                assert saved_data[issues_key][0]['repo_name'] == 'test-repo'
    
    def test_extract_issues_adds_repo_name_to_prs(self):
        """Testa que adiciona repo_name a cada PR"""
        mock_client = MagicMock()
        mock_config = MagicMock()
        
        mock_repos = [{"name": "test-repo", "full_name": "test-org/test-repo"}]
        mock_prs = [{"number": 1, "title": "PR", "pull_request": {"url": "url"}}]
        
        mock_client.get_paginated.side_effect = [mock_prs, []]
        
        saved_data = {}
        def capture_save(data, path):
            saved_data[path] = data
            return path
        
        with patch('bronze.issues.load_json_data', return_value=mock_repos):
            with patch('bronze.issues.save_json_data', side_effect=capture_save):
                extract_issues(mock_client, mock_config)
                
                prs_key = next((k for k in saved_data.keys() if 'prs_test-repo' in k), None)
                assert prs_key is not None
                assert saved_data[prs_key][0]['repo_name'] == 'test-repo'
    
    def test_extract_issues_prints_summary(self, capsys):
        """Testa que exibe resumo de extração"""
        mock_client = MagicMock()
        mock_config = MagicMock()
        
        mock_repos = [{"name": "repo1", "full_name": "test-org/repo1"}]
        
        mock_issues = [
            {"number": 1, "title": "Issue 1"},
            {"number": 2, "title": "PR", "pull_request": {"url": "url"}},
            {"number": 3, "title": "Issue 2"}
        ]
        
        mock_events = [
            {"id": 1, "event": "closed", "created_at": "2024-01-01", "actor": {"login": "u"}, "issue": {"number": 1}}
        ]
        
        mock_client.get_paginated.side_effect = [mock_issues, mock_events]
        
        with patch('bronze.issues.load_json_data', return_value=mock_repos):
            with patch('bronze.issues.save_json_data', return_value="file.json"):
                extract_issues(mock_client, mock_config)
                
                captured = capsys.readouterr()
                assert "Extracted" in captured.out
                assert "2 issues" in captured.out
                assert "1 PRs" in captured.out
                assert "1 events" in captured.out
    
    def test_extract_issues_handles_event_without_actor(self):
        """Testa que lida com eventos sem actor"""
        mock_client = MagicMock()
        mock_config = MagicMock()
        
        mock_repos = [{"name": "repo1", "full_name": "test-org/repo1"}]
        
        mock_events = [
            {"id": 1, "event": "closed", "created_at": "2024-01-01", "actor": None, "issue": {"number": 1}}
        ]
        
        mock_client.get_paginated.side_effect = [[], mock_events]
        
        saved_data = {}
        def capture_save(data, path):
            saved_data[path] = data
            return path
        
        with patch('bronze.issues.load_json_data', return_value=mock_repos):
            with patch('bronze.issues.save_json_data', side_effect=capture_save):
                extract_issues(mock_client, mock_config)
                
                # Verifica que evento foi salvo com actor=None
                events_key = next((k for k in saved_data.keys() if 'issue_events_' in k), None)
                assert events_key is not None
                assert saved_data[events_key][0]['actor'] is None
    
    def test_extract_issues_handles_event_without_issue(self):
        """Testa que lida com eventos sem issue"""
        mock_client = MagicMock()
        mock_config = MagicMock()
        
        mock_repos = [{"name": "repo1", "full_name": "test-org/repo1"}]
        
        mock_events = [
            {"id": 1, "event": "closed", "created_at": "2024-01-01", "actor": {"login": "u"}, "issue": None}
        ]
        
        mock_client.get_paginated.side_effect = [[], mock_events]
        
        saved_data = {}
        def capture_save(data, path):
            saved_data[path] = data
            return path
        
        with patch('bronze.issues.load_json_data', return_value=mock_repos):
            with patch('bronze.issues.save_json_data', side_effect=capture_save):
                extract_issues(mock_client, mock_config)
                
                # Verifica que evento foi salvo com issue=None
                events_key = next((k for k in saved_data.keys() if 'issue_events_' in k), None)
                assert events_key is not None
                assert saved_data[events_key][0]['issue'] is None
    
    def test_extract_issues_only_saves_pr_files_if_prs_exist(self):
        """Testa que só salva arquivo de PRs se houver PRs no repo"""
        mock_client = MagicMock()
        mock_config = MagicMock()
        
        mock_repos = [{"name": "repo1", "full_name": "test-org/repo1"}]
        
        # Apenas issues, sem PRs
        mock_issues = [{"number": 1, "title": "Issue"}]
        
        mock_client.get_paginated.side_effect = [mock_issues, []]
        
        with patch('bronze.issues.load_json_data', return_value=mock_repos):
            with patch('bronze.issues.save_json_data', return_value="file.json") as mock_save:
                extract_issues(mock_client, mock_config)
                
                # Deve salvar: issues_repo1, issues_all, prs_all, issue_events_all
                # NÃO deve salvar prs_repo1
                calls = [call[0][1] for call in mock_save.call_args_list]
                assert any("issues_repo1" in c for c in calls)
                assert not any("prs_repo1" in c for c in calls)
