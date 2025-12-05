"""
Testes unitários para o módulo cleanup_event_data.

Testa a funcionalidade de limpeza de arquivos de eventos de issues.
"""

import pytest
from pathlib import Path
from unittest.mock import patch, MagicMock
import src.utils.cleanup_event_data as cleanup_module


class TestCleanupEventFiles:
    """Testes para a função cleanup_event_files"""
    
    def test_cleanup_no_files_found(self, capsys):
        """Testa quando não há arquivos para limpar"""
        with patch('src.utils.cleanup_event_data.Path') as mock_path_class:
            mock_script_path = MagicMock()
            mock_project_root = MagicMock()
            mock_bronze_dir = MagicMock()
            
            mock_path_class.return_value = mock_script_path
            mock_script_path.parent.parent = mock_project_root
            mock_project_root.__truediv__.return_value.__truediv__.return_value = mock_bronze_dir
            mock_bronze_dir.glob.return_value = []
            
            cleanup_module.cleanup_event_files()
        
        captured = capsys.readouterr()
        assert "No issue event files found" in captured.out
    
    def test_cleanup_dry_run_does_not_delete(self, tmp_path, capsys):
        """Testa que dry-run não deleta arquivos"""
        # Setup directory structure
        src_dir = tmp_path / "src" / "utils"
        src_dir.mkdir(parents=True)
        bronze_dir = tmp_path / "data" / "bronze"
        bronze_dir.mkdir(parents=True)
        
        # Create test file
        test_file = bronze_dir / "issue_events_test.json"
        test_file.write_text('{"test": "data"}')
        
        # Mock __file__ to point to our tmp directory
        with patch.object(cleanup_module, '__file__', str(src_dir / "cleanup_event_data.py")):
            cleanup_module.cleanup_event_files(dry_run=True)
        
        # File should still exist
        assert test_file.exists()
        
        captured = capsys.readouterr()
        assert "[DRY RUN]" in captured.out
        assert "No files were deleted" in captured.out
    
    def test_cleanup_with_confirm_deletes_files(self, tmp_path, capsys):
        """Testa que confirm=True deleta os arquivos"""
        src_dir = tmp_path / "src" / "utils"
        src_dir.mkdir(parents=True)
        bronze_dir = tmp_path / "data" / "bronze"
        bronze_dir.mkdir(parents=True)
        
        test_file1 = bronze_dir / "issue_events_repo1.json"
        test_file2 = bronze_dir / "issue_events_repo2.json"
        test_file1.write_text('{"test": "data1"}')
        test_file2.write_text('{"test": "data2"}')
        
        with patch.object(cleanup_module, '__file__', str(src_dir / "cleanup_event_data.py")):
            cleanup_module.cleanup_event_files(confirm=True)
        
        assert not test_file1.exists()
        assert not test_file2.exists()
        
        captured = capsys.readouterr()
        assert "Successfully deleted 2/2" in captured.out
    
    def test_cleanup_prompts_user_and_accepts(self, tmp_path, capsys):
        """Testa que usuário é perguntado e aceita"""
        src_dir = tmp_path / "src" / "utils"
        src_dir.mkdir(parents=True)
        bronze_dir = tmp_path / "data" / "bronze"
        bronze_dir.mkdir(parents=True)
        
        test_file = bronze_dir / "issue_events_test.json"
        test_file.write_text('{"test": "data"}')
        
        with patch.object(cleanup_module, '__file__', str(src_dir / "cleanup_event_data.py")):
            with patch('builtins.input', return_value='yes'):
                cleanup_module.cleanup_event_files(confirm=False)
        
        assert not test_file.exists()
        captured = capsys.readouterr()
        assert "Successfully deleted" in captured.out
    
    def test_cleanup_prompts_user_and_cancels(self, tmp_path, capsys):
        """Testa que usuário é perguntado e cancela"""
        src_dir = tmp_path / "src" / "utils"
        src_dir.mkdir(parents=True)
        bronze_dir = tmp_path / "data" / "bronze"
        bronze_dir.mkdir(parents=True)
        
        test_file = bronze_dir / "issue_events_test.json"
        test_file.write_text('{"test": "data"}')
        
        with patch.object(cleanup_module, '__file__', str(src_dir / "cleanup_event_data.py")):
            with patch('builtins.input', return_value='no'):
                cleanup_module.cleanup_event_files(confirm=False)
        
        assert test_file.exists()
        captured = capsys.readouterr()
        assert "Cancelled" in captured.out
    
    def test_cleanup_displays_file_sizes(self, tmp_path, capsys):
        """Testa que tamanhos dos arquivos são exibidos corretamente"""
        src_dir = tmp_path / "src" / "utils"
        src_dir.mkdir(parents=True)
        bronze_dir = tmp_path / "data" / "bronze"
        bronze_dir.mkdir(parents=True)
        
        test_file = bronze_dir / "issue_events_large.json"
        test_file.write_bytes(b'x' * (10 * 1024 * 1024))  # 10 MB
        
        with patch.object(cleanup_module, '__file__', str(src_dir / "cleanup_event_data.py")):
            cleanup_module.cleanup_event_files(dry_run=True)
        
        captured = capsys.readouterr()
        assert "10.00 MB" in captured.out
        assert "Total size: 10.00 MB" in captured.out
    
    def test_cleanup_handles_deletion_errors(self, tmp_path, capsys):
        """Testa tratamento de erros ao deletar"""
        src_dir = tmp_path / "src" / "utils"
        src_dir.mkdir(parents=True)
        bronze_dir = tmp_path / "data" / "bronze"
        bronze_dir.mkdir(parents=True)
        
        test_file = bronze_dir / "issue_events_locked.json"
        test_file.write_text('{"test": "data"}')
        
        with patch.object(cleanup_module, '__file__', str(src_dir / "cleanup_event_data.py")):
            with patch.object(Path, 'unlink', side_effect=PermissionError("File is locked")):
                cleanup_module.cleanup_event_files(confirm=True)
        
        captured = capsys.readouterr()
        assert "Failed to delete" in captured.out
        assert "File is locked" in captured.out
        assert "0/1" in captured.out
    
    def test_cleanup_shows_next_steps(self, tmp_path, capsys):
        """Testa que próximos passos são exibidos"""
        src_dir = tmp_path / "src" / "utils"
        src_dir.mkdir(parents=True)
        bronze_dir = tmp_path / "data" / "bronze"
        bronze_dir.mkdir(parents=True)
        
        test_file = bronze_dir / "issue_events_test.json"
        test_file.write_text('{"test": "data"}')
        
        with patch.object(cleanup_module, '__file__', str(src_dir / "cleanup_event_data.py")):
            cleanup_module.cleanup_event_files(confirm=True)
        
        captured = capsys.readouterr()
        assert "Next steps:" in captured.out
        assert "bronze extraction workflow" in captured.out
    
    def test_cleanup_counts_files_correctly(self, tmp_path, capsys):
        """Testa contagem correta de múltiplos arquivos"""
        src_dir = tmp_path / "src" / "utils"
        src_dir.mkdir(parents=True)
        bronze_dir = tmp_path / "data" / "bronze"
        bronze_dir.mkdir(parents=True)
        
        for i in range(3):
            test_file = bronze_dir / f"issue_events_{i}.json"
            test_file.write_bytes(b'x' * (1024 * (i + 1)))
        
        with patch.object(cleanup_module, '__file__', str(src_dir / "cleanup_event_data.py")):
            cleanup_module.cleanup_event_files(dry_run=True)
        
        captured = capsys.readouterr()
        assert "Found 3 issue event file(s)" in captured.out


