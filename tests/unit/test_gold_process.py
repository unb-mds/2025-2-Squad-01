"""
Testes unitários para o módulo gold_process.

Testa a orquestração do processamento da camada Gold.
"""

import pytest
from unittest.mock import patch, MagicMock
import sys


class TestGoldProcess:
    """Testes para o script gold_process"""
    
    def test_main_processes_timeline_aggregation(self, capsys):
        """Testa que main processa timeline aggregation"""
        with patch('sys.argv', ['gold_process.py']):
            with patch('gold.timeline_aggregation.process_timeline_aggregation', return_value=['timeline.json']):
                with patch('utils.github_api.update_data_registry'):
                    from src import gold_process
                    
                    gold_process.main()
        
        captured = capsys.readouterr()
        assert "Starting Gold layer processing" in captured.out
        assert "Processing timeline aggregations" in captured.out
        assert "Gold processing completed successfully" in captured.out
    
    def test_main_with_org_argument(self, capsys):
        """Testa que main aceita argumento --org"""
        with patch('sys.argv', ['gold_process.py', '--org', 'test-org']):
            with patch('gold.timeline_aggregation.process_timeline_aggregation', return_value=[]):
                with patch('utils.github_api.update_data_registry'):
                    from src import gold_process
                    
                    gold_process.main()
        
        # Verifica que não houve erro com org personalizada
        captured = capsys.readouterr()
        assert "Gold processing completed successfully" in captured.out
    
    def test_main_displays_generated_files(self, capsys):
        """Testa que main exibe os arquivos gerados"""
        test_files = ['timeline1.json', 'timeline2.json', 'timeline3.json']
        
        with patch('sys.argv', ['gold_process.py']):
            with patch('gold.timeline_aggregation.process_timeline_aggregation', return_value=test_files):
                with patch('utils.github_api.update_data_registry'):
                    from src import gold_process
                    
                    gold_process.main()
        
        captured = capsys.readouterr()
        assert "Generated 3 files" in captured.out
        assert "timeline1.json" in captured.out
        assert "timeline2.json" in captured.out
        assert "timeline3.json" in captured.out
    
    def test_main_handles_processing_error(self, capsys):
        """Testa tratamento de erro durante processamento"""
        with patch('sys.argv', ['gold_process.py']):
            with patch('gold.timeline_aggregation.process_timeline_aggregation', side_effect=Exception("Processing failed")):
                from src import gold_process
                
                with pytest.raises(SystemExit) as exc_info:
                    gold_process.main()
                
                assert exc_info.value.code == 1
        
        captured = capsys.readouterr()
        assert "Error during gold processing" in captured.out
        assert "Processing failed" in captured.out
    
    def test_main_displays_timestamp(self, capsys):
        """Testa que main exibe timestamp de início"""
        with patch('sys.argv', ['gold_process.py']):
            with patch('gold.timeline_aggregation.process_timeline_aggregation', return_value=[]):
                with patch('utils.github_api.update_data_registry'):
                    from src import gold_process
                    
                    gold_process.main()
        
        captured = capsys.readouterr()
        assert "Started at:" in captured.out
    
    def test_main_updates_registry_with_all_files(self, capsys):
        """Testa que main atualiza o registro com todos os arquivos"""
        test_files = ['file1.json', 'file2.json']
        
        with patch('sys.argv', ['gold_process.py']):
            with patch('gold.timeline_aggregation.process_timeline_aggregation', return_value=test_files):
                with patch('utils.github_api.update_data_registry'):
                    from src import gold_process
                    
                    gold_process.main()
        
        captured = capsys.readouterr()
        assert "Generated 2 files" in captured.out
        assert "file1.json" in captured.out
        assert "file2.json" in captured.out
    
    def test_main_with_empty_results(self, capsys):
        """Testa que main funciona mesmo sem arquivos gerados"""
        with patch('sys.argv', ['gold_process.py']):
            with patch('gold.timeline_aggregation.process_timeline_aggregation', return_value=[]):
                with patch('utils.github_api.update_data_registry'):
                    from src import gold_process
                    
                    gold_process.main()
        
        captured = capsys.readouterr()
        assert "Generated 0 files" in captured.out
        assert "Gold processing completed successfully" in captured.out
    
    def test_main_calls_timeline_processor(self):
        """Testa que main chama o processador de timeline"""
        with patch('sys.argv', ['gold_process.py']):
            with patch('gold.timeline_aggregation.process_timeline_aggregation') as mock_timeline:
                with patch('utils.github_api.update_data_registry'):
                    mock_timeline.return_value = []
                    
                    from src import gold_process
                    
                    gold_process.main()
                    
                    mock_timeline.assert_called_once()
    
    def test_main_default_org_value(self, capsys):
        """Testa que o valor padrão de --org é usado quando não especificado"""
        with patch('sys.argv', ['gold_process.py']):
            with patch('gold.timeline_aggregation.process_timeline_aggregation', return_value=[]):
                with patch('utils.github_api.update_data_registry'):
                    from src import gold_process
                    
                    gold_process.main()
        
        # Verifica que executa com sucesso sem especificar org
        captured = capsys.readouterr()
        assert "Starting Gold layer processing" in captured.out
