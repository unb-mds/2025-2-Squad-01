#!/usr/bin/env python3

import argparse
import sys
import os
from datetime import datetime

# Add src to path 
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from utils.github_api import update_data_registry

def main():
    parser = argparse.ArgumentParser(description='Process Bronze data to Silver layer')
    parser.add_argument('--org', default='coops-org', help='GitHub organization name')
    
    args = parser.parse_args()
    
    print(f"Starting Silver layer processing")
    print(f"Started at: {datetime.now().isoformat()}")
    
    try:
        #individual processors
        from silver.member_analytics import process_member_analytics
        from silver.contribution_metrics import process_contribution_metrics
        from silver.collaboration_networks import process_collaboration_networks
        from silver.temporal_analysis import process_temporal_analysis
        from silver.members_statistics import process_members_statistics
        
        # Process data in logical order
        print("\nProcessing member analytics...")
        member_files = process_member_analytics()
        
        print("\nProcessing contribution metrics...")
        contrib_files = process_contribution_metrics()
        
        print("\nProcessing collaboration networks...")
        collab_files = process_collaboration_networks()
        
        print("\nProcessing temporal analysis...")
        temporal_files = process_temporal_analysis()

        print("\nProcessing members statistics...")
        members_stats_files = process_members_statistics()

        #  registry
        all_files = member_files + contrib_files + collab_files + temporal_files + members_stats_files
        update_data_registry('silver', 'all_processed', all_files)
        
        print(f"\nSilver processing completed successfully!")
        print(f"Generated {len(all_files)} files:")
        for file_path in all_files:
            print(f"   - {file_path}")
            
    except Exception as e:
        print(f"\n Error during silver processing: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    main()