class TestMainFunction:
    """Testes para a função main"""
    
    def test_main_with_confirm_flag(self, capsys):
        """Testa main com --confirm"""
        with patch('sys.argv', ['cleanup_event_data.py', '--confirm']):
            with patch.object(cleanup_module, 'cleanup_event_files') as mock_cleanup:
                cleanup_module.main()
                mock_cleanup.assert_called_once_with(confirm=True, dry_run=False)
        
        captured = capsys.readouterr()
        assert "Issue Event Data Cleanup Utility" in captured.out
    
    def test_main_with_dry_run_flag(self, capsys):
        """Testa main com --dry-run"""
        with patch('sys.argv', ['cleanup_event_data.py', '--dry-run']):
            with patch.object(cleanup_module, 'cleanup_event_files') as mock_cleanup:
                cleanup_module.main()
                mock_cleanup.assert_called_once_with(confirm=False, dry_run=True)
    
    def test_main_with_both_flags(self):
        """Testa main com ambas flags"""
        with patch('sys.argv', ['cleanup_event_data.py', '--confirm', '--dry-run']):
            with patch.object(cleanup_module, 'cleanup_event_files') as mock_cleanup:
                cleanup_module.main()
                mock_cleanup.assert_called_once_with(confirm=True, dry_run=True)
    
    def test_main_without_flags(self):
        """Testa main sem flags"""
        with patch('sys.argv', ['cleanup_event_data.py']):
            with patch.object(cleanup_module, 'cleanup_event_files') as mock_cleanup:
                cleanup_module.main()
                mock_cleanup.assert_called_once_with(confirm=False, dry_run=False)
    
    def test_main_displays_introduction(self, capsys):
        """Testa que mensagem introdutória é exibida"""
        with patch('sys.argv', ['cleanup_event_data.py']):
            with patch.object(cleanup_module, 'cleanup_event_files'):
                cleanup_module.main()
        
        captured = capsys.readouterr()
        assert "=" * 70 in captured.out
        assert "This script will remove old issue event files" in captured.out
        assert "After cleanup, re-run bronze extraction" in captured.out
