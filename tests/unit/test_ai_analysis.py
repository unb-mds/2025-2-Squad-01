import pytest
import json
from pathlib import Path
from unittest.mock import Mock, patch, mock_open
from src.ai_analysis.generate_members_ai import (
    load_api_key,
    load_bronze_data,
    prepare_member_summary,
    create_analysis_prompt,
    parse_ai_response,
    analyze_members_with_gemini
)


class TestLoadApiKey:
    """Testes para load_api_key."""
    
    def test_load_from_secrets_file_gemini(self, tmp_path):
        """Testa carregamento do .secrets com GEMINI_API_KEY."""
        secrets_file = tmp_path / ".secrets"
        secrets_file.write_text("GEMINI_API_KEY=test_key_123")
        
        with patch('src.ai_analysis.generate_members_ai.Path') as mock_path:
            mock_path.return_value.exists.return_value = True
            mock_path.return_value.__enter__ = lambda self: secrets_file.open('r')
            
            # Usar mock para simular leitura do arquivo
            with patch('builtins.open', mock_open(read_data="GEMINI_API_KEY=test_key_123")):
                result = load_api_key()
                assert result == "test_key_123"
    
    def test_load_from_secrets_file_google(self, tmp_path):
        """Testa carregamento do .secrets com GOOGLE_API_KEY."""
        with patch('builtins.open', mock_open(read_data="GOOGLE_API_KEY=google_key_456")):
            with patch('src.ai_analysis.generate_members_ai.Path') as mock_path:
                mock_path.return_value.exists.return_value = True
                result = load_api_key()
                assert result == "google_key_456"
    
    def test_load_from_env_var(self, monkeypatch):
        """Testa carregamento de variável de ambiente."""
        monkeypatch.setenv('GEMINI_API_KEY', 'env_key_789')
        
        with patch('src.ai_analysis.generate_members_ai.Path') as mock_path:
            mock_path.return_value.exists.return_value = False
            result = load_api_key()
            assert result == 'env_key_789'
    
    def test_no_api_key_raises_error(self):
        """Testa erro quando não há API key."""
        with patch('src.ai_analysis.generate_members_ai.Path') as mock_path:
            mock_path.return_value.exists.return_value = False
            with patch('os.getenv', return_value=None):
                with pytest.raises(ValueError, match="API key não encontrada"):
                    load_api_key()


class TestLoadBronzeData:
    """Testes para load_bronze_data."""
    
    def test_load_commits_data(self, tmp_path):
        """Testa carregamento de dados de commits."""
        bronze_dir = tmp_path / "bronze"
        bronze_dir.mkdir()
        
        commits_file = bronze_dir / "commits_test_repo.json"
        commits_data = [
            {
                'commit': {
                    'author': {'login': 'john_doe', 'name': 'John Doe'},
                    'message': 'Fix bug'
                },
                'additions': 10,
                'deletions': 5
            }
        ]
        commits_file.write_text(json.dumps(commits_data))
        
        result = load_bronze_data(str(bronze_dir))
        
        assert 'john_doe' in result
        assert 'test_repo' in result['john_doe']
        assert len(result['john_doe']['test_repo']['commits']) == 1
    
    def test_skip_metadata_in_commits(self, tmp_path):
        """Testa que metadata é ignorado."""
        bronze_dir = tmp_path / "bronze"
        bronze_dir.mkdir()
        
        commits_file = bronze_dir / "commits_repo.json"
        commits_data = [
            {'_metadata': {'total': 1}},
            {
                'commit': {
                    'author': {'login': 'jane_doe'},
                    'message': 'Update'
                }
            }
        ]
        commits_file.write_text(json.dumps(commits_data))
        
        result = load_bronze_data(str(bronze_dir))
        
        assert 'jane_doe' in result
        assert len(result['jane_doe']['repo']['commits']) == 1
    
    def test_ignore_bot_commits(self, tmp_path):
        """Testa que commits de bots são ignorados."""
        bronze_dir = tmp_path / "bronze"
        bronze_dir.mkdir()
        
        commits_file = bronze_dir / "commits_repo.json"
        commits_data = [
            {
                'commit': {
                    'author': {'login': 'dependabot[bot]'},
                    'message': 'Bump version'
                }
            }
        ]
        commits_file.write_text(json.dumps(commits_data))
        
        result = load_bronze_data(str(bronze_dir))
        
        assert len(result) == 0


