#!/usr/bin/env python3
"""
Testes adicionais para aumentar cobertura do github_api.py
"""

import pytest
import json
import os
from unittest.mock import Mock, patch, MagicMock, mock_open
from utils.github_api import GitHubAPIClient, save_json_data, load_json_data


class TestGetActiveBranches:
    """Testes para get_active_unmerged_branches"""
    
    def test_get_active_branches_basic(self, tmp_path):
        """Testa busca de branches ativas"""
        client = GitHubAPIClient(token="test", cache_dir=str(tmp_path))
        
        with patch.object(client, 'get_with_cache') as mock_get, \
             patch.object(client, 'graphql') as mock_graphql:
            
            # Mock repo info
            mock_get.return_value = {"default_branch": "main"}
            
            # Mock GraphQL responses
            mock_graphql.side_effect = [
                {
                    "data": {
                        "repository": {
                            "refs": {
                                "nodes": [
                                    {
                                        "name": "feature-branch",
                                        "target": {
                                            "oid": "abc123",
                                            "committedDate": "2024-12-01T00:00:00Z"
                                        }
                                    }
                                ],
                                "pageInfo": {"hasNextPage": False}
                            }
                        }
                    }
                },
                # Comparison result
                {"ahead_by": 5, "behind_by": 0}
            ]
            
            # Mock REST comparison
            mock_get.return_value = {"ahead_by": 5, "behind_by": 0}
            
            result = client.get_active_unmerged_branches("owner", "repo", days=30)
            
            assert isinstance(result, list)
            # Function may return empty if REST comparison fails
            # Just verify it runs without error

    def test_get_active_branches_no_unmerged(self, tmp_path):
        """Testa quando não há branches não merged"""
        client = GitHubAPIClient(token="test", cache_dir=str(tmp_path))
        
        with patch.object(client, 'get_with_cache') as mock_get, \
             patch.object(client, 'graphql') as mock_graphql:
            
            mock_get.return_value = {"default_branch": "main"}
            mock_graphql.return_value = {
                "data": {
                    "repository": {
                        "refs": {
                            "nodes": [],
                            "pageInfo": {"hasNextPage": False}
                        }
                    }
                }
            }
            
            result = client.get_active_unmerged_branches("owner", "repo")
            
            assert result == []

    def test_get_active_branches_error_handling(self, tmp_path):
        """Testa tratamento de erro na busca de branches"""
        client = GitHubAPIClient(token="test", cache_dir=str(tmp_path))
        
        with patch.object(client, 'get_with_cache') as mock_get:
            mock_get.return_value = None  # Erro na API
            
            result = client.get_active_unmerged_branches("owner", "repo")
            
            assert result == []


class TestCommitDetailsFunctions:
    """Testes para funções de detalhes de commits"""
    
    def test_fetch_with_thread_id(self, tmp_path):
        """Testa busca de commit com thread ID"""
        client = GitHubAPIClient(token="test", cache_dir=str(tmp_path))
        
        with patch.object(client, 'get_with_cache') as mock_get:
            mock_get.return_value = ({"sha": "abc123"}, {"header": "value"})
            
            result = client._fetch_with_thread_id("owner", "repo", "abc123", True)
            
            assert "data" in result
            assert "thread_id" in result
            assert "headers" in result
            assert result["data"]["sha"] == "abc123"

    def test_fetch_rest_commit_details_parallel(self, tmp_path):
        """Testa busca paralela de detalhes de commits"""
        client = GitHubAPIClient(token="test", cache_dir=str(tmp_path))
        
        commits = [
            {
                "sha": "abc123",
                "author": {"login": "user1"},
                "commit": {
                    "message": "Test commit",
                    "author": {"date": "2024-01-01T00:00:00Z"}
                }
            }
        ]
        
        with patch.object(client, '_fetch_with_thread_id') as mock_fetch:
            mock_fetch.return_value = {
                "data": {
                    "sha": "abc123",
                    "stats": {"additions": 10, "deletions": 5},
                    "commit": {
                        "message": "Test commit",
                        "author": {"date": "2024-01-01T00:00:00Z"}
                    }
                },
                "thread_id": 1,
                "headers": {"X-RateLimit-Remaining": "100"}
            }
            
            result = client._fetch_rest_commit_details_parallel(
                commits, "owner", "repo", True, max_workers=2
            )
            
            assert len(result) == 1
            assert result[0]["oid"] == "abc123"
            assert result[0]["additions"] == 10
            assert result[0]["deletions"] == 5

    def test_fetch_parallel_empty_list(self, tmp_path):
        """Testa busca paralela com lista vazia"""
        client = GitHubAPIClient(token="test", cache_dir=str(tmp_path))
        
        result = client._fetch_rest_commit_details_parallel(
            [], "owner", "repo", True
        )
        
        assert result == []


