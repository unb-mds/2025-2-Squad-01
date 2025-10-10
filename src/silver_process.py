#!/usr/bin/env python3

import argparse
import sys
import os
from datetime import datetime

# Add src to path so we can import our modules
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from utils.github_api import update_data_registry

def main():
    parser = argparse.ArgumentParser(description='Process Bronze data to Silver layer')
    parser.add_argument('--org', default='coops-org', help='GitHub organization name')
    
    args = parser.parse_args()
    
    print(f"Starting Silver layer processing")
    print(f"Started at: {datetime.now().isoformat()}")
    
    try:

        from silver.contribution_metrics import process_contribution_metrics 
        from silver.member_analytics import process_member_analytics

        contrib_files = process_contribution_metrics()
        member_files = process_member_analytics()

        # Update registry
        all_files = contrib_files + member_files
        update_data_registry('silver', 'all_processed', all_files)
        
        print(f"\nSilver processing completed successfully!")
        print(f"Generated {len(all_files)} files:")
        for file_path in all_files:
            print(f"   - {file_path}")
            
    except Exception as e:
        print(f"\nError during silver processing: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    main()