import pytest
import json
import os
from unittest.mock import Mock, patch, MagicMock, call
from utils.github_api import GitHubAPIClient, OrganizationConfig, update_data_registry

def test_client_initialization(tmp_path):
    """Testa inicialização do cliente"""
    cache_dir = str(tmp_path / "cache")
    client = GitHubAPIClient(token="test_token", cache_dir=cache_dir)
    
    assert client.token == "test_token"
    assert client.headers["Authorization"] == "Bearer test_token"
    assert os.path.exists(cache_dir)

def test_get_cache_key():
    """Testa geração de chave de cache"""
    client = GitHubAPIClient(token="test")
    
    key1 = client._get_cache_key("https://api.github.com/repos/test/repo")
    key2 = client._get_cache_key("https://api.github.com/repos/test/repo")
    key3 = client._get_cache_key("https://api.github.com/repos/other/repo")
    
    assert key1 == key2
    assert key1 != key3
    assert key1.endswith(".json")

def test_cache_set_and_get(tmp_path):
    """Testa armazenamento e recuperação de cache"""
    cache_dir = str(tmp_path / "cache")
    client = GitHubAPIClient(token="test", cache_dir=cache_dir)
    
    test_data = {"test": "data", "value": 123}
    cache_key = "test_key"
    
    client._cache_set(cache_key, test_data)
    cached = client._cache_get(cache_key)
    
    assert cached == test_data

def test_cache_get_missing(tmp_path):
    """Testa recuperação de cache inexistente"""
    cache_dir = str(tmp_path / "cache")
    client = GitHubAPIClient(token="test", cache_dir=cache_dir)
    
    cached = client._cache_get("nonexistent_key")
    assert cached is None

def test_get_with_cache_from_cache(tmp_path, capsys):
    """Testa get_with_cache usando cache"""
    cache_dir = str(tmp_path / "cache")
    client = GitHubAPIClient(token="test", cache_dir=cache_dir)
    
    test_url = "https://api.github.com/test"
    test_data = {"cached": True}
    client._cache_set(test_url, test_data)
    
    result = client.get_with_cache(test_url, use_cache=True)
    
    assert result == test_data
    captured = capsys.readouterr()
    assert "Using cached data" in captured.out

def test_get_with_cache_api_call(tmp_path):
    """Testa get_with_cache fazendo chamada à API"""
    cache_dir = str(tmp_path / "cache")
    client = GitHubAPIClient(token="test", cache_dir=cache_dir)
    
    test_url = "https://api.github.com/test"
    api_response = {"from_api": True}
    
    with patch('requests.get') as mock_get:
        mock_response = Mock()
        mock_response.status_code = 200
        mock_response.json.return_value = api_response
        mock_response.headers = {
            'X-RateLimit-Remaining': '5000',
            'X-RateLimit-Limit': '5000'
        }
        mock_get.return_value = mock_response
        
        result = client.get_with_cache(test_url, use_cache=False)
        
        assert result == api_response
        mock_get.assert_called_once()

def test_get_with_cache_404(tmp_path, capsys):
    """Testa get_with_cache com erro 404"""
    cache_dir = str(tmp_path / "cache")
    client = GitHubAPIClient(token="test", cache_dir=cache_dir)
    
    with patch('requests.get') as mock_get:
        mock_response = Mock()
        mock_response.status_code = 404
        mock_get.return_value = mock_response
        
        result = client.get_with_cache("https://api.github.com/test", use_cache=False)
        
        assert result is None
        captured = capsys.readouterr()
        assert "404" in captured.out

def test_get_with_cache_403_forbidden(tmp_path, capsys):
    """Testa get_with_cache com 403 (não rate limit)"""
    cache_dir = str(tmp_path / "cache")
    client = GitHubAPIClient(token="test", cache_dir=cache_dir)
    
    with patch('requests.get') as mock_get:
        mock_response = Mock()
        mock_response.status_code = 403
        mock_response.text = "Access forbidden - private resource"
        mock_get.return_value = mock_response
        
        result = client.get_with_cache("https://api.github.com/test", use_cache=False)
        
        assert result is None
        captured = capsys.readouterr()
        assert "forbidden" in captured.out.lower()

@patch('time.sleep', return_value=None)
def test_get_with_cache_retry_on_500(mock_sleep, tmp_path):
    """Testa retry em erros 5xx"""
    cache_dir = str(tmp_path / "cache")
    client = GitHubAPIClient(token="test", cache_dir=cache_dir)
    
    with patch('requests.get') as mock_get:
        mock_response_fail = Mock()
        mock_response_fail.status_code = 500
        
        mock_response_success = Mock()
        mock_response_success.status_code = 200
        mock_response_success.json.return_value = {"success": True}
        mock_response_success.headers = {
            'X-RateLimit-Remaining': '5000',
            'X-RateLimit-Limit': '5000'
        }
        
        mock_get.side_effect = [mock_response_fail, mock_response_success]
        
        result = client.get_with_cache("https://api.github.com/test", use_cache=False, retries=3)
        
        assert result == {"success": True}
        assert mock_get.call_count == 2
        assert mock_sleep.call_count >= 1

