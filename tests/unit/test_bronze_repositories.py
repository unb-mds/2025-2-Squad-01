"""
Testes unitários para o módulo bronze.repositories.

Testa a extração de repositórios da organização.
"""

import pytest
from unittest.mock import patch, MagicMock
from bronze.repositories import extract_repositories


class TestExtractRepositories:
    """Testes para extract_repositories"""
    
    def test_extract_repositories_success(self, capsys):
        """Testa extração bem-sucedida de repositórios"""
        mock_client = MagicMock()
        mock_config = MagicMock()
        mock_config.org_name = "test-org"
        mock_config.should_skip_repo.return_value = False
        
        mock_repos = [
            {"name": "repo1", "full_name": "test-org/repo1"},
            {"name": "repo2", "full_name": "test-org/repo2"}
        ]
        
        mock_client.get_paginated.return_value = mock_repos
        mock_client.get_with_cache.return_value = {"name": "repo1", "full_name": "test-org/repo1", "details": "extra"}
        
        with patch('bronze.repositories.save_json_data', return_value="file.json") as mock_save:
            result = extract_repositories(mock_client, mock_config, use_cache=True)
            
            assert len(result) > 0
            assert all(isinstance(f, str) for f in result)
        
        captured = capsys.readouterr()
        assert "Found 2 repositories" in captured.out
    
    def test_extract_repositories_with_blacklist(self, capsys):
        """Testa que filtra repositórios na blacklist"""
        mock_client = MagicMock()
        mock_config = MagicMock()
        mock_config.org_name = "test-org"
        
        # Primeiro repo é filtrado, segundo não
        mock_config.should_skip_repo.side_effect = [True, False]
        
        mock_repos = [
            {"name": "blacklisted-repo", "full_name": "test-org/blacklisted-repo"},
            {"name": "good-repo", "full_name": "test-org/good-repo"}
        ]
        
        mock_client.get_paginated.return_value = mock_repos
        mock_client.get_with_cache.return_value = {"name": "good-repo", "full_name": "test-org/good-repo"}
        
        with patch('bronze.repositories.save_json_data', return_value="file.json"):
            result = extract_repositories(mock_client, mock_config)
        
        captured = capsys.readouterr()
        assert "Skipping repository: blacklisted-repo" in captured.out
        assert "Found 1 repositories (filtered from 2)" in captured.out
    
    def test_extract_repositories_empty_response(self, capsys):
        """Testa tratamento de resposta vazia"""
        mock_client = MagicMock()
        mock_config = MagicMock()
        mock_config.org_name = "test-org"
        
        mock_client.get_paginated.return_value = []
        
        result = extract_repositories(mock_client, mock_config)
        
        assert result == []
        captured = capsys.readouterr()
        assert "Failed to fetch repositories" in captured.out
    
    def test_extract_repositories_none_response(self, capsys):
        """Testa tratamento de resposta None"""
        mock_client = MagicMock()
        mock_config = MagicMock()
        mock_config.org_name = "test-org"
        
        mock_client.get_paginated.return_value = None
        
        result = extract_repositories(mock_client, mock_config)
        
        assert result == []
        captured = capsys.readouterr()
        assert "Failed to fetch repositories" in captured.out
    
    def test_extract_repositories_uses_cache_flag(self):
        """Testa que respeita o flag use_cache"""
        mock_client = MagicMock()
        mock_config = MagicMock()
        mock_config.org_name = "test-org"
        mock_config.should_skip_repo.return_value = False
        
        mock_repos = [{"name": "repo1", "full_name": "test-org/repo1"}]
        mock_client.get_paginated.return_value = mock_repos
        mock_client.get_with_cache.return_value = {"name": "repo1"}
        
        with patch('bronze.repositories.save_json_data', return_value="file.json"):
            extract_repositories(mock_client, mock_config, use_cache=False)
            
            # Verifica que use_cache foi passado
            mock_client.get_paginated.assert_called_once()
            call_kwargs = mock_client.get_paginated.call_args[1]
            assert call_kwargs['use_cache'] is False
    
    def test_extract_repositories_saves_raw_data(self):
        """Testa que salva dados brutos dos repositórios"""
        mock_client = MagicMock()
        mock_config = MagicMock()
        mock_config.org_name = "test-org"
        mock_config.should_skip_repo.return_value = False
        
        mock_repos = [{"name": "repo1", "full_name": "test-org/repo1"}]
        mock_client.get_paginated.return_value = mock_repos
        mock_client.get_with_cache.return_value = {"name": "repo1"}
        
        with patch('bronze.repositories.save_json_data', return_value="file.json") as mock_save:
            extract_repositories(mock_client, mock_config)
            
            # Verifica que salvou dados brutos
            calls = [call[0] for call in mock_save.call_args_list]
            assert any("repositories_raw.json" in str(call) for call in calls)
    
    def test_extract_repositories_saves_filtered_data(self):
        """Testa que salva dados filtrados dos repositórios"""
        mock_client = MagicMock()
        mock_config = MagicMock()
        mock_config.org_name = "test-org"
        mock_config.should_skip_repo.return_value = False
        
        mock_repos = [{"name": "repo1", "full_name": "test-org/repo1"}]
        mock_client.get_paginated.return_value = mock_repos
        mock_client.get_with_cache.return_value = {"name": "repo1"}
        
        with patch('bronze.repositories.save_json_data', return_value="file.json") as mock_save:
            extract_repositories(mock_client, mock_config)
            
            # Verifica que salvou dados filtrados
            calls = [call[0] for call in mock_save.call_args_list]
            assert any("repositories_filtered.json" in str(call) for call in calls)
    
    def test_extract_repositories_fetches_details(self):
        """Testa que busca detalhes de cada repositório"""
        mock_client = MagicMock()
        mock_config = MagicMock()
        mock_config.org_name = "test-org"
        mock_config.should_skip_repo.return_value = False
        
        mock_repos = [
            {"name": "repo1", "full_name": "test-org/repo1"},
            {"name": "repo2", "full_name": "test-org/repo2"}
        ]
        mock_client.get_paginated.return_value = mock_repos
        mock_client.get_with_cache.return_value = {"name": "repo1", "extra": "detail"}
        
        with patch('bronze.repositories.save_json_data', return_value="file.json"):
            extract_repositories(mock_client, mock_config)
            
            # Verifica que buscou detalhes para cada repo
            assert mock_client.get_with_cache.call_count == 2
    
    def test_extract_repositories_saves_individual_files(self):
        """Testa que salva arquivo individual para cada repositório"""
        mock_client = MagicMock()
        mock_config = MagicMock()
        mock_config.org_name = "test-org"
        mock_config.should_skip_repo.return_value = False
        
        mock_repos = [{"name": "myrepo", "full_name": "test-org/myrepo"}]
        mock_client.get_paginated.return_value = mock_repos
        mock_client.get_with_cache.return_value = {"name": "myrepo"}
        
        with patch('bronze.repositories.save_json_data', return_value="file.json") as mock_save:
            extract_repositories(mock_client, mock_config)
            
            # Verifica que salvou arquivo individual
            calls = [call[0] for call in mock_save.call_args_list]
            assert any("repo_myrepo.json" in str(call) for call in calls)
    
    def test_extract_repositories_saves_detailed_collection(self):
        """Testa que salva coleção de repositórios detalhados"""
        mock_client = MagicMock()
        mock_config = MagicMock()
        mock_config.org_name = "test-org"
        mock_config.should_skip_repo.return_value = False
        
        mock_repos = [{"name": "repo1", "full_name": "test-org/repo1"}]
        mock_client.get_paginated.return_value = mock_repos
        mock_client.get_with_cache.return_value = {"name": "repo1", "detailed": True}
        
        with patch('bronze.repositories.save_json_data', return_value="file.json") as mock_save:
            extract_repositories(mock_client, mock_config)
            
            # Verifica que salvou arquivo detalhado
            calls = [call[0] for call in mock_save.call_args_list]
            assert any("repositories_detailed.json" in str(call) for call in calls)
    
    def test_extract_repositories_handles_missing_detail(self):
        """Testa tratamento quando detalhes do repo não estão disponíveis"""
        mock_client = MagicMock()
        mock_config = MagicMock()
        mock_config.org_name = "test-org"
        mock_config.should_skip_repo.return_value = False
        
        mock_repos = [{"name": "repo1", "full_name": "test-org/repo1"}]
        mock_client.get_paginated.return_value = mock_repos
        mock_client.get_with_cache.return_value = None  # Detalhes não disponíveis
        
        with patch('bronze.repositories.save_json_data', return_value="file.json") as mock_save:
            result = extract_repositories(mock_client, mock_config)
            
            # Deve continuar funcionando mesmo sem detalhes
            assert len(result) > 0
    
    def test_extract_repositories_constructs_correct_urls(self):
        """Testa que constrói URLs corretas para a API"""
        mock_client = MagicMock()
        mock_config = MagicMock()
        mock_config.org_name = "my-organization"
        mock_config.should_skip_repo.return_value = False
        
        mock_repos = [{"name": "repo1", "full_name": "my-organization/repo1"}]
        mock_client.get_paginated.return_value = mock_repos
        mock_client.get_with_cache.return_value = {"name": "repo1"}
        
        with patch('bronze.repositories.save_json_data', return_value="file.json"):
            extract_repositories(mock_client, mock_config)
            
            # Verifica URL da organização
            org_url = mock_client.get_paginated.call_args[0][0]
            assert "my-organization" in org_url
            assert "/orgs/" in org_url
            
            # Verifica URL do repositório individual
            repo_url = mock_client.get_with_cache.call_args[0][0]
            assert "my-organization/repo1" in repo_url
    
    def test_extract_repositories_returns_all_generated_files(self):
        """Testa que retorna todos os arquivos gerados"""
        mock_client = MagicMock()
        mock_config = MagicMock()
        mock_config.org_name = "test-org"
        mock_config.should_skip_repo.return_value = False
        
        mock_repos = [
            {"name": "repo1", "full_name": "test-org/repo1"},
            {"name": "repo2", "full_name": "test-org/repo2"}
        ]
        mock_client.get_paginated.return_value = mock_repos
        mock_client.get_with_cache.return_value = {"name": "repo"}
        
        file_counter = [0]
        def mock_save_func(*args, **kwargs):
            file_counter[0] += 1
            return f"file{file_counter[0]}.json"
        
        with patch('bronze.repositories.save_json_data', side_effect=mock_save_func):
            result = extract_repositories(mock_client, mock_config)
            
            # Deve ter: raw, filtered, 2x individual, detailed = 5 arquivos
            assert len(result) == 5
            assert all("file" in f and ".json" in f for f in result)
    
    def test_extract_repositories_default_cache_true(self):
        """Testa que o valor padrão de use_cache é True"""
        mock_client = MagicMock()
        mock_config = MagicMock()
        mock_config.org_name = "test-org"
        mock_config.should_skip_repo.return_value = False
        
        mock_repos = [{"name": "repo1", "full_name": "test-org/repo1"}]
        mock_client.get_paginated.return_value = mock_repos
        mock_client.get_with_cache.return_value = {"name": "repo1"}
        
        with patch('bronze.repositories.save_json_data', return_value="file.json"):
            # Não passa use_cache, deve usar padrão True
            extract_repositories(mock_client, mock_config)
            
            call_kwargs = mock_client.get_paginated.call_args[1]
            assert call_kwargs['use_cache'] is True
