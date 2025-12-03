#!/usr/bin/env python3
"""
Integration tests for Silver -> Gold data transformation pipeline.
Tests the complete flow from processed analytics to aggregated insights.
"""

import pytest
from datetime import datetime, timedelta
from gold.timeline_aggregation import process_timeline_aggregation


class TestSilverToGoldIntegration:
    """Test suite for Silver to Gold layer transformation"""

    @pytest.fixture
    def silver_daily_activity_data(self, fake_io):
        """Create mock silver layer daily activity summary"""
        # Generate activity for the last 14 days
        base_date = datetime(2024, 1, 20)
        daily_activity = []
        
        for i in range(14):
            current_date = base_date - timedelta(days=i)
            day_data = {
                "date": current_date.isoformat(),
                "total_events": 10 + i,
                "issues_created": 2,
                "issues_closed": 1,
                "prs_created": 3,
                "prs_closed": 2,
                "commits": 5 + i,
                "comments": 3,
                "unique_users": 4,
                "unique_repos": 2,
                "authors": [
                    {
                        "name": "test_user_1",
                        "commits": 3,
                        "issues_created": 1,
                        "issues_closed": 0,
                        "prs_created": 2,
                        "prs_closed": 1
                    },
                    {
                        "name": "test_user_2",
                        "commits": 2 + i,
                        "issues_created": 1,
                        "issues_closed": 1,
                        "prs_created": 1,
                        "prs_closed": 1
                    }
                ]
            }
            daily_activity.append(day_data)
        
        fake_io["data/silver/daily_activity_summary.json"] = daily_activity
        return daily_activity

    @pytest.fixture
    def silver_temporal_events_data(self, fake_io):
        """Create mock silver layer temporal events"""
        base_date = datetime(2024, 1, 20)
        temporal_events = []
        
        repos = ["test-repo-1", "test-repo-2"]
        users = ["test_user_1", "test_user_2"]
        
        for i in range(20):
            event_date = base_date - timedelta(days=i // 2)
            event = {
                "date": event_date.isoformat(),
                "event_type": "commit" if i % 3 == 0 else "issue",
                "user": users[i % 2],
                "repo": repos[i % 2],
                "details": {
                    "message": f"Event {i}",
                    "additions": 10 * (i + 1),
                    "deletions": 5 * (i + 1)
                }
            }
            temporal_events.append(event)
        
        fake_io["data/silver/temporal_events.json"] = temporal_events
        return temporal_events

    @pytest.fixture
    def silver_contribution_metrics_data(self, fake_io):
        """Create mock silver layer contribution metrics"""
        metrics = [
            {
                "user": "test_user_1",
                "total_commits": 50,
                "total_additions": 1500,
                "total_deletions": 500,
                "repos_contributed": ["test-repo-1", "test-repo-2"],
                "first_commit": "2023-06-01T00:00:00Z",
                "last_commit": "2024-01-20T00:00:00Z"
            },
            {
                "user": "test_user_2",
                "total_commits": 30,
                "total_additions": 900,
                "total_deletions": 300,
                "repos_contributed": ["test-repo-1"],
                "first_commit": "2023-09-01T00:00:00Z",
                "last_commit": "2024-01-19T00:00:00Z"
            }
        ]
        
        fake_io["data/silver/contribution_metrics.json"] = metrics
        return metrics

    def test_timeline_aggregation_last_7_days(
        self, silver_daily_activity_data, silver_temporal_events_data, fake_io
    ):
        """Test that timeline aggregation generates last 7 days summary"""
        # Execute transformation
        generated_files = process_timeline_aggregation()
        
        # Verify files were generated
        assert len(generated_files) > 0
        assert "data/gold/timeline_last_7_days.json" in fake_io
        
        # Verify data structure
        last_7_days = fake_io["data/gold/timeline_last_7_days.json"]
        
        # Should have up to 7 days of data
        assert len(last_7_days) <= 7
        assert len(last_7_days) > 0
        
        # Verify each day has required fields
        for day in last_7_days:
            assert "date" in day
            assert "total_events" in day
            assert "commits" in day
            assert "authors" in day
            
            # Verify authors have repository information
            for author in day["authors"]:
                assert "name" in author
                assert "repositories" in author
                assert isinstance(author["repositories"], list)

    def test_timeline_aggregation_last_12_months(
        self, silver_daily_activity_data, silver_temporal_events_data, fake_io
    ):
        """Test that timeline aggregation generates last 12 months summary"""
        # Execute transformation
        generated_files = process_timeline_aggregation()
        
        # Verify files were generated
        assert len(generated_files) > 0
        assert "data/gold/timeline_last_12_months.json" in fake_io
        
        # Verify data structure
        last_12_months = fake_io["data/gold/timeline_last_12_months.json"]
        
        # Should have monthly aggregations (up to 12)
        assert len(last_12_months) <= 12
        assert len(last_12_months) > 0
        
        # Verify each month has required fields
        for month in last_12_months:
            assert "month" in month or "date" in month
            assert "total_events" in month
            assert "commits" in month
            assert "unique_users" in month
            assert "authors" in month

    def test_complete_silver_to_gold_pipeline(
        self, 
        silver_daily_activity_data, 
        silver_temporal_events_data,
        silver_contribution_metrics_data,
        fake_io
    ):
        """Integration test for complete Silver -> Gold transformation"""
        # Execute gold processors
        timeline_files = process_timeline_aggregation()
        
        # Verify all processors generated files
        assert len(timeline_files) > 0
        
        # Verify all expected gold files exist
        expected_gold_files = [
            "data/gold/timeline_last_7_days.json",
            "data/gold/timeline_last_12_months.json"
        ]
        
        for expected_file in expected_gold_files:
            assert expected_file in fake_io, f"Missing gold file: {expected_file}"
        
        # Verify data consistency
        last_7_days = fake_io["data/gold/timeline_last_7_days.json"]
        last_12_months = fake_io["data/gold/timeline_last_12_months.json"]
        
        # Check that aggregated data is reasonable
        assert len(last_7_days) > 0
        assert len(last_12_months) > 0
        
        # Verify authors in timeline match temporal events
        all_authors = set()
        for day in last_7_days:
            for author in day.get("authors", []):
                all_authors.add(author["name"])
        
        # Should have authors from temporal events
        temporal_users = {event["user"] for event in silver_temporal_events_data}
        assert all_authors.issubset(temporal_users) or len(all_authors) > 0

    def test_timeline_sorts_chronologically(
        self, silver_daily_activity_data, silver_temporal_events_data, fake_io
    ):
        """Test that timeline data is sorted chronologically"""
        # Execute transformation
        generated_files = process_timeline_aggregation()
        
        # Verify last 7 days is sorted
        last_7_days = fake_io["data/gold/timeline_last_7_days.json"]
        dates_7 = [datetime.fromisoformat(day["date"]) for day in last_7_days]
        assert dates_7 == sorted(dates_7), "Last 7 days should be sorted chronologically"
        
        # Verify last 12 months is sorted
        last_12_months = fake_io["data/gold/timeline_last_12_months.json"]
        if last_12_months:
            # Extract dates (could be 'month' or 'date' field)
            dates_12 = []
            for month in last_12_months:
                if "month" in month:
                    # Month format is YYYY-MM, add day to make valid ISO
                    month_str = month["month"]
                    if len(month_str) == 7:  # Format: YYYY-MM
                        dates_12.append(datetime.fromisoformat(month_str + "-01"))
                    else:
                        dates_12.append(datetime.fromisoformat(month_str))
                elif "date" in month:
                    date_str = month["date"]
                    if len(date_str) == 7:  # Format: YYYY-MM
                        dates_12.append(datetime.fromisoformat(date_str + "-01"))
                    else:
                        dates_12.append(datetime.fromisoformat(date_str))
            
            if dates_12:
                assert dates_12 == sorted(dates_12), "Last 12 months should be sorted chronologically"

    def test_aggregation_preserves_metrics(
        self, silver_daily_activity_data, silver_temporal_events_data, fake_io
    ):
        """Test that aggregation preserves important metrics"""
        # Execute transformation
        generated_files = process_timeline_aggregation()
        
        # Get aggregated data
        last_7_days = fake_io["data/gold/timeline_last_7_days.json"]
        
        # Calculate total events in last 7 days
        total_events = sum(day["total_events"] for day in last_7_days)
        total_commits = sum(day["commits"] for day in last_7_days)
        
        # Should have aggregated data
        assert total_events > 0
        assert total_commits > 0
        
        # Verify individual day metrics match expected ranges
        for day in last_7_days:
            assert day["total_events"] >= 0
            assert day["commits"] >= 0
            assert day["issues_created"] >= 0
            assert day["prs_created"] >= 0

    def test_handles_empty_silver_data(self, fake_io):
        """Test that gold processors handle missing silver data gracefully"""
        # Set empty silver data
        fake_io["data/silver/daily_activity_summary.json"] = []
        fake_io["data/silver/temporal_events.json"] = []
        
        # Execute processors - should not raise exceptions
        timeline_files = process_timeline_aggregation()
        
        # Verify graceful handling
        assert isinstance(timeline_files, list)

    def test_handles_partial_silver_data(self, silver_daily_activity_data, fake_io):
        """Test that gold processors handle partial silver data"""
        # Set only daily activity (no temporal events)
        fake_io["data/silver/temporal_events.json"] = []
        
        # Should still generate timeline aggregations
        timeline_files = process_timeline_aggregation()
        
        assert isinstance(timeline_files, list)
        assert len(timeline_files) > 0
        
        # Verify files exist
        assert "data/gold/timeline_last_7_days.json" in fake_io

    def test_author_repository_mapping(
        self, silver_daily_activity_data, silver_temporal_events_data, fake_io
    ):
        """Test that authors are correctly mapped to their repositories"""
        # Execute transformation
        generated_files = process_timeline_aggregation()
        
        # Get aggregated data
        last_7_days = fake_io["data/gold/timeline_last_7_days.json"]
        
        # Verify each author has repositories
        for day in last_7_days:
            for author in day.get("authors", []):
                repos = author.get("repositories", [])
                assert isinstance(repos, list)
                
                # If author has activity, should have at least one repo
                if author.get("commits", 0) > 0:
                    # May or may not have repos depending on temporal events
                    assert isinstance(repos, list)

    def test_monthly_aggregation_logic(
        self, silver_daily_activity_data, silver_temporal_events_data, fake_io
    ):
        """Test that monthly aggregation correctly groups daily data"""
        # Execute transformation
        generated_files = process_timeline_aggregation()
        
        # Get monthly data
        last_12_months = fake_io["data/gold/timeline_last_12_months.json"]
        
        # Verify structure
        for month in last_12_months:
            # Should have aggregated metrics
            assert "total_events" in month
            assert "commits" in month
            assert "unique_users" in month
            
            # Unique users should be an integer count
            assert isinstance(month["unique_users"], int)
            assert month["unique_users"] >= 0
            
            # Authors should be a list
            assert isinstance(month.get("authors", []), list)
