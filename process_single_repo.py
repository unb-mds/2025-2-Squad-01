"""Script temporário para processar um único repositório"""
import sys
import os

# Adicionar o diretório raiz ao path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from src.silver.pdf_data_processor import PDFDataProcessor

if __name__ == "__main__":
    processor = PDFDataProcessor()
    processor.process_repository("2025-2-Squad-01")
