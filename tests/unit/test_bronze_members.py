"""
Testes unitários para o módulo bronze.members.

Testa a extração de membros da organização.
"""

import pytest
from unittest.mock import patch, MagicMock
from bronze.members import extract_members


class TestExtractMembers:
    """Testes para extract_members"""
    
    def test_extract_members_success(self, capsys):
        """Testa extração bem-sucedida de membros"""
        mock_client = MagicMock()
        mock_config = MagicMock()
        mock_config.org_name = "test-org"
        
        mock_members = [
            {"login": "user1", "type": "User"},
            {"login": "user2", "type": "User"}
        ]
        
        mock_client.get_with_cache.return_value = mock_members
        
        with patch('bronze.members.save_json_data', return_value="file.json"):
            result = extract_members(mock_client, mock_config)
            
            assert len(result) > 0
        
        captured = capsys.readouterr()
        assert "Successfully fetched 2 organization members" in captured.out
    
    def test_extract_members_empty_falls_back_to_contributors(self, capsys):
        """Testa fallback para contributors quando members API retorna vazio"""
        mock_client = MagicMock()
        mock_config = MagicMock()
        mock_config.org_name = "test-org"
        
        # Members API retorna vazio
        mock_repos = [
            {"full_name": "test-org/repo1", "name": "repo1"}
        ]
        mock_contributors = [
            {
                "login": "contributor1",
                "type": "User",
                "contributions": 50,
                "avatar_url": "https://avatar.url",
                "html_url": "https://github.com/contributor1"
            }
        ]
        
        def mock_get_with_cache(url, use_cache):
            if "/members" in url:
                return []
            elif "/contributors" in url:
                return mock_contributors
            return None
        
        mock_client.get_with_cache.side_effect = mock_get_with_cache
        
        with patch('utils.github_api.load_json_data', return_value=mock_repos):
            with patch('bronze.members.save_json_data', return_value="file.json"):
                result = extract_members(mock_client, mock_config)
                
                assert len(result) > 0
        
        captured = capsys.readouterr()
        assert "Fallback successful" in captured.out
        assert "Found 1 active contributors" in captured.out
    
    def test_extract_members_none_response(self, capsys):
        """Testa tratamento quando API retorna None"""
        mock_client = MagicMock()
        mock_config = MagicMock()
        mock_config.org_name = "test-org"
        
        mock_client.get_with_cache.return_value = None
        
        with patch('utils.github_api.load_json_data', return_value=None):
            with patch('bronze.members.save_json_data', return_value="file.json"):
                result = extract_members(mock_client, mock_config)
                
                # Deve criar arquivos vazios
                assert len(result) > 0
        
        captured = capsys.readouterr()
        assert "Fallback impossible" in captured.out
    
    def test_extract_members_creates_empty_files_when_no_data(self, capsys):
        """Testa que cria arquivos vazios quando não há dados"""
        mock_client = MagicMock()
        mock_config = MagicMock()
        mock_config.org_name = "test-org"
        
        mock_client.get_with_cache.return_value = []
        
        with patch('utils.github_api.load_json_data', return_value=[]):
            with patch('bronze.members.save_json_data', return_value="file.json") as mock_save:
                result = extract_members(mock_client, mock_config)
                
                # Verifica que salvou arquivos vazios
                assert len(result) == 2  # basic + detailed
                calls = [call[0][0] for call in mock_save.call_args_list]
                assert all(call == [] for call in calls)
        
        captured = capsys.readouterr()
        assert "Created empty member files" in captured.out
    
    def test_extract_members_uses_cache_flag(self):
        """Testa que respeita o flag use_cache"""
        mock_client = MagicMock()
        mock_config = MagicMock()
        mock_config.org_name = "test-org"
        
        mock_members = [{"login": "user1"}]
        mock_client.get_with_cache.return_value = mock_members
        
        with patch('bronze.members.save_json_data', return_value="file.json"):
            extract_members(mock_client, mock_config, use_cache=False)
            
            # Verifica que use_cache foi passado
            call_args = mock_client.get_with_cache.call_args[0]
            call_kwargs = mock_client.get_with_cache.call_args[1] if len(mock_client.get_with_cache.call_args) > 1 else {}
            assert call_args[1] is False or (len(call_args) > 1 and call_args[1] is False)
    
    def test_extract_members_saves_basic_info(self):
        """Testa que salva informações básicas dos membros"""
        mock_client = MagicMock()
        mock_config = MagicMock()
        mock_config.org_name = "test-org"
        
        mock_members = [{"login": "user1"}]
        mock_client.get_with_cache.return_value = mock_members
        
        with patch('bronze.members.save_json_data', return_value="file.json") as mock_save:
            extract_members(mock_client, mock_config)
            
            # Verifica que salvou members_basic.json
            calls = [call[0] for call in mock_save.call_args_list]
            assert any("members_basic.json" in str(call) for call in calls)
    
    def test_extract_members_saves_detailed_file(self):
        """Testa que salva arquivo de membros detalhados"""
        mock_client = MagicMock()
        mock_config = MagicMock()
        mock_config.org_name = "test-org"
        
        mock_members = [{"login": "user1"}]
        mock_client.get_with_cache.return_value = mock_members
        
        with patch('bronze.members.save_json_data', return_value="file.json") as mock_save:
            extract_members(mock_client, mock_config)
            
            # Verifica que salvou members_detailed.json
            calls = [call[0] for call in mock_save.call_args_list]
            assert any("members_detailed.json" in str(call) for call in calls)
    
    def test_extract_members_constructs_correct_url(self):
        """Testa que constrói URL correta para a API"""
        mock_client = MagicMock()
        mock_config = MagicMock()
        mock_config.org_name = "my-organization"
        
        mock_members = [{"login": "user1"}]
        mock_client.get_with_cache.return_value = mock_members
        
        with patch('bronze.members.save_json_data', return_value="file.json"):
            extract_members(mock_client, mock_config)
            
            # Verifica URL
            members_url = mock_client.get_with_cache.call_args[0][0]
            assert "my-organization" in members_url
            assert "/orgs/" in members_url
            assert "/members" in members_url
    
    def test_extract_members_fallback_accumulates_contributions(self, capsys):
        """Testa que fallback acumula contribuições de múltiplos repos"""
        mock_client = MagicMock()
        mock_config = MagicMock()
        mock_config.org_name = "test-org"
        
        mock_repos = [
            {"full_name": "test-org/repo1", "name": "repo1"},
            {"full_name": "test-org/repo2", "name": "repo2"}
        ]
        
        def mock_get_with_cache(url, use_cache):
            if "/members" in url:
                return []
            elif "/contributors" in url:
                return [
                    {"login": "contributor1", "type": "User", "contributions": 30,
                     "avatar_url": "url", "html_url": "url"}
                ]
            return None
        
        mock_client.get_with_cache.side_effect = mock_get_with_cache
        
        with patch('utils.github_api.load_json_data', return_value=mock_repos):
            with patch('bronze.members.save_json_data', return_value="file.json"):
                result = extract_members(mock_client, mock_config)
                
                assert len(result) > 0
        
        captured = capsys.readouterr()
        # Deve acumular contribuições: 30 + 30 = 60
        assert "60 contributions" in captured.out
    
    def test_extract_members_fallback_sorts_by_contributions(self, capsys):
        """Testa que fallback ordena por contribuições"""
        mock_client = MagicMock()
        mock_config = MagicMock()
        mock_config.org_name = "test-org"
        
        mock_repos = [{"full_name": "test-org/repo1", "name": "repo1"}]
        mock_contributors = [
            {"login": "low_contributor", "type": "User", "contributions": 5,
             "avatar_url": "url", "html_url": "url"},
            {"login": "top_contributor", "type": "User", "contributions": 100,
             "avatar_url": "url", "html_url": "url"}
        ]
        
        def mock_get_with_cache(url, use_cache):
            if "/members" in url:
                return []
            elif "/contributors" in url:
                return mock_contributors
            return None
        
        mock_client.get_with_cache.side_effect = mock_get_with_cache
        
        with patch('utils.github_api.load_json_data', return_value=mock_repos):
            with patch('bronze.members.save_json_data', return_value="file.json"):
                extract_members(mock_client, mock_config)
        
        captured = capsys.readouterr()
        assert "Top contributor: top_contributor" in captured.out
        assert "100 contributions" in captured.out
    
    def test_extract_members_fallback_skips_metadata(self):
        """Testa que fallback ignora entrada _metadata"""
        mock_client = MagicMock()
        mock_config = MagicMock()
        mock_config.org_name = "test-org"
        
        mock_repos = [
            {"_metadata": {"timestamp": "2024-01-01"}},
            {"full_name": "test-org/repo1", "name": "repo1"}
        ]
        
        mock_contributors = [
            {"login": "user1", "type": "User", "contributions": 10,
             "avatar_url": "url", "html_url": "url"}
        ]
        
        def mock_get_with_cache(url, use_cache):
            if "/members" in url:
                return []
            elif "/contributors" in url:
                return mock_contributors
            return None
        
        mock_client.get_with_cache.side_effect = mock_get_with_cache
        
        with patch('utils.github_api.load_json_data', return_value=mock_repos):
            with patch('bronze.members.save_json_data', return_value="file.json"):
                result = extract_members(mock_client, mock_config)
                
                # Deve funcionar normalmente, ignorando _metadata
                assert len(result) > 0
    
    def test_extract_members_fallback_handles_invalid_repos(self, capsys):
        """Testa que fallback lida com repos inválidos"""
        mock_client = MagicMock()
        mock_config = MagicMock()
        mock_config.org_name = "test-org"
        
        mock_repos = [
            None,
            {"name": "invalid"},  # Sem full_name
            {"full_name": "test-org/valid", "name": "valid"}
        ]
        
        mock_contributors = [
            {"login": "user1", "type": "User", "contributions": 10,
             "avatar_url": "url", "html_url": "url"}
        ]
        
        def mock_get_with_cache(url, use_cache):
            if "/members" in url:
                return []
            elif "/contributors" in url:
                return mock_contributors
            return None
        
        mock_client.get_with_cache.side_effect = mock_get_with_cache
        
        with patch('utils.github_api.load_json_data', return_value=mock_repos):
            with patch('bronze.members.save_json_data', return_value="file.json"):
                result = extract_members(mock_client, mock_config)
                
                # Deve processar apenas o repo válido
                assert len(result) > 0
    
    def test_extract_members_returns_generated_files(self):
        """Testa que retorna lista de arquivos gerados"""
        mock_client = MagicMock()
        mock_config = MagicMock()
        mock_config.org_name = "test-org"
        
        mock_members = [{"login": "user1"}]
        mock_client.get_with_cache.return_value = mock_members
        
        file_counter = [0]
        def mock_save_func(*args, **kwargs):
            file_counter[0] += 1
            return f"file{file_counter[0]}.json"
        
        with patch('bronze.members.save_json_data', side_effect=mock_save_func):
            result = extract_members(mock_client, mock_config)
            
            # Deve retornar: basic + detailed = 2 arquivos
            assert len(result) == 2
            assert all("file" in f and ".json" in f for f in result)
    
    def test_extract_members_default_cache_true(self):
        """Testa que o valor padrão de use_cache é True"""
        mock_client = MagicMock()
        mock_config = MagicMock()
        mock_config.org_name = "test-org"
        
        mock_members = [{"login": "user1"}]
        mock_client.get_with_cache.return_value = mock_members
        
        with patch('bronze.members.save_json_data', return_value="file.json"):
            # Não passa use_cache, deve usar padrão True
            extract_members(mock_client, mock_config)
            
            call_args = mock_client.get_with_cache.call_args[0]
            # Segundo argumento deve ser True
            assert call_args[1] is True