@patch('time.sleep', return_value=None)
def test_get_with_cache_timeout_retry(mock_sleep, tmp_path):
    """Testa retry em timeout"""
    cache_dir = str(tmp_path / "cache")
    client = GitHubAPIClient(token="test", cache_dir=cache_dir)
    
    with patch('requests.get') as mock_get:
        import requests
        
        mock_response_success = Mock()
        mock_response_success.status_code = 200
        mock_response_success.json.return_value = {"success": True}
        mock_response_success.headers = {
            'X-RateLimit-Remaining': '5000',
            'X-RateLimit-Limit': '5000'
        }
        
        # Primeira chamada: timeout, segunda: sucesso
        mock_get.side_effect = [
            requests.exceptions.Timeout(),
            mock_response_success
        ]
        
        result = client.get_with_cache("https://api.github.com/test", use_cache=False, retries=3)
        
        assert result == {"success": True}
        assert mock_get.call_count == 2
        assert mock_sleep.call_count >= 1

def test_get_with_cache_exhausted_retries(tmp_path, capsys):
    """Testa esgotamento de tentativas"""
    cache_dir = str(tmp_path / "cache")
    client = GitHubAPIClient(token="test", cache_dir=cache_dir)
    
    with patch('time.sleep'):
        with patch('requests.get') as mock_get:
            mock_response = Mock()
            mock_response.status_code = 500
            mock_get.return_value = mock_response
            
            result = client.get_with_cache("https://api.github.com/test", use_cache=False, retries=2)
            
            assert result is None
            assert mock_get.call_count == 2
            captured = capsys.readouterr()
            assert "Exhausted retries" in captured.out

def test_get_paginated(tmp_path):
    """Testa paginação de resultados"""
    cache_dir = str(tmp_path / "cache")
    client = GitHubAPIClient(token="test", cache_dir=cache_dir)
    
    with patch.object(client, 'get_with_cache') as mock_get:
        mock_get.side_effect = [
            [{"id": 1}, {"id": 2}],
            [{"id": 3}],
        ]
        
        results = client.get_paginated("https://api.github.com/test", per_page=2)
        
        assert len(results) == 3
        assert results[0]["id"] == 1
        assert results[2]["id"] == 3

def test_get_paginated_max_pages(tmp_path):
    """Testa limite de páginas"""
    cache_dir = str(tmp_path / "cache")
    client = GitHubAPIClient(token="test", cache_dir=cache_dir)
    
    with patch.object(client, 'get_with_cache') as mock_get:
        mock_get.return_value = [{"id": i} for i in range(50)]
        
        results = client.get_paginated("https://api.github.com/test", per_page=50, max_pages=2)
        
        assert mock_get.call_count == 2

def test_get_paginated_non_list_response(tmp_path):
    """Testa paginação com resposta não-lista"""
    cache_dir = str(tmp_path / "cache")
    client = GitHubAPIClient(token="test", cache_dir=cache_dir)
    
    with patch.object(client, 'get_with_cache') as mock_get:
        mock_get.return_value = {"error": "not a list"}
        
        results = client.get_paginated("https://api.github.com/test")
        
        assert results == []
        assert mock_get.call_count == 1

def test_organization_config():
    """Testa configuração de organização"""
    config = OrganizationConfig("test-org")
    
    assert config.org_name == "test-org"
    assert config.repo_blacklist == []
    assert config.should_skip_repo({"name": "any-repo"}) is False

def test_update_data_registry(tmp_path):
    """Testa atualização do registro de dados"""
    with patch('utils.github_api.load_json_data') as mock_load:
        with patch('utils.github_api.save_json_data') as mock_save:
            mock_load.return_value = {}
            
            update_data_registry("bronze", "issues", ["file1.json", "file2.json"])
            
            mock_save.assert_called_once()
            saved_data = mock_save.call_args[0][0]
            
            assert "issues" in saved_data
            assert saved_data["issues"]["files"] == ["file1.json", "file2.json"]
            assert "updated_at" in saved_data["issues"]

def test_update_data_registry_existing(tmp_path):
    """Testa atualização de registro existente"""
    with patch('utils.github_api.load_json_data') as mock_load:
        with patch('utils.github_api.save_json_data') as mock_save:
            # Registry já existe com dados
            mock_load.return_value = {
                "commits": {
                    "files": ["old.json"],
                    "updated_at": "2024-01-01"
                }
            }
            
            update_data_registry("bronze", "issues", ["new.json"])
            
            saved_data = mock_save.call_args[0][0]
            
            # Deve ter ambos commits e issues
            assert "commits" in saved_data
            assert "issues" in saved_data
            assert saved_data["issues"]["files"] == ["new.json"]

