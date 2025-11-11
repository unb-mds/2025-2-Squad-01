#!/usr/bin/env python3

import os
from typing import List
from utils.github_api import GitHubAPIClient, OrganizationConfig, save_json_data

def extract_members(client: GitHubAPIClient, config: OrganizationConfig, use_cache: bool = True) -> List[str]:
    
    members_url = f"https://api.github.com/orgs/{config.org_name}/members"
    raw_members = client.get_with_cache(members_url, use_cache)
    
    if not raw_members or len(raw_members) == 0:
        print(" Organization members API returned empty. This could be due to:")
        print("   - Private member visibility settings")
        print("   - Insufficient token permissions")
        print("   - Organization configuration")
        print("Activating fallback: discovering active contributors...")

        
        
        
        from utils.github_api import load_json_data
        repos_data = load_json_data("data/bronze/repositories_filtered.json")
        if repos_data and isinstance(repos_data, list):
            
            if len(repos_data) > 0 and isinstance(repos_data[0], dict) and '_metadata' in repos_data[0]:
                repos_data = repos_data[1:]
            
           
            contributors_set = set()
            contributor_details = {}
            
            for repo in repos_data:
                if repo and isinstance(repo, dict) and repo.get('full_name'):
                    contrib_url = f"https://api.github.com/repos/{repo['full_name']}/contributors"
                    repo_contributors = client.get_with_cache(contrib_url, use_cache)
                    if repo_contributors and isinstance(repo_contributors, list):
                        for contrib in repo_contributors:
                            if contrib and isinstance(contrib, dict) and contrib.get('login'):
                                login = contrib['login']
                                contributors_set.add(login)
                                # Store contributor details (contributions count, etc.)
                                if login not in contributor_details:
                                    contributor_details[login] = {
                                        'login': login,
                                        'type': contrib.get('type', 'User'),
                                        'contributions_total': contrib.get('contributions', 0),
                                        'avatar_url': contrib.get('avatar_url'),
                                        'html_url': contrib.get('html_url'),
                                        'data_source': 'contributors_api',
                                        'discovered_from_repo': repo.get('name')
                                    }
                                else:
                                    # Accumulate contributions from multiple repos
                                    contributor_details[login]['contributions_total'] += contrib.get('contributions', 0)
            
            if contributors_set:
                print(f" Fallback successful: Found {len(contributors_set)} active contributors")
                raw_members = list(contributor_details.values())
                
                # Sort by contributions to prioritize most active contributors
                raw_members.sort(key=lambda x: x.get('contributions_total', 0), reverse=True)
                print(f"Top contributor: {raw_members[0]['login']} ({raw_members[0]['contributions_total']} contributions)")
            else:
                print(" Fallback failed: No contributors found in repositories")
                raw_members = []
        else:
            print(" Fallback impossible: No repository data available")
            raw_members = []
    else:
        print(f" Successfully fetched {len(raw_members)} organization members via members API")
    
    if not raw_members:
        print("  No members data available, but continuing with empty dataset")
        raw_members = []
    
    print(f" Found {len(raw_members)} organization members")
    
    generated_files = []
    
    # Save empty members file if no data
    if len(raw_members) == 0:
        empty_members_file = save_json_data(
            [], 
            "data/bronze/members_basic.json"
        )
        generated_files.append(empty_members_file)
        
        empty_detailed_file = save_json_data(
            [],
            "data/bronze/members_detailed.json"
        )
        generated_files.append(empty_detailed_file)
        
        print(" Created empty member files to maintain data structure")
        return generated_files
    
    # Save members basic info
    members_file = save_json_data(
        raw_members, 
        "data/bronze/members_basic.json"
    )
    generated_files.append(members_file)
    
    # Get detailed member info
    detailed_members = []
    # Note: Detailed member extraction is commented out to reduce API calls
    # Uncomment the following lines if detailed member info is needed:
    # for member in raw_members:
    #     member_url = f"https://api.github.com/users/{member['login']}"
    #     detail = client.get_with_cache(member_url, use_cache)
    #     if detail:
    #         detailed_members.append(detail)
    
    # Always save detailed members file (even if empty) to ensure file exists
    detailed_file = save_json_data(
        detailed_members,
        "data/bronze/members_detailed.json"
    )
    generated_files.append(detailed_file)
    
    # Save individual member files only if we have detailed data
    if detailed_members:
        for member in detailed_members:
            member_file = save_json_data(
                member,
                f"data/bronze/member_{member['login']}.json"
            )
            generated_files.append(member_file)
    
    return generated_files