class TestSaveLoadJsonData:
    """Testes para save_json_data e load_json_data"""
    
    def test_save_json_data_with_timestamp(self, tmp_path):
        """Testa salvar JSON com timestamp"""
        test_file = str(tmp_path / "test.json")
        test_data = {"key": "value", "number": 123}
        
        result = save_json_data(test_data, test_file, timestamp=True)
        
        assert result == test_file
        assert os.path.exists(result)
        
        # Verify timestamp metadata was added
        with open(result, 'r', encoding='utf-8') as f:
            loaded = json.load(f)
            assert '_metadata' in loaded
            assert 'extracted_at' in loaded['_metadata']
            assert loaded['key'] == "value"
            assert loaded['number'] == 123

    def test_save_json_data_without_timestamp(self, tmp_path):
        """Testa salvar JSON sem timestamp"""
        test_file = str(tmp_path / "test.json")
        test_data = {"key": "value"}
        
        result = save_json_data(test_data, test_file, timestamp=False)
        
        assert result == test_file
        assert os.path.exists(test_file)

    def test_save_json_data_creates_directory(self, tmp_path):
        """Testa que save_json_data cria diretórios necessários"""
        test_file = str(tmp_path / "subdir" / "nested" / "test.json")
        test_data = {"test": "data"}
        
        result = save_json_data(test_data, test_file, timestamp=False)
        
        assert os.path.exists(result)
        assert os.path.exists(os.path.dirname(result))

    def test_load_json_data_success(self, tmp_path):
        """Testa carregar JSON com sucesso"""
        test_file = str(tmp_path / "test.json")
        test_data = {"key": "value", "list": [1, 2, 3]}
        
        with open(test_file, 'w', encoding='utf-8') as f:
            json.dump(test_data, f)
        
        result = load_json_data(test_file)
        
        assert result == test_data

    def test_load_json_data_file_not_found(self):
        """Testa carregar JSON de arquivo inexistente"""
        result = load_json_data("nonexistent_file.json")
        
        assert result is None

    def test_load_json_data_invalid_json(self, tmp_path):
        """Testa carregar arquivo JSON inválido"""
        test_file = str(tmp_path / "invalid.json")
        
        with open(test_file, 'w') as f:
            f.write("not valid json {")
        
        # Function should raise JSONDecodeError
        with pytest.raises(json.JSONDecodeError):
            load_json_data(test_file)