def test_graphql_with_cache(tmp_path):
    """Testa GraphQL com cache"""
    cache_dir = str(tmp_path / "cache")
    client = GitHubAPIClient(token="test", cache_dir=cache_dir)
    
    query = "query { viewer { login } }"
    
    with patch('requests.post') as mock_post:
        mock_response = Mock()
        mock_response.status_code = 200
        mock_response.json.return_value = {"data": {"viewer": {"login": "test"}}}
        mock_post.return_value = mock_response
        
        result1 = client.graphql(query, use_cache=True)
        assert result1["data"]["viewer"]["login"] == "test"
        assert mock_post.call_count == 1
        
        result2 = client.graphql(query, use_cache=True)
        assert result2["data"]["viewer"]["login"] == "test"
        assert mock_post.call_count == 1

def test_graphql_errors(tmp_path, capsys):
    """Testa tratamento de erros GraphQL"""
    cache_dir = str(tmp_path / "cache")
    client = GitHubAPIClient(token="test", cache_dir=cache_dir)
    
    with patch('requests.post') as mock_post:
        mock_response = Mock()
        mock_response.status_code = 200
        mock_response.json.return_value = {
            "errors": [{"type": "FORBIDDEN", "message": "Access denied"}]
        }
        mock_post.return_value = mock_response
        
        result = client.graphql("query { test }", use_cache=False)
        
        assert result is None
        captured = capsys.readouterr()
        assert "ERROR" in captured.out

def test_graphql_service_unavailable(tmp_path, capsys):
    """Testa tratamento de SERVICE_UNAVAILABLE (commit stats)"""
    cache_dir = str(tmp_path / "cache")
    client = GitHubAPIClient(token="test", cache_dir=cache_dir)
    
    with patch('requests.post') as mock_post:
        mock_response = Mock()
        mock_response.status_code = 200
        mock_response.json.return_value = {
            "errors": [{
                "type": "SERVICE_UNAVAILABLE",
                "path": ["additions"],
                "message": "Stats unavailable"
            }]
        }
        mock_post.return_value = mock_response
        
        result = client.graphql("query { test }", use_cache=False)
        
        assert result is None
        captured = capsys.readouterr()
        assert "Stats unavailable" in captured.out or "SERVICE_UNAVAILABLE" in captured.out

@patch('time.sleep', return_value=None)
def test_graphql_timeout(mock_sleep, tmp_path, capsys):
    """Testa timeout em GraphQL"""
    cache_dir = str(tmp_path / "cache")
    client = GitHubAPIClient(token="test", cache_dir=cache_dir)
    
    with patch('requests.post') as mock_post:
        import requests
        mock_post.side_effect = requests.exceptions.Timeout()
        
        result = client.graphql("query { test }", use_cache=False, timeout=1)
        
        assert result is None
        captured = capsys.readouterr()
        assert "Timeout" in captured.out

def test_graphql_403(tmp_path, capsys):
    """Testa GraphQL com 403"""
    cache_dir = str(tmp_path / "cache")
    client = GitHubAPIClient(token="test", cache_dir=cache_dir)
    
    with patch('requests.post') as mock_post:
        mock_response = Mock()
        mock_response.status_code = 403
        mock_response.text = "Forbidden"
        mock_post.return_value = mock_response
        
        result = client.graphql("query { test }", use_cache=False)
        
        assert result is None
        captured = capsys.readouterr()
        assert "Forbidden" in captured.out

def test_get_with_cache_rate_limit_display(tmp_path, capsys):
    """Testa exibição de rate limit"""
    cache_dir = str(tmp_path / "cache")
    client = GitHubAPIClient(token="test", cache_dir=cache_dir)
    
    with patch('requests.get') as mock_get:
        mock_response = Mock()
        mock_response.status_code = 200
        mock_response.json.return_value = {"data": "test"}
        mock_response.headers = {
            'X-RateLimit-Remaining': '100',
            'X-RateLimit-Limit': '5000'
        }
        mock_get.return_value = mock_response
        
        result = client.get_with_cache("https://api.github.com/test", use_cache=False)
        
        captured = capsys.readouterr()
        assert "Rate limit" in captured.out
        assert "100" in captured.out

def test_split_time_range_no_dates():
    """Testa split sem datas"""
    client = GitHubAPIClient(token="test")
    ranges = client._split_time_range(None, None, chunks=3)
    assert ranges == [(None, None)]

def test_split_time_range_with_dates():
    """Testa split com datas"""
    client = GitHubAPIClient(token="test")
    ranges = client._split_time_range(
        "2024-01-01T00:00:00Z",
        "2024-12-31T23:59:59Z",
        chunks=3
    )
    assert len(ranges) == 3
    # Cada range deve ter since e until
    for since, until in ranges:
        assert since is not None
        assert until is not None

def test_split_time_range_invalid_format():
    """Testa split com formato inválido"""
    client = GitHubAPIClient(token="test")
    ranges = client._split_time_range("invalid", "also-invalid", chunks=3)
    # Deve retornar range único quando parsing falha
    assert ranges == [("invalid", "also-invalid")]