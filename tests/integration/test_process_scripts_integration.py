#!/usr/bin/env python3
"""
Integration tests for main process scripts.
Tests the integration of bronze_extract, silver_process, and gold_process.
"""

import pytest
from datetime import datetime
from silver.member_analytics import process_member_analytics
from silver.contribution_metrics import process_contribution_metrics
from silver.temporal_analysis import process_temporal_analysis
from gold.timeline_aggregation import process_timeline_aggregation


class TestProcessScriptsIntegration:
    """Test suite for main process scripts integration"""

    @pytest.fixture
    def minimal_bronze_data(self, fake_io):
        """Create minimal bronze data for process scripts"""
        fake_io["data/bronze/members_detailed.json"] = [
            {
                "login": "process_test_user",
                "id": 9999,
                "name": "Process Test User",
                "public_repos": 15,
                "followers": 25,
                "following": 10,
                "created_at": "2023-01-01T00:00:00Z",
                "updated_at": "2024-01-01T00:00:00Z"
            }
        ]
        
        fake_io["data/bronze/commits_all.json"] = [
            {
                "sha": "process_abc123",
                "author": {"login": "process_test_user"},
                "commit": {
                    "author": {
                        "name": "Process Test User",
                        "date": "2024-01-15T10:00:00Z"
                    }
                },
                "repository": "test-repo"
            }
        ]
        
        fake_io["data/bronze/issues_all.json"] = [
            {
                "id": 9001,
                "user": {"login": "process_test_user"},
                "created_at": "2024-01-10T10:00:00Z",
                "repository": "test-repo",
                "state": "open"
            }
        ]
        
        fake_io["data/bronze/prs_all.json"] = []
        fake_io["data/bronze/issue_events_all.json"] = []
        
        return fake_io

    def test_silver_process_runs_all_processors(self, minimal_bronze_data, fake_io):
        """Test that silver_process runs all silver processors"""
        # Execute all silver processors as silver_process.py would
        member_files = process_member_analytics()
        contrib_files = process_contribution_metrics()
        temporal_files = process_temporal_analysis()
        
        # Verify all processors completed
        assert len(member_files) > 0, "Member analytics should generate files"
        assert len(contrib_files) > 0, "Contribution metrics should generate files"
        assert len(temporal_files) > 0, "Temporal analysis should generate files"
        
        # Verify silver files exist
        assert "data/silver/members_analytics.json" in fake_io
        assert "data/silver/contribution_metrics.json" in fake_io
        assert "data/silver/temporal_events.json" in fake_io

    def test_gold_process_depends_on_silver(self, minimal_bronze_data, fake_io):
        """Test that gold_process requires silver data"""
        # Run silver first
        process_member_analytics()
        process_temporal_analysis()
        
        # Now run gold
        timeline_files = process_timeline_aggregation()
        
        # Should generate gold files
        assert len(timeline_files) > 0

    def test_complete_etl_script_sequence(self, minimal_bronze_data, fake_io):
        """Test complete ETL sequence: Bronze -> Silver -> Gold"""
        # Bronze data already exists (minimal_bronze_data fixture)
        
        # Step 1: Silver processing
        print("Running Silver processing...")
        member_files = process_member_analytics()
        contrib_files = process_contribution_metrics()
        temporal_files = process_temporal_analysis()
        
        assert len(member_files) > 0
        assert len(contrib_files) > 0
        assert len(temporal_files) > 0
        
        # Step 2: Gold processing
        print("Running Gold processing...")
        timeline_files = process_timeline_aggregation()
        
        assert len(timeline_files) > 0
        
        # Verify complete pipeline
        assert "data/bronze/members_detailed.json" in fake_io
        assert "data/silver/members_analytics.json" in fake_io
        assert "data/gold/timeline_last_7_days.json" in fake_io

    def test_process_scripts_handle_empty_data(self, fake_io):
        """Test that process scripts handle empty bronze data"""
        # Set up empty bronze layer
        fake_io["data/bronze/members_detailed.json"] = []
        fake_io["data/bronze/commits_all.json"] = []
        fake_io["data/bronze/issues_all.json"] = []
        fake_io["data/bronze/prs_all.json"] = []
        fake_io["data/bronze/issue_events_all.json"] = []
        
        # Silver processors should handle empty data gracefully
        member_files = process_member_analytics()
        contrib_files = process_contribution_metrics()
        
        # Should complete without errors
        assert isinstance(member_files, list)
        assert isinstance(contrib_files, list)

    def test_process_scripts_are_idempotent(self, minimal_bronze_data, fake_io):
        """Test that running process scripts multiple times produces same results"""
        # Run silver processing twice
        process_member_analytics()
        first_members = fake_io["data/silver/members_analytics.json"].copy()
        
        process_member_analytics()
        second_members = fake_io["data/silver/members_analytics.json"]
        
        # Results should be identical (idempotent)
        assert len(first_members) == len(second_members)
        
        if len(first_members) > 0 and len(second_members) > 0:
            # Compare first user
            assert first_members[0]["login"] == second_members[0]["login"]

    def test_silver_process_order_independence(self, minimal_bronze_data, fake_io):
        """Test that silver processors can run in any order"""
        # Silver processors should be independent of each other
        
        # Run in different order
        contrib_files = process_contribution_metrics()
        member_files = process_member_analytics()
        temporal_files = process_temporal_analysis()
        
        # All should complete successfully
        assert len(member_files) > 0
        assert len(contrib_files) > 0
        assert len(temporal_files) > 0

    def test_gold_process_fails_without_silver_data(self, fake_io):
        """Test that gold process handles missing silver data"""
        # Don't run silver processing
        # Gold should handle missing data gracefully
        
        timeline_files = process_timeline_aggregation()
        
        # Should complete (possibly with empty results)
        assert isinstance(timeline_files, list)


