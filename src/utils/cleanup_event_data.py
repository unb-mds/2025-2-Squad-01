#!/usr/bin/env python3
"""
Cleanup script to remove old issue event files and force re-extraction with optimized data.

This script removes all issue_events_*.json files from the bronze layer, forcing the
extraction process to regenerate them with only essential fields, significantly reducing
file size (from potentially 500MB+ to much smaller sizes).

Usage:
    python src/utils/cleanup_event_data.py
    
    Or with confirmation prompt:
    python src/utils/cleanup_event_data.py --confirm

After running this script, re-run the bronze extraction workflow to generate
optimized event files.
"""

import os
import sys
import glob
import argparse
from pathlib import Path

def cleanup_event_files(confirm: bool = False, dry_run: bool = False):
    """
    Remove issue event files from bronze layer.
    
    Args:
        confirm: If True, skip confirmation prompt
        dry_run: If True, only show what would be deleted without actually deleting
    """
    # Get project root (assumes script is in src/utils/)
    script_dir = Path(__file__).parent
    project_root = script_dir.parent.parent
    bronze_dir = project_root / "data" / "bronze"
    
    # Find all issue event files
    patterns = [
        "issue_events_*.json",
        "issue_events_all.json"
    ]
    
    files_to_delete = []
    for pattern in patterns:
        files_to_delete.extend(bronze_dir.glob(pattern))
    
    if not files_to_delete:
        print("✓ No issue event files found to clean up.")
        return
    
    # Show files to be deleted
    print(f"\nFound {len(files_to_delete)} issue event file(s):")
    total_size = 0
    for file_path in files_to_delete:
        size = file_path.stat().st_size
        total_size += size
        size_mb = size / (1024 * 1024)
        print(f"  - {file_path.name} ({size_mb:.2f} MB)")
    
    total_size_mb = total_size / (1024 * 1024)
    print(f"\nTotal size: {total_size_mb:.2f} MB")
    
    if dry_run:
        print("\n[DRY RUN] No files were deleted.")
        return
    
    # Confirm deletion
    if not confirm:
        response = input("\nDelete these files? (y/N): ").strip().lower()
        if response not in ['y', 'yes']:
            print("Cancelled.")
            return
    
    # Delete files
    deleted_count = 0
    for file_path in files_to_delete:
        try:
            file_path.unlink()
            deleted_count += 1
            print(f"  ✓ Deleted: {file_path.name}")
        except Exception as e:
            print(f"  ✗ Failed to delete {file_path.name}: {e}")
    
    print(f"\n✓ Successfully deleted {deleted_count}/{len(files_to_delete)} file(s).")
    print(f"  Freed up approximately {total_size_mb:.2f} MB of disk space.")
    print("\nNext steps:")
    print("  1. Run the bronze extraction workflow to regenerate optimized event files")
    print("  2. The new files will be much smaller (only essential fields)")
    print("  3. All Silver layer processing will continue to work correctly")

def main():
    parser = argparse.ArgumentParser(
        description="Clean up large issue event files and prepare for optimized re-extraction"
    )
    parser.add_argument(
        '--confirm', 
        action='store_true',
        help="Skip confirmation prompt and delete immediately"
    )
    parser.add_argument(
        '--dry-run',
        action='store_true',
        help="Show what would be deleted without actually deleting"
    )
    
    args = parser.parse_args()
    
    print("=" * 70)
    print("Issue Event Data Cleanup Utility")
    print("=" * 70)
    print("\nThis script will remove old issue event files that may be very large.")
    print("After cleanup, re-run bronze extraction to generate optimized files.")
    
    cleanup_event_files(confirm=args.confirm, dry_run=args.dry_run)

if __name__ == "__main__":
    main()