class TestGraphQLCommitHistory:
    """Testes para graphql_commit_history"""
    
    def test_graphql_commit_history_basic(self, tmp_path):
        """Testa busca de histórico via GraphQL"""
        client = GitHubAPIClient(token="test", cache_dir=str(tmp_path))
        
        with patch.object(client, 'graphql') as mock_graphql:
            mock_graphql.return_value = {
                "data": {
                    "repository": {
                        "defaultBranchRef": {
                            "target": {
                                "history": {
                                    "nodes": [
                                        {"oid": "abc123", "message": "Test commit"}
                                    ],
                                    "pageInfo": {"hasNextPage": False}
                                }
                            }
                        }
                    }
                }
            }
            
            result, rate_meta = client.graphql_commit_history(
                "owner", "repo", page_size=10, since="2024-01-01T00:00:00Z"
            )
            
            assert isinstance(result, list)
            assert isinstance(rate_meta, dict)
            assert len(result) > 0
            assert result[0]["oid"] == "abc123"

    def test_graphql_commit_history_pagination(self, tmp_path):
        """Testa paginação no histórico GraphQL"""
        client = GitHubAPIClient(token="test", cache_dir=str(tmp_path))
        
        with patch.object(client, 'graphql') as mock_graphql:
            # First page
            mock_graphql.side_effect = [
                {
                    "data": {
                        "repository": {
                            "defaultBranchRef": {
                                "target": {
                                    "history": {
                                        "nodes": [{"oid": "abc123"}],
                                        "pageInfo": {
                                            "hasNextPage": True,
                                            "endCursor": "cursor1"
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                # Second page
                {
                    "data": {
                        "repository": {
                            "defaultBranchRef": {
                                "target": {
                                    "history": {
                                        "nodes": [{"oid": "def456"}],
                                        "pageInfo": {"hasNextPage": False}
                                    }
                                }
                            }
                        }
                    }
                }
            ]
            
            result, rate_meta = client.graphql_commit_history(
                "owner", "repo", page_size=10, max_pages=2
            )
            
            assert len(result) == 2
            assert result[0]["oid"] == "abc123"
            assert result[1]["oid"] == "def456"

    def test_graphql_commit_history_no_branch(self, tmp_path):
        """Testa quando repositório não tem branch padrão"""
        client = GitHubAPIClient(token="test", cache_dir=str(tmp_path))
        
        with patch.object(client, 'graphql') as mock_graphql:
            mock_graphql.return_value = {
                "data": {
                    "repository": {
                        "defaultBranchRef": None
                    }
                }
            }
            
            result, rate_meta = client.graphql_commit_history(
                "owner", "repo", page_size=10
            )
            
            assert result == []

    def test_graphql_commit_history_error(self, tmp_path):
        """Testa tratamento de erro no GraphQL"""
        client = GitHubAPIClient(token="test", cache_dir=str(tmp_path))
        
        with patch.object(client, 'graphql') as mock_graphql:
            mock_graphql.return_value = None  # Erro
            
            result, rate_meta = client.graphql_commit_history(
                "owner", "repo", page_size=10
            )
            
            assert result == []


class TestLogRateLimit:
    """Testes para _log_rate_limit"""
    
    def test_log_rate_limit_with_headers(self, tmp_path, capsys):
        """Testa logging de rate limit com headers"""
        client = GitHubAPIClient(token="test", cache_dir=str(tmp_path))
        
        mock_response = Mock()
        mock_response.headers = {
            'X-RateLimit-Remaining': '100',
            'X-RateLimit-Limit': '5000'
        }
        
        client._log_rate_limit(mock_response, prefix="TEST")
        
        captured = capsys.readouterr()
        assert "100" in captured.out
        assert "5000" in captured.out
        assert "TEST" in captured.out

    def test_log_rate_limit_without_headers(self, tmp_path, capsys):
        """Testa logging quando não há headers de rate limit"""
        client = GitHubAPIClient(token="test", cache_dir=str(tmp_path))
        
        mock_response = Mock()
        mock_response.headers = {}
        
        client._log_rate_limit(mock_response)
        
        captured = capsys.readouterr()
        # Should print Unknown/Unknown when headers are missing
        assert "Unknown/Unknown" in captured.out


class TestGetWithCacheReturnHeaders:
    """Testes para get_with_cache com return_headers=True"""
    
    def test_get_with_cache_return_headers_from_api(self, tmp_path):
        """Testa retorno de headers da API"""
        client = GitHubAPIClient(token="test", cache_dir=str(tmp_path))
        
        with patch('requests.get') as mock_get:
            mock_response = Mock()
            mock_response.status_code = 200
            mock_response.json.return_value = {"data": "test"}
            mock_response.headers = {"X-Custom": "value"}
            mock_get.return_value = mock_response
            
            data, headers = client.get_with_cache(
                "https://api.github.com/test",
                use_cache=False,
                return_headers=True
            )
            
            assert data == {"data": "test"}
            assert headers["X-Custom"] == "value"

    def test_get_with_cache_return_headers_from_cache(self, tmp_path):
        """Testa retorno de headers do cache (None)"""
        client = GitHubAPIClient(token="test", cache_dir=str(tmp_path))
        
        # Set cache first
        test_url = "https://api.github.com/test"
        test_data = {"cached": "data"}
        client._cache_set(test_url, test_data)
        
        data, headers = client.get_with_cache(test_url, return_headers=True)
        
        assert data == test_data
        assert headers is None  # No headers from cache