class TestPrepareMemberSummary:
    """Testes para prepare_member_summary."""
    
    def test_basic_summary(self):
        """Testa geração de sumário básico."""
        repos_data = {
            'repo1': {
                'commits': [
                    {'commit': {'message': 'Fix'}, 'additions': 10, 'deletions': 5, 'date': '2024-01-01'}
                ],
                'prs': [
                    {'title': 'Feature X', 'state': 'open', 'created_at': '2024-01-02'}
                ],
                'issues': [
                    {'title': 'Bug Y', 'state': 'closed', 'created_at': '2024-01-03'}
                ]
            }
        }
        
        result = prepare_member_summary('john_doe', repos_data)
        
        assert result['member'] == 'john_doe'
        assert result['total_commits'] == 1
        assert result['total_prs'] == 1
        assert result['total_issues'] == 1
        assert result['avg_additions'] == 10.0
        assert result['avg_deletions'] == 5.0
        assert result['avg_changes'] == 15.0
    
    def test_empty_repos_data(self):
        """Testa com dados vazios."""
        result = prepare_member_summary('empty_user', {})
        
        assert result['member'] == 'empty_user'
        assert result['total_commits'] == 0
        assert result['repos'] == []
        assert result['avg_additions'] == 0
        assert result['avg_deletions'] == 0


class TestCreateAnalysisPrompt:
    """Testes para create_analysis_prompt."""
    
    def test_prompt_structure(self):
        """Testa estrutura do prompt."""
        members_batch = [
            {
                'member': 'john_doe',
                'repos': ['repo1'],
                'total_commits': 10,
                'total_prs': 5,
                'total_issues': 3,
                'avg_additions': 20.0,
                'avg_deletions': 10.0,
                'avg_changes': 30.0,
                'commits_sample': [],
                'prs_sample': [],
                'issues_sample': []
            }
        ]
        
        prompt = create_analysis_prompt(members_batch)
        
        assert '### MEMBRO 1: john_doe' in prompt
        assert 'Total de commits: 10' in prompt
        assert 'Total de PRs: 5' in prompt
        assert 'COMMITS_ANALYSIS:' in prompt
        assert 'PRS_ANALYSIS:' in prompt
        assert 'ISSUES_ANALYSIS:' in prompt


class TestParseAiResponse:
    """Testes para parse_ai_response."""
    
    def test_parse_complete_response(self):
        """Testa parsing de resposta completa."""
        response_text = """
---MEMBER_START:john_doe
COMMITS_ANALYSIS:
Ótima atividade com 50 commits semanais.

PRS_ANALYSIS:
Bom engajamento em code reviews.

ISSUES_ANALYSIS:
Reporta bugs de forma clara.
---MEMBER_END
"""
        
        result = parse_ai_response(response_text, ['john_doe'])
        
        assert 'john_doe' in result
        assert 'commits_analysis' in result['john_doe']
        assert 'prs_analysis' in result['john_doe']
        assert 'issues_analysis' in result['john_doe']
        assert 'Ótima atividade' in result['john_doe']['commits_analysis']
    
    def test_parse_missing_sections(self):
        """Testa parsing com seções faltando."""
        response_text = """
---MEMBER_START:jane_doe
COMMITS_ANALYSIS:
Boa atividade.
---MEMBER_END
"""
        
        result = parse_ai_response(response_text, ['jane_doe'])
        
        assert 'jane_doe' in result
        assert result['jane_doe']['prs_analysis'] == 'Análise não disponível'
        assert result['jane_doe']['issues_analysis'] == 'Análise não disponível'


@patch('src.ai_analysis.generate_members_ai.genai')
@patch('src.ai_analysis.generate_members_ai.load_api_key')
class TestAnalyzeMembersWithGemini:
    """Testes para analyze_members_with_gemini."""
    
    def test_successful_analysis(self, mock_load_key, mock_genai):
        """Testa análise bem-sucedida."""
        mock_load_key.return_value = 'test_key'
        
        mock_response = Mock()
        mock_response.text = """
---MEMBER_START:john_doe
COMMITS_ANALYSIS:
Good activity

PRS_ANALYSIS:
Active reviewer

ISSUES_ANALYSIS:
Clear reports
---MEMBER_END
"""
        
        mock_model = Mock()
        mock_model.generate_content.return_value = mock_response
        mock_genai.GenerativeModel.return_value = mock_model
        
        members_data = {
            'john_doe': {
                'repo1': {
                    'commits': [{'commit': {'message': 'Fix'}, 'additions': 10, 'deletions': 5}],
                    'prs': [],
                    'issues': []
                }
            }
        }
        
        result = analyze_members_with_gemini(members_data, max_requests=1)
        
        assert 'john_doe' in result
        assert result['john_doe']['name'] == 'john_doe'
        assert 'commits_analysis' in result['john_doe']


# Testes de integração podem ir em tests/integration/