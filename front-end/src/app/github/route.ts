
import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';

const GITHUB_API_BASE = 'https://api.github.com';
const DEFAULT_ORG = 'unb-mds';
// Conservative defaults to make the app usable without a GitHub token
const DEFAULT_MAX_REPOS = 100;
const DEFAULT_MAX_COMMITS_PER_REPO = 100;
const DEFAULT_PAGE_SIZE = 100;
const DEFAULT_CONCURRENCY = 3;

type RepoResponse = {
	id: number;
	name: string;
	full_name: string;
	html_url: string;
	default_branch: string;
};

type CommitResponse = {
	sha: string;
	html_url: string;
	commit: {
		message: string;
		author: {
			name: string;
			email?: string;
			date: string;
		} | null;
	};
	author: {
		login: string;
		html_url: string;
	} | null;
};

type AggregatedCommit = {
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

type RepoCommitSummary = {
	id: number;
	name: string;
	fullName: string;
	url: string;
	defaultBranch: string;
	commits: AggregatedCommit[];
};

type RateLimitInfo = {
	limit?: number;
	remaining?: number;
	reset?: number;
	exceeded?: boolean;
};

export const runtime = 'nodejs';
export const revalidate = 600; // cache upstream responses for 10 minutes by default

export async function GET(request: NextRequest) {
	try {
		const searchParams = request.nextUrl.searchParams;
		const org = searchParams.get('org')?.trim() || DEFAULT_ORG;
		const maxRepos = parsePositiveInt(searchParams.get('maxRepos')) ?? DEFAULT_MAX_REPOS;
		const maxCommitsPerRepo = parsePositiveInt(searchParams.get('maxCommits')) ?? DEFAULT_MAX_COMMITS_PER_REPO;
		const since = searchParams.get('since') ?? undefined;
		const until = searchParams.get('until') ?? undefined;

		const rateLimit: RateLimitInfo = {};
		const repos = await fetchAllRepos(org, { maxRepos, rateLimit });

		const repoSummaries = await collectCommits(org, repos, {
			maxCommitsPerRepo,
			since,
			until,
			rateLimit,
		});

		const { commitsByDate, commitsByAuthor, totalCommits } = aggregateCommits(repoSummaries);

		// Mark if rate limit was reached during collection
		rateLimit.exceeded = rateLimit.remaining !== undefined && rateLimit.remaining <= 0;

		// If we hit rate limit and collected no repositories, return a small sample
		if (rateLimit.exceeded && repoSummaries.length === 0) {
			try {
				const samplePath = new URL('./sample-response.json', import.meta.url);
				const raw = await readFile(samplePath, { encoding: 'utf8' });
				const sample = JSON.parse(raw);
				sample.rateLimit = sample.rateLimit || {};
				sample.rateLimit.sampleUsed = true;
				return NextResponse.json(sample);
			} catch (e) {
				console.warn('[github-route] Failed to load sample response', e);
			}
		}

		return NextResponse.json({
			org,
			generatedAt: new Date().toISOString(),
			repoCount: repoSummaries.length,
			totalCommits,
			commitsByDate,
			commitsByAuthor,
			repositories: repoSummaries,
			rateLimit,
		});
	} catch (error) {
		console.error('[github-route] Failed to collect data', error);

		return NextResponse.json(
			{
				error: 'Failed to collect GitHub data',
				details: error instanceof Error ? error.message : String(error),
			},
			{ status: 500 },
		);
	}
}

function parsePositiveInt(value: string | null): number | undefined {
	if (!value) return undefined;
	const parsed = Number.parseInt(value, 10);
	return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
}

async function fetchAllRepos(
	org: string,
	options: { maxRepos?: number; rateLimit: RateLimitInfo },
): Promise<RepoResponse[]> {
	const { maxRepos, rateLimit } = options;
	const repos: RepoResponse[] = [];

	let page = 1;
	while (!maxRepos || repos.length < maxRepos) {
		const url = new URL(`${GITHUB_API_BASE}/orgs/${org}/repos`);
		url.searchParams.set('per_page', DEFAULT_PAGE_SIZE.toString());
		url.searchParams.set('page', page.toString());
		url.searchParams.set('type', 'all');

		const response = await fetchWithGitHubHeaders(url.toString());
		updateRateLimit(rateLimit, response.headers);

		// If we've hit rate limit, stop gracefully and return what we have so far.
		if (response.status === 403) {
			// mark as exceeded
			rateLimit.remaining = 0;
			break;
		}

		if (!response.ok) {
			throw new Error(`Failed to fetch repositories for ${org}: ${response.status} ${response.statusText}`);
		}

		const data = (await response.json()) as RepoResponse[];
		repos.push(...data);

		if (data.length < DEFAULT_PAGE_SIZE) {
			break; // reached last page
		}

		page += 1;
	}

	if (maxRepos && repos.length > maxRepos) {
		return repos.slice(0, maxRepos);
	}

	return repos;
}

async function collectCommits(
	org: string,
	repos: RepoResponse[],
	options: {
		maxCommitsPerRepo: number;
		since?: string;
		until?: string;
		rateLimit: RateLimitInfo;
	},
): Promise<RepoCommitSummary[]> {
	const { maxCommitsPerRepo, since, until, rateLimit } = options;

	const summaries: RepoCommitSummary[] = [];
	for (let i = 0; i < repos.length; i += DEFAULT_CONCURRENCY) {
		const slice = repos.slice(i, i + DEFAULT_CONCURRENCY);
		const chunkResults = await Promise.all(
			slice.map(async (repo) => {
				const commits = await fetchCommitsForRepo(org, repo.name, maxCommitsPerRepo, { since, until, rateLimit });
				return buildRepoSummary(repo, commits);
			}),
		);
		summaries.push(...chunkResults);
	}

	return summaries;
}

async function fetchCommitsForRepo(
	org: string,
	repo: string,
	maxCommits: number,
	options: { since?: string; until?: string; rateLimit: RateLimitInfo },
): Promise<AggregatedCommit[]> {
	const { since, until, rateLimit } = options;
	const commits: AggregatedCommit[] = [];
	const seenShas = new Set<string>();
	let page = 1;

	while (commits.length < maxCommits) {
		const remaining = maxCommits - commits.length;
		const perPage = Math.min(DEFAULT_PAGE_SIZE, remaining);
		const url = new URL(`${GITHUB_API_BASE}/repos/${org}/${repo}/commits`);
		url.searchParams.set('per_page', perPage.toString());
		url.searchParams.set('page', page.toString());
		if (since) url.searchParams.set('since', since);
		if (until) url.searchParams.set('until', until);

		const response = await fetchWithGitHubHeaders(url.toString());
		updateRateLimit(rateLimit, response.headers);

		// If we've hit rate limit, stop fetching more commits for this repo and return what we have
		if (response.status === 403) {
			rateLimit.remaining = 0;
			break;
		}

		if (!response.ok) {
			throw new Error(`Failed to fetch commits for ${org}/${repo}: ${response.status} ${response.statusText}`);
		}

		const data = (await response.json()) as CommitResponse[];

		for (const item of data) {
			const committedAt = item.commit.author?.date ?? null;
			if (!committedAt) continue;

			// Normalize author information to produce more consistent labels
			const authorLoginRaw = item.author?.login ?? item.commit.author?.email ?? null;
			const authorLogin = authorLoginRaw ? String(authorLoginRaw).toLowerCase() : 'unknown';
			const displayName = item.commit.author?.name ?? item.author?.login ?? item.commit.author?.email ?? 'Desconhecido';

			if (seenShas.has(item.sha)) continue; // dedupe by sha
			seenShas.add(item.sha);

			commits.push({
				sha: item.sha,
				url: item.html_url,
				message: item.commit.message,
				author: {
					login: authorLogin,
					displayName,
					profileUrl: item.author?.html_url ?? undefined,
				},
				committedAt,
			});
		}

		if (data.length < perPage) {
			break; // no more pages
		}

		page += 1;
	}

	return commits;
}

function buildRepoSummary(repo: RepoResponse, commits: AggregatedCommit[]): RepoCommitSummary {
	return {
		id: repo.id,
		name: repo.name,
		fullName: repo.full_name,
		url: repo.html_url,
		defaultBranch: repo.default_branch,
		commits,
	};
}

function aggregateCommits(repos: RepoCommitSummary[]) {
	const commitsByDate = new Map<string, number>();
	const commitsByAuthor = new Map<string, number>();
	let totalCommits = 0;

	for (const repo of repos) {
		for (const commit of repo.commits) {
			totalCommits += 1;

			const date = commit.committedAt.slice(0, 10);
			commitsByDate.set(date, (commitsByDate.get(date) ?? 0) + 1);

			const authorKey = commit.author.login;
			commitsByAuthor.set(authorKey, (commitsByAuthor.get(authorKey) ?? 0) + 1);
		}
	}

	return {
		commitsByDate: [...commitsByDate.entries()]
			.map(([date, count]) => ({ date, count }))
			.sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0)),
		commitsByAuthor: [...commitsByAuthor.entries()]
			.map(([author, count]) => ({ author, count }))
			.sort((a, b) => b.count - a.count),
		totalCommits,
	};
}

async function fetchWithGitHubHeaders(url: string): Promise<Response> {
	const headers: Record<string, string> = {
		'User-Agent': 'webapp-commit-aggregator',
		Accept: 'application/vnd.github+json',
	};

	// If a GitHub token is provided in the environment, use it to increase rate limits.
	// The token can be set in a local `.env.local` file as GITHUB_TOKEN=... and Next.js
	// will expose it server-side in `process.env` for this route.
	const token = process.env.GITHUB_TOKEN;
	if (token) {
		headers['Authorization'] = `Bearer ${token}`;
	}

	return fetch(url, {
		headers,
		cache: 'no-store',
		signal: AbortSignal.timeout(30_000),
	});
}

function updateRateLimit(rateLimit: RateLimitInfo, headers: Headers) {
	const limit = headers.get('x-ratelimit-limit');
	const remaining = headers.get('x-ratelimit-remaining');
	const reset = headers.get('x-ratelimit-reset');

	if (limit !== null) rateLimit.limit = Number(limit);
	if (remaining !== null) rateLimit.remaining = Number(remaining);
	if (reset !== null) rateLimit.reset = Number(reset);
}
