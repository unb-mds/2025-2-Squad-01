
export interface TimelineData {
  date: string;
  users: {
    name?: string;
    repositories?: string[];
    activities: {
        commits: number;
        issues_created: number;
        issues_closed: number;
        prs_created: number;
        prs_closed: number;
        comments: number;
    }
  }[];
}

export class TimelineExtraction {

   
    static async extractTimelineData(time_filter: string, repo_filter?: string): Promise<TimelineData[]> {
        
        let url: string = '';

        if (time_filter === 'last_7_days') {
            url = 'https://raw.githubusercontent.com/unb-mds/2025-2-Squad-01/timeline-implementation/data/gold/timeline_last_7_days.json';
        } else if (time_filter === 'last_12_months') {
            url = 'https://raw.githubusercontent.com/unb-mds/2025-2-Squad-01/timeline-implementation/data/gold/timeline_last_12_months.json';
        } else {
            throw new Error(`Invalid time filter: ${time_filter}. Use 'last_7_days' or 'last_12_months'`);
        }

        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`Failed to fetch data: ${response.status} ${response.statusText}`);
        }

        const rawData = await response.json();
        const processedData = this.processTimelineData(rawData, repo_filter);

        return processedData;
    }
    
    static processTimelineData(rawData: any[], repo_filter?: string): TimelineData[] {
        // Filter out metadata entry and map directly to TimelineData
        const timelineData: TimelineData[] = rawData
            .filter((item: any) => item._metadata === undefined)
            .map((item: any) => ({
                date: item.date,
                users: item.authors
                    .map((author: any) => ({
                        name: author.name,
                        repositories: author.repositories || [],
                        activities: {
                            commits: author.commits || 0,
                            issues_created: author.issues_created || 0,
                            issues_closed: author.issues_closed || 0,
                            prs_created: author.prs_created || 0,
                            prs_closed: author.prs_closed || 0,
                            comments: author.comments || 0
                        }
                    }))
                    // Apply repo filter per user if provided
                    .filter((user: any) => {
                        if (!repo_filter || repo_filter === 'all') return true;
                        return user.repositories && user.repositories.some((repo: string) => 
                            repo.toLowerCase().includes(repo_filter.toLowerCase())
                        );
                    })
            }));
            // NÃO remover dias vazios - manter todos os dias mesmo sem usuários

        return timelineData;
    }

    // Test method
    static async testExtraction(): Promise<void> {
        try {
            console.log('Testing last_7_days extraction...');
            const data7days = await this.extractTimelineData('last_7_days');
            console.log('✓ Last 7 days data:', data7days);
            console.log(`  - Days: ${data7days.length}`);
            console.log(`  - Total users: ${data7days.reduce((sum, day) => sum + day.users.length, 0)}`);
            
            console.log('\nTesting last_12_months extraction...');
            const data12months = await this.extractTimelineData('last_12_months');
            console.log('✓ Last 12 months data:', data12months);
            console.log(`  - Months: ${data12months.length}`);
            console.log(`  - Total users: ${data12months.reduce((sum, month) => sum + month.users.length, 0)}`);
            
            console.log('\nTesting repo filter (2025-2-Squad-01)...');
            const filteredData = await this.extractTimelineData('last_7_days', '2025-2-Squad-01');
            console.log('✓ Filtered data:', filteredData);
            console.log(`  - Days with 2025-2-Squad-01: ${filteredData.length}`);
            
            console.log('\n✓ All tests passed!');
        } catch (error) {
            console.error('✗ Test failed:', error);
        }
    }
  
}