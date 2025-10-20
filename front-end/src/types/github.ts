export type AggregatedCommit = {
  sha: string;
  url: string;
  message: string;
  author: {
    login: string;
    displayName: string;
    profileUrl?: string;
  };
  committedAt: string;
};

export type RepoCommitSummary = {
  id: number;
  name: string;
  fullName: string;
  url: string;
  defaultBranch: string;
  commits: AggregatedCommit[];
};

export type GithubSummaryResponse = {
  generatedAt: string;
  repoCount: number;
  totalCommits: number;
  repositories: RepoCommitSummary[];
};