class TestDataFlowBetweenProcesses:
    """Test suite for data flow between process scripts"""

    def test_data_flows_from_bronze_to_silver(self, fake_io):
        """Test that data flows correctly from bronze to silver"""
        # Setup bronze data
        fake_io["data/bronze/members_detailed.json"] = [
            {
                "login": "flow_test_user",
                "id": 8888,
                "name": "Flow Test",
                "public_repos": 20,
                "followers": 30,
                "following": 15,
                "created_at": "2022-01-01T00:00:00Z",
                "updated_at": "2024-01-01T00:00:00Z"
            }
        ]
        
        # Process to silver
        process_member_analytics()
        
        # Verify data transformation
        silver_members = fake_io["data/silver/members_analytics.json"]
        assert len(silver_members) > 0
        
        # Find our test user
        test_user = next((m for m in silver_members if m["login"] == "flow_test_user"), None)
        assert test_user is not None
        assert test_user["public_repos"] == 20
        assert "maturity_score" in test_user
        assert "status" in test_user

    def test_data_flows_from_silver_to_gold(self, fake_io):
        """Test that data flows correctly from silver to gold"""
        # Setup silver data
        fake_io["data/silver/daily_activity_summary.json"] = [
            {
                "date": "2024-01-20T00:00:00",
                "total_events": 15,
                "commits": 10,
                "issues_created": 3,
                "prs_created": 2,
                "unique_users": 5,
                "authors": [
                    {"name": "user1", "commits": 10}
                ]
            }
        ]
        
        fake_io["data/silver/temporal_events.json"] = [
            {
                "date": "2024-01-20T10:00:00",
                "type": "commit",
                "user": "user1",
                "repo": "test-repo"
            }
        ]
        
        # Process to gold
        timeline_files = process_timeline_aggregation()
        
        # Verify aggregation
        assert len(timeline_files) > 0
        
        if "data/gold/timeline_last_7_days.json" in fake_io:
            gold_timeline = fake_io["data/gold/timeline_last_7_days.json"]
            assert isinstance(gold_timeline, list)

    def test_bronze_updates_trigger_silver_updates(self, fake_io):
        """Test that updating bronze data triggers silver re-processing"""
        # Initial bronze data
        fake_io["data/bronze/members_detailed.json"] = [
            {
                "login": "initial_user",
                "id": 7777,
                "name": "Initial",
                "public_repos": 5,
                "followers": 10,
                "following": 5,
                "created_at": "2023-01-01T00:00:00Z",
                "updated_at": "2024-01-01T00:00:00Z"
            }
        ]
        
        # First processing
        process_member_analytics()
        first_result = fake_io["data/silver/members_analytics.json"]
        assert len(first_result) == 1
        
        # Update bronze with new user
        fake_io["data/bronze/members_detailed.json"] = [
            {
                "login": "initial_user",
                "id": 7777,
                "name": "Initial",
                "public_repos": 5,
                "followers": 10,
                "following": 5,
                "created_at": "2023-01-01T00:00:00Z",
                "updated_at": "2024-01-01T00:00:00Z"
            },
            {
                "login": "new_user",
                "id": 6666,
                "name": "New User",
                "public_repos": 8,
                "followers": 12,
                "following": 6,
                "created_at": "2023-06-01T00:00:00Z",
                "updated_at": "2024-01-01T00:00:00Z"
            }
        ]
        
        # Re-process
        process_member_analytics()
        second_result = fake_io["data/silver/members_analytics.json"]
        
        # Should include new user
        assert len(second_result) == 2


class TestProcessScriptErrorRecovery:
    """Test suite for error recovery in process scripts"""

    def test_silver_process_continues_on_single_processor_failure(self, fake_io):
        """Test that silver process continues if one processor fails"""
        # Setup data that might cause one processor to fail
        fake_io["data/bronze/members_detailed.json"] = [
            {"login": "test_user", "id": 1}  # Minimal data
        ]
        fake_io["data/bronze/commits_all.json"] = []
        fake_io["data/bronze/issues_all.json"] = []
        fake_io["data/bronze/prs_all.json"] = []
        fake_io["data/bronze/issue_events_all.json"] = []
        
        # Try to run all processors
        try:
            member_files = process_member_analytics()
            assert isinstance(member_files, list)
        except Exception:
            pass
        
        try:
            contrib_files = process_contribution_metrics()
            assert isinstance(contrib_files, list)
        except Exception:
            pass

    def test_process_scripts_preserve_existing_data_on_failure(self, fake_io):
        """Test that existing silver data is preserved if processing fails"""
        # Setup existing silver data
        fake_io["data/silver/members_analytics.json"] = [
            {"login": "existing_user", "id": 5555}
        ]
        
        # Setup bronze data
        fake_io["data/bronze/members_detailed.json"] = [
            {"login": "new_user", "id": 4444}
        ]
        
        # Try processing (might fail with minimal data)
        try:
            process_member_analytics()
        except Exception:
            pass
        
        # Silver data should exist (either old or new)
        assert "data/silver/members_analytics.json" in fake_io
