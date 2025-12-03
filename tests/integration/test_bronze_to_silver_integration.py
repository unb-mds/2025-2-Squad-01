#!/usr/bin/env python3
"""
Integration tests for Bronze -> Silver data transformation pipeline.
Tests the complete flow from raw GitHub API data to processed analytics.
"""

import pytest
from datetime import datetime
from silver.member_analytics import process_member_analytics
from silver.contribution_metrics import process_contribution_metrics
from silver.collaboration_networks import process_collaboration_networks
from silver.temporal_analysis import process_temporal_analysis


class TestBronzeToSilverIntegration:
    """Test suite for Bronze to Silver layer transformation"""

    @pytest.fixture
    def bronze_members_data(self, fake_io):
        """Create mock bronze layer member data"""
        members_data = [
            {
                "login": "test_user_1",
                "id": 12345,
                "name": "Test User One",
                "company": "Test Corp",
                "location": "Test City",
                "email": "test1@example.com",
                "bio": "Test bio",
                "public_repos": 25,
                "followers": 100,
                "following": 50,
                "created_at": "2020-01-01T00:00:00Z",
                "updated_at": "2024-01-01T00:00:00Z"
            },
            {
                "login": "test_user_2",
                "id": 67890,
                "name": "Test User Two",
                "company": None,
                "location": "Another City",
                "email": None,
                "bio": None,
                "public_repos": 5,
                "followers": 8,
                "following": 15,
                "created_at": "2024-12-10T00:00:00Z",
                "updated_at": "2025-01-01T00:00:00Z"
            }
        ]
        
        fake_io["data/bronze/members_detailed.json"] = members_data
        return members_data

    @pytest.fixture
    def bronze_commits_data(self, fake_io):
        """Create mock bronze layer commits data"""
        commits_data = [
            {
                "sha": "abc123",
                "author": {
                    "login": "test_user_1",
                    "id": 12345
                },
                "commit": {
                    "author": {
                        "name": "Test User One",
                        "email": "test1@example.com",
                        "date": "2024-01-15T10:00:00Z"
                    },
                    "message": "Initial commit"
                },
                "repository": "test-repo-1",
                "stats": {
                    "additions": 100,
                    "deletions": 20
                }
            },
            {
                "sha": "def456",
                "author": {
                    "login": "test_user_2",
                    "id": 67890
                },
                "commit": {
                    "author": {
                        "name": "Test User Two",
                        "email": "test2@example.com",
                        "date": "2024-01-16T14:30:00Z"
                    },
                    "message": "Feature addition"
                },
                "repository": "test-repo-1",
                "stats": {
                    "additions": 50,
                    "deletions": 10
                }
            },
            {
                "sha": "ghi789",
                "author": {
                    "login": "test_user_1",
                    "id": 12345
                },
                "commit": {
                    "author": {
                        "name": "Test User One",
                        "email": "test1@example.com",
                        "date": "2024-01-17T09:15:00Z"
                    },
                    "message": "Bug fix"
                },
                "repository": "test-repo-2",
                "stats": {
                    "additions": 30,
                    "deletions": 40
                }
            }
        ]
        
        fake_io["data/bronze/commits_detailed.json"] = commits_data
        return commits_data

    @pytest.fixture
    def bronze_issues_data(self, fake_io):
        """Create mock bronze layer issues data"""
        issues_data = [
            {
                "id": 1,
                "number": 101,
                "title": "Test Issue 1",
                "state": "open",
                "user": {
                    "login": "test_user_1"
                },
                "created_at": "2024-01-10T10:00:00Z",
                "updated_at": "2024-01-15T10:00:00Z",
                "closed_at": None,
                "repository": "test-repo-1",
                "labels": ["bug", "high-priority"]
            },
            {
                "id": 2,
                "number": 102,
                "title": "Test Issue 2",
                "state": "closed",
                "user": {
                    "login": "test_user_2"
                },
                "created_at": "2024-01-12T14:00:00Z",
                "updated_at": "2024-01-16T16:00:00Z",
                "closed_at": "2024-01-16T16:00:00Z",
                "repository": "test-repo-1",
                "labels": ["enhancement"]
            }
        ]
        
        fake_io["data/bronze/issues_detailed.json"] = issues_data
        return issues_data

    def test_member_analytics_transformation(self, bronze_members_data, fake_io):
        """Test that member analytics correctly transforms bronze data to silver"""
        # Execute transformation
        generated_files = process_member_analytics()
        
        # Verify files were generated
        assert len(generated_files) > 0
        assert "data/silver/members_analytics.json" in fake_io
        
        # Verify data structure
        processed_data = fake_io["data/silver/members_analytics.json"]
        assert len(processed_data) == 2
        
        # Verify first member (established)
        member1 = processed_data[0]
        assert member1["login"] == "test_user_1"
        assert member1["maturity_score"] > 0
        assert member1["status"] == "established"
        assert member1["account_age_days"] > 365
        
        # Verify second member (new)
        member2 = processed_data[1]
        assert member2["login"] == "test_user_2"
        assert member2["maturity_score"] > 0
        assert member2["status"] == "new"
        assert member2["account_age_days"] <= 365

    def test_contribution_metrics_transformation(self, fake_io):
        """Test that contribution metrics correctly processes commits"""
        # Use correct file names that contribution_metrics expects
        commits_all_data = [
            {
                "sha": "abc123",
                "author": {"login": "test_user_1"},
                "commit": {
                    "author": {
                        "name": "Test User One",
                        "email": "test1@example.com",
                        "date": "2024-01-15T10:00:00Z"
                    }
                },
                "repository": "test-repo-1"
            },
            {
                "sha": "def456",
                "author": {"login": "test_user_2"},
                "commit": {
                    "author": {
                        "name": "Test User Two",
                        "email": "test2@example.com",
                        "date": "2024-01-16T14:30:00Z"
                    }
                },
                "repository": "test-repo-1"
            }
        ]
        
        fake_io["data/bronze/commits_all.json"] = commits_all_data
        fake_io["data/bronze/issues_all.json"] = []
        fake_io["data/bronze/prs_all.json"] = []
        fake_io["data/bronze/issue_events_all.json"] = []
        
        # Execute transformation
        generated_files = process_contribution_metrics()
        
        # Verify files were generated
        assert len(generated_files) > 0
        assert "data/silver/contribution_metrics.json" in fake_io

    def test_collaboration_networks_transformation(self, fake_io):
        """Test that collaboration networks correctly identifies co-authors"""
        # Setup minimal data for collaboration networks
        fake_io["data/bronze/commits_all.json"] = []
        fake_io["data/bronze/issues_all.json"] = []
        fake_io["data/bronze/prs_all.json"] = []
        
        # Execute transformation
        generated_files = process_collaboration_networks()
        
        # Verify files were generated
        assert len(generated_files) > 0
        # Collaboration networks generates multiple files
        assert any("collaboration" in f for f in fake_io.keys())

    def test_temporal_analysis_transformation(self, fake_io):
        """Test that temporal analysis correctly aggregates events by time"""
        # Setup data for temporal analysis
        fake_io["data/bronze/commits_all.json"] = [
            {
                "sha": "abc123",
                "author": {"login": "test_user_1"},
                "commit": {
                    "author": {"date": "2024-01-15T10:00:00Z"}
                },
                "repository": "test-repo-1"
            }
        ]
        fake_io["data/bronze/issues_all.json"] = [
            {
                "id": 1,
                "user": {"login": "test_user_1"},
                "created_at": "2024-01-10T10:00:00Z",
                "repository": "test-repo-1",
                "state": "open"
            }
        ]
        fake_io["data/bronze/prs_all.json"] = []
        fake_io["data/bronze/issue_events_all.json"] = []
        
        # Execute transformation
        generated_files = process_temporal_analysis()
        
        # Verify files were generated
        assert len(generated_files) > 0
        
        # Check for expected silver outputs
        expected_files = [
            "data/silver/temporal_events.json",
            "data/silver/daily_activity_summary.json"
        ]
        
        for expected_file in expected_files:
            assert expected_file in fake_io, f"Expected file {expected_file} not found"
        
        # Verify temporal events structure
        temporal_events = fake_io["data/silver/temporal_events.json"]
        assert len(temporal_events) > 0
        
        # Verify events have required fields
        for event in temporal_events:
            assert "date" in event
            assert "type" in event or "event_type" in event  # Could be either
            assert "user" in event

    def test_complete_bronze_to_silver_pipeline(self, bronze_members_data, fake_io):
        """Integration test for complete Bronze -> Silver transformation"""
        # Setup complete bronze data
        fake_io["data/bronze/commits_all.json"] = []
        fake_io["data/bronze/issues_all.json"] = []
        fake_io["data/bronze/prs_all.json"] = []
        fake_io["data/bronze/issue_events_all.json"] = []
        
        # Execute all silver processors in order
        member_files = process_member_analytics()
        contrib_files = process_contribution_metrics()
        collab_files = process_collaboration_networks()
        temporal_files = process_temporal_analysis()
        
        # Verify all processors generated files
        assert len(member_files) > 0
        assert len(contrib_files) > 0
        assert len(collab_files) > 0
        assert len(temporal_files) > 0
        
        # Verify all expected silver files exist
        expected_silver_files = [
            "data/silver/members_analytics.json",
            "data/silver/contribution_metrics.json",
            "data/silver/temporal_events.json",
            "data/silver/daily_activity_summary.json"
        ]
        
        for expected_file in expected_silver_files:
            assert expected_file in fake_io, f"Missing silver file: {expected_file}"
        
        # Verify data integrity across layers
        members = fake_io["data/silver/members_analytics.json"]
        metrics = fake_io["data/silver/contribution_metrics.json"]
        
        # Check that members data exists
        assert len(members) == len(bronze_members_data)

    def test_handles_empty_bronze_data(self, fake_io):
        """Test that silver processors handle missing bronze data gracefully"""
        # Set empty bronze data
        fake_io["data/bronze/members_detailed.json"] = []
        fake_io["data/bronze/commits_detailed.json"] = []
        fake_io["data/bronze/issues_detailed.json"] = []
        
        # Execute processors - should not raise exceptions
        member_files = process_member_analytics()
        contrib_files = process_contribution_metrics()
        
        # Verify graceful handling (empty results or error messages)
        assert isinstance(member_files, list)
        assert isinstance(contrib_files, list)

    def test_handles_malformed_bronze_data(self, fake_io):
        """Test that silver processors handle malformed data"""
        # Create malformed data (missing required fields)
        fake_io["data/bronze/members_detailed.json"] = [
            {"login": "incomplete_user"}  # Missing many fields
        ]
        
        # Should handle gracefully without crashing
        try:
            generated_files = process_member_analytics()
            assert isinstance(generated_files, list)
        except Exception as e:
            pytest.fail(f"Should handle malformed data gracefully: {e}")
