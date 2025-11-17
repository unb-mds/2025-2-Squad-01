#!/usr/bin/env python3
"""
GitHub GraphQL API Client
Provides methods to query GitHub's GraphQL API for detailed commit data
"""

import requests
from typing import Dict, Any, List, Optional
import time


class GitHubGraphQLClient:
    """Client for interacting with GitHub's GraphQL API"""
    
    def __init__(self, token: str):
        self.token = token
        self.endpoint = "https://api.github.com/graphql"
        self.headers = {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json"
        }
    
    def execute_query(self, query: str, variables: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """
        Execute a GraphQL query
        
        Args:
            query: GraphQL query string
            variables: Optional variables for the query
            
        Returns:
            Response data from GitHub GraphQL API
        """
        payload = {"query": query}
        if variables:
            payload["variables"] = variables
        
        try:
            response = requests.post(
                self.endpoint,
                json=payload,
                headers=self.headers,
                timeout=30
            )
            
            if response.status_code == 200:
                result = response.json()
                
                # Check for GraphQL errors
                if "errors" in result:
                    print(f"[ERROR] GraphQL errors: {result['errors']}")
                    return None
                
                self._log_rate_limit(response)
                return result.get("data")
            
            elif response.status_code == 403:
                print(f"[ERROR] GraphQL request forbidden (403)")
                if "rate limit" in response.text.lower():
                    print("Rate limit exceeded. Waiting 60 seconds...")
                    time.sleep(60)
                return None
            
            else:
                print(f"[ERROR] GraphQL request failed: {response.status_code} - {response.text}")
                return None
                
        except requests.exceptions.Timeout:
            print("[ERROR] GraphQL request timeout")
            return None
        except requests.exceptions.RequestException as e:
            print(f"[ERROR] GraphQL request error: {str(e)}")
            return None
    
    def _log_rate_limit(self, response: requests.Response) -> None:
        """Log rate limit information from response headers"""
        remaining = response.headers.get('X-RateLimit-Remaining', 'Unknown')
        limit = response.headers.get('X-RateLimit-Limit', 'Unknown')
        print(f"GraphQL Rate limit: {remaining}/{limit}")
    
    def get_repository_commits(
        self,
        owner: str,
        repo_name: str,
        branch: str = "main",
        max_commits: int = 100,
        cursor: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Get detailed commit information including additions and deletions
        
        Args:
            owner: Repository owner (organization or user)
            repo_name: Repository name
            branch: Branch name (default: main)
            max_commits: Maximum number of commits to fetch per query (max 100)
            cursor: Pagination cursor for fetching next page
            
        Returns:
            Dictionary containing commits data and pagination info
        """
        
        query = """
        query($owner: String!, $name: String!, $branch: String!, $maxCommits: Int!, $cursor: String) {
          repository(owner: $owner, name: $name) {
            ref(qualifiedName: $branch) {
              target {
                ... on Commit {
                  history(first: $maxCommits, after: $cursor) {
                    pageInfo {
                      hasNextPage
                      endCursor
                    }
                    totalCount
                    nodes {
                      oid
                      message
                      committedDate
                      author {
                        name
                        email
                        user {
                          login
                        }
                      }
                      committer {
                        name
                        email
                        user {
                          login
                        }
                      }
                      additions
                      deletions
                      changedFiles
                      parents(first: 1) {
                        totalCount
                      }
                      tree {
                        oid
                      }
                    }
                  }
                }
              }
            }
          }
        }
        """
        
        variables = {
            "owner": owner,
            "name": repo_name,
            "branch": branch,
            "maxCommits": min(max_commits, 100),  # GraphQL has a max of 100
            "cursor": cursor
        }
        
        return self.execute_query(query, variables)
    
    def get_all_repository_commits(
        self,
        owner: str,
        repo_name: str,
        branch: str = "main",
        max_total_commits: Optional[int] = None
    ) -> List[Dict[str, Any]]:
        """
        Get all commits from a repository with pagination
        
        Args:
            owner: Repository owner
            repo_name: Repository name
            branch: Branch name
            max_total_commits: Maximum total commits to fetch (None = all)
            
        Returns:
            List of all commits with detailed information
        """
        all_commits = []
        cursor = None
        has_next_page = True
        
        while has_next_page:
            # Check if we've reached the limit
            if max_total_commits and len(all_commits) >= max_total_commits:
                break
            
            # Calculate how many commits to fetch in this batch
            remaining = max_total_commits - len(all_commits) if max_total_commits else 100
            batch_size = min(remaining, 100) if max_total_commits else 100
            
            print(f"Fetching commits batch (cursor: {cursor[:10] + '...' if cursor else 'start'})")
            
            result = self.get_repository_commits(
                owner=owner,
                repo_name=repo_name,
                branch=branch,
                max_commits=batch_size,
                cursor=cursor
            )
            
            if not result:
                print(f"[WARNING] No data returned for {owner}/{repo_name}")
                break
            
            # Navigate the response structure
            try:
                ref_data = result.get("repository", {}).get("ref")
                if not ref_data:
                    print(f"[WARNING] Branch '{branch}' not found in {owner}/{repo_name}")
                    break
                
                history = ref_data.get("target", {}).get("history", {})
                commits = history.get("nodes", [])
                page_info = history.get("pageInfo", {})
                
                all_commits.extend(commits)
                
                has_next_page = page_info.get("hasNextPage", False)
                cursor = page_info.get("endCursor")
                
                print(f"Fetched {len(commits)} commits. Total so far: {len(all_commits)}")
                
            except Exception as e:
                print(f"[ERROR] Error processing GraphQL response: {str(e)}")
                break
        
        return all_commits
    
    def get_commit_details(
        self,
        owner: str,
        repo_name: str,
        commit_oid: str
    ) -> Optional[Dict[str, Any]]:
        """
        Get detailed information about a specific commit
        
        Args:
            owner: Repository owner
            repo_name: Repository name
            commit_oid: Commit SHA/OID
            
        Returns:
            Detailed commit information
        """
        
        query = """
        query($owner: String!, $name: String!, $oid: GitObjectID!) {
          repository(owner: $owner, name: $name) {
            object(oid: $oid) {
              ... on Commit {
                oid
                message
                committedDate
                author {
                  name
                  email
                  user {
                    login
                  }
                }
                committer {
                  name
                  email
                  user {
                    login
                  }
                }
                additions
                deletions
                changedFiles
                parents(first: 10) {
                  totalCount
                  nodes {
                    oid
                  }
                }
                tree {
                  oid
                }
              }
            }
          }
        }
        """
        
        variables = {
            "owner": owner,
            "name": repo_name,
            "oid": commit_oid
        }
        
        result = self.execute_query(query, variables)
        
        if result:
            return result.get("repository", {}).get("object")
        
        return None
