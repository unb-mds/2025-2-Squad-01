"""
Testes unitários para o módulo fetch_issues.

Testa a extração de issues dos repositórios.
"""

import pytest
from unittest.mock import patch, mock_open, MagicMock
import json


class TestFetchIssues:
    """Testes para o script fetch_issues"""
    
    def test_fetches_issues_from_repos(self):
        """Testa que o script busca issues de todos os repositórios"""
        mock_repos = [
            {"full_name": "org/repo1", "issues_url": "https://api.github.com/repos/org/repo1/issues{/number}"},
            {"full_name": "org/repo2", "issues_url": "https://api.github.com/repos/org/repo2/issues{/number}"}
        ]
        
        mock_issues = [
            {
                "number": 1,
                "title": "Issue 1",
                "state": "open",
                "created_at": "2024-01-01T00:00:00Z",
                "closed_at": None,
                "html_url": "https://github.com/org/repo1/issues/1",
                "user": {"login": "user1"},
                "labels": [{"name": "bug"}],
                "body": "Issue body"
            }
        ]
        
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = mock_issues
        
        with patch('builtins.open', mock_open(read_data=json.dumps(mock_repos))):
            with patch('requests.get', return_value=mock_response) as mock_get:
                with patch('os.makedirs'):
                    with patch('json.dump') as mock_dump:
                        # Import e executa o script
                        import importlib
                        import src.fetch_issues
                        importlib.reload(src.fetch_issues)
                        
                        # Verifica que requests.get foi chamado
                        assert mock_get.called
    
    def test_removes_template_from_issues_url(self):
        """Testa que remove o template {/number} da URL de issues"""
        mock_repos = [
            {"full_name": "org/repo1", "issues_url": "https://api.github.com/repos/org/repo1/issues{/number}"}
        ]
        
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = []
        
        with patch('builtins.open', mock_open(read_data=json.dumps(mock_repos))):
            with patch('requests.get', return_value=mock_response) as mock_get:
                with patch('os.makedirs'):
                    with patch('json.dump'):
                        import importlib
                        import src.fetch_issues
                        importlib.reload(src.fetch_issues)
                        
                        # Verifica que a URL foi chamada sem {/number}
                        call_url = mock_get.call_args[0][0]
                        assert "{/number}" not in call_url
                        assert "state=all" in call_url
    
    def test_skips_repos_without_full_name(self):
        """Testa que ignora repositórios sem full_name"""
        mock_repos = [
            {"name": "repo1"},  # Sem full_name
            {"full_name": "org/repo2", "issues_url": "https://api.github.com/repos/org/repo2/issues{/number}"}
        ]
        
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = []
        
        with patch('builtins.open', mock_open(read_data=json.dumps(mock_repos))):
            with patch('requests.get', return_value=mock_response) as mock_get:
                with patch('os.makedirs'):
                    with patch('json.dump'):
                        import importlib
                        import src.fetch_issues
                        importlib.reload(src.fetch_issues)
                        
                        # Deve ter sido chamado (não importa quantas vezes)
                        assert mock_get.called
    
    def test_filters_out_pull_requests(self):
        """Testa que filtra pull requests (mantém apenas issues)"""
        mock_repos = [
            {"full_name": "org/repo1", "issues_url": "https://api.github.com/repos/org/repo1/issues{/number}"}
        ]
        
        mock_issues_response = [
            {
                "number": 1,
                "title": "Real Issue",
                "state": "open",
                "created_at": "2024-01-01T00:00:00Z",
                "html_url": "https://github.com/org/repo1/issues/1",
                "user": {"login": "user1"},
                "labels": []
            },
            {
                "number": 2,
                "title": "Pull Request",
                "state": "open",
                "created_at": "2024-01-01T00:00:00Z",
                "html_url": "https://github.com/org/repo1/pull/2",
                "user": {"login": "user2"},
                "labels": [],
                "pull_request": {"url": "https://api.github.com/repos/org/repo1/pulls/2"}
            }
        ]
        
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = mock_issues_response
        
        captured_data = {}
        
        def capture_dump(data, f, **kwargs):
            captured_data.update(data)
        
        with patch('builtins.open', mock_open(read_data=json.dumps(mock_repos))):
            with patch('requests.get', return_value=mock_response):
                with patch('os.makedirs'):
                    with patch('json.dump', side_effect=capture_dump):
                        import importlib
                        import src.fetch_issues
                        importlib.reload(src.fetch_issues)
                        
                        # Verifica que apenas a issue real foi salva
                        assert len(captured_data["org/repo1"]) == 1
                        assert captured_data["org/repo1"][0]["title"] == "Real Issue"
    
    def test_handles_api_error(self, capsys):
        """Testa tratamento de erro de API"""
        mock_repos = [
            {"full_name": "org/repo1", "issues_url": "https://api.github.com/repos/org/repo1/issues{/number}"}
        ]
        
        mock_response = MagicMock()
        mock_response.status_code = 404
        
        with patch('builtins.open', mock_open(read_data=json.dumps(mock_repos))):
            with patch('requests.get', return_value=mock_response):
                with patch('os.makedirs'):
                    with patch('json.dump'):
                        import importlib
                        import src.fetch_issues
                        importlib.reload(src.fetch_issues)
        
        captured = capsys.readouterr()
        assert "Erro ao buscar issues" in captured.out
        assert "404" in captured.out
    
    def test_creates_output_directory(self):
        """Testa que cria o diretório de saída"""
        mock_repos = [
            {"full_name": "org/repo1", "issues_url": "https://api.github.com/repos/org/repo1/issues{/number}"}
        ]
        
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = []
        
        with patch('builtins.open', mock_open(read_data=json.dumps(mock_repos))):
            with patch('requests.get', return_value=mock_response):
                with patch('os.makedirs') as mock_makedirs:
                    with patch('json.dump'):
                        import importlib
                        import src.fetch_issues
                        importlib.reload(src.fetch_issues)
                        
                        mock_makedirs.assert_called_once_with("src/data/extractions", exist_ok=True)
    
    def test_extracts_all_issue_fields(self):
        """Testa que extrai todos os campos necessários das issues"""
        mock_repos = [
            {"full_name": "org/repo1", "issues_url": "https://api.github.com/repos/org/repo1/issues{/number}"}
        ]
        
        mock_issues_response = [
            {
                "number": 42,
                "title": "Test Issue",
                "state": "closed",
                "created_at": "2024-01-01T00:00:00Z",
                "closed_at": "2024-01-02T00:00:00Z",
                "html_url": "https://github.com/org/repo1/issues/42",
                "user": {"login": "testuser"},
                "labels": [{"name": "bug"}, {"name": "urgent"}],
                "body": "Issue description here"
            }
        ]
        
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = mock_issues_response
        
        captured_data = {}
        
        def capture_dump(data, f, **kwargs):
            captured_data.update(data)
        
        with patch('builtins.open', mock_open(read_data=json.dumps(mock_repos))):
            with patch('requests.get', return_value=mock_response):
                with patch('os.makedirs'):
                    with patch('json.dump', side_effect=capture_dump):
                        import importlib
                        import src.fetch_issues
                        importlib.reload(src.fetch_issues)
                        
                        issue = captured_data["org/repo1"][0]
                        assert issue["number"] == 42
                        assert issue["title"] == "Test Issue"
                        assert issue["state"] == "closed"
                        assert issue["created_at"] == "2024-01-01T00:00:00Z"
                        assert issue["closed_at"] == "2024-01-02T00:00:00Z"
                        assert issue["url"] == "https://github.com/org/repo1/issues/42"
                        assert issue["user"] == "testuser"
                        assert issue["labels"] == ["bug", "urgent"]
                        assert issue["body"] == "Issue description here"
    
    def test_uses_github_token_from_env(self):
        """Testa que usa o token do GitHub das variáveis de ambiente"""
        mock_repos = [
            {"full_name": "org/repo1", "issues_url": "https://api.github.com/repos/org/repo1/issues{/number}"}
        ]
        
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = []
        
        with patch('builtins.open', mock_open(read_data=json.dumps(mock_repos))):
            with patch('requests.get', return_value=mock_response) as mock_get:
                with patch('os.makedirs'):
                    with patch('json.dump'):
                        with patch.dict('os.environ', {'GH_TOKEN': 'test-token'}):
                            import importlib
                            import src.fetch_issues
                            importlib.reload(src.fetch_issues)
                            
                            # Verifica que o header de autorização foi usado
                            call_headers = mock_get.call_args[1]['headers']
                            assert 'Authorization' in call_headers
    
    def test_builds_default_url_when_issues_url_missing(self):
        """Testa que constrói URL padrão quando issues_url não existe"""
        mock_repos = [
            {"full_name": "org/repo1"}  # Sem issues_url
        ]
        
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = []
        
        with patch('builtins.open', mock_open(read_data=json.dumps(mock_repos))):
            with patch('requests.get', return_value=mock_response) as mock_get:
                with patch('os.makedirs'):
                    with patch('json.dump'):
                        import importlib
                        import src.fetch_issues
                        importlib.reload(src.fetch_issues)
                        
                        # Verifica que usou URL padrão
                        call_url = mock_get.call_args[0][0]
                        assert "https://api.github.com/repos/org/repo1/issues" in call_url
