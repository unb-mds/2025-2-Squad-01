"""
Testes unitários para o módulo silver_process.

Testa a orquestração do processamento da camada Silver.
"""

import pytest
from unittest.mock import patch, MagicMock
import sys


class TestSilverProcess:
    """Testes para o script silver_process"""
    
    def test_main_processes_all_layers(self, capsys):
        """Testa que main processa todas as camadas Silver"""
        with patch('sys.argv', ['silver_process.py']):
            with patch('silver.member_analytics.process_member_analytics', return_value=['member.json']):
                with patch('silver.contribution_metrics.process_contribution_metrics', return_value=['contrib.json']):
                    with patch('silver.collaboration_networks.process_collaboration_networks', return_value=['collab.json']):
                        with patch('silver.temporal_analysis.process_temporal_analysis', return_value=['temporal.json']):
                            with patch('utils.github_api.update_data_registry'):
                                from src import silver_process
                                
                                silver_process.main()
        
        captured = capsys.readouterr()
        assert "Starting Silver layer processing" in captured.out
        assert "Processing member analytics" in captured.out
        assert "Processing contribution metrics" in captured.out
        assert "Processing collaboration networks" in captured.out
        assert "Processing temporal analysis" in captured.out
        assert "Silver processing completed successfully" in captured.out
    
    def test_main_with_org_argument(self):
        """Testa que main aceita argumento --org"""
        with patch('sys.argv', ['silver_process.py', '--org', 'test-org']):
            with patch('silver.member_analytics.process_member_analytics', return_value=[]):
                with patch('silver.contribution_metrics.process_contribution_metrics', return_value=[]):
                    with patch('silver.collaboration_networks.process_collaboration_networks', return_value=[]):
                        with patch('silver.temporal_analysis.process_temporal_analysis', return_value=[]):
                            with patch('utils.github_api.update_data_registry'):
                                from src import silver_process
                                
                                silver_process.main()
    
    def test_main_displays_all_files(self, capsys):
        """Testa que main exibe todos os arquivos gerados pelos processadores"""
        with patch('sys.argv', ['silver_process.py']):
            with patch('silver.member_analytics.process_member_analytics', return_value=['member1.json', 'member2.json']):
                with patch('silver.contribution_metrics.process_contribution_metrics', return_value=['contrib.json']):
                    with patch('silver.collaboration_networks.process_collaboration_networks', return_value=['collab.json']):
                        with patch('silver.temporal_analysis.process_temporal_analysis', return_value=['temporal.json']):
                            with patch('utils.github_api.update_data_registry'):
                                from src import silver_process
                                
                                silver_process.main()
        
        captured = capsys.readouterr()
        assert "Generated 5 files" in captured.out
        assert "member1.json" in captured.out
        assert "member2.json" in captured.out
        assert "contrib.json" in captured.out
        assert "collab.json" in captured.out
        assert "temporal.json" in captured.out
    
    def test_main_handles_processing_error(self, capsys):
        """Testa tratamento de erro durante processamento"""
        with patch('sys.argv', ['silver_process.py']):
            with patch('silver.member_analytics.process_member_analytics', side_effect=Exception("Processing failed")):
                from src import silver_process
                
                with pytest.raises(SystemExit) as exc_info:
                    silver_process.main()
                
                assert exc_info.value.code == 1
        
        captured = capsys.readouterr()
        assert "Error during silver processing" in captured.out
        assert "Processing failed" in captured.out
    
    def test_main_displays_generated_files(self, capsys):
        """Testa que main exibe os arquivos gerados"""
        test_files = ['member.json', 'contrib.json', 'collab.json']
        
        with patch('sys.argv', ['silver_process.py']):
            with patch('silver.member_analytics.process_member_analytics', return_value=[test_files[0]]):
                with patch('silver.contribution_metrics.process_contribution_metrics', return_value=[test_files[1]]):
                    with patch('silver.collaboration_networks.process_collaboration_networks', return_value=[test_files[2]]):
                        with patch('silver.temporal_analysis.process_temporal_analysis', return_value=[]):
                            with patch('utils.github_api.update_data_registry'):
                                from src import silver_process
                                
                                silver_process.main()
        
        captured = capsys.readouterr()
        assert "Generated 3 files" in captured.out
        assert "member.json" in captured.out
        assert "contrib.json" in captured.out
        assert "collab.json" in captured.out
    
    def test_main_processes_in_correct_order(self):
        """Testa que os processadores são chamados na ordem correta"""
        call_order = []
        
        def track_member():
            call_order.append('member')
            return []
        
        def track_contrib():
            call_order.append('contrib')
            return []
        
        def track_collab():
            call_order.append('collab')
            return []
        
        def track_temporal():
            call_order.append('temporal')
            return []
        
        with patch('sys.argv', ['silver_process.py']):
            with patch('silver.member_analytics.process_member_analytics', side_effect=track_member):
                with patch('silver.contribution_metrics.process_contribution_metrics', side_effect=track_contrib):
                    with patch('silver.collaboration_networks.process_collaboration_networks', side_effect=track_collab):
                        with patch('silver.temporal_analysis.process_temporal_analysis', side_effect=track_temporal):
                            with patch('utils.github_api.update_data_registry'):
                                from src import silver_process
                                
                                silver_process.main()
        
        assert call_order == ['member', 'contrib', 'collab', 'temporal']
    
    def test_main_displays_timestamp(self, capsys):
        """Testa que main exibe timestamp de início"""
        with patch('sys.argv', ['silver_process.py']):
            with patch('silver.member_analytics.process_member_analytics', return_value=[]):
                with patch('silver.contribution_metrics.process_contribution_metrics', return_value=[]):
                    with patch('silver.collaboration_networks.process_collaboration_networks', return_value=[]):
                        with patch('silver.temporal_analysis.process_temporal_analysis', return_value=[]):
                            with patch('utils.github_api.update_data_registry'):
                                from src import silver_process
                                
                                silver_process.main()
        
        captured = capsys.readouterr()
        assert "Started at:" in captured.out
