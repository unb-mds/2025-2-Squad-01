#!/usr/bin/env python3

import argparse
import sys
import os
from datetime import datetime

# Add src to path 
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from utils.github_api import update_data_registry

def main():
    parser = argparse.ArgumentParser(description='Process Silver data to Gold layer')
    parser.add_argument('--org', default='coops-org', help='GitHub organization name')
    
    args = parser.parse_args()
    
    print(f"Starting Gold layer processing")
    print(f"Started at: {datetime.now().isoformat()}")
    
    try:
        # Import individual processors
        from gold.timeline_aggregation import process_timeline_aggregation
        
        # Process data
        print("\nProcessing timeline aggregations...")
        timeline_files = process_timeline_aggregation()

        # Update registry
        all_files = timeline_files
        update_data_registry('gold', 'all_processed', all_files)
        
        print(f"\nGold processing completed successfully!")
        print(f"Generated {len(all_files)} files:")
        for file_path in all_files:
            print(f"   - {file_path}")
            
    except Exception as e:
        print(f"\n Error during gold processing: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    main()
