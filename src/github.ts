import { Octokit } from '@octokit/rest';
import { config } from './config.js';
import type { IssuePayload } from './types.js';
import chalk from 'chalk';

function getOctokit() {
  if (!config.githubToken) {
    throw new Error('GITHUB_TOKEN is required');
  }
  return new Octokit({ auth: config.githubToken });
}

/**
 * Fetch a single issue and map it to our internal shape.
 */
export async function fetchIssue(
  owner: string,
  repo: string,
  issueNumber: number
): Promise<IssuePayload> {
  const octokit = getOctokit();
  const { data } = await octokit.rest.issues.get({
    owner,
    repo,
    issue_number: issueNumber,
  });

  return {
    owner,
    repo,
    issueNumber: data.number,
    title: data.title,
    body: data.body || '',
    htmlUrl: data.html_url,
    labels: (data.labels || []).map((l: any) => (typeof l === 'string' ? l : l.name)),
  };
}

/**
 * Post a comment on the issue with the created bounty details.
 */
export async function postBountyComment(
  issue: IssuePayload,
  result: { taskId: string; bountyUrl: string; reward: string; dryRun: boolean }
): Promise<void> {
  const octokit = getOctokit();

  const body = result.dryRun
    ? `### [DRY-RUN] Gibwork Bounty Prepared

A bounty **would** have been created for this issue.

- **Task ID**: \`${result.taskId}\`
- **Reward**: ${result.reward}
- **URL**: ${result.bountyUrl}

> This was a dry-run. No real bounty was created and no funds were moved.`
    : `### Gibwork Bounty Created

A funded bounty has been created for this issue.

- **Task ID**: \`${result.taskId}\`
- **Reward**: ${result.reward} USDC
- **Bounty**: ${result.bountyUrl}

Interested contributors can submit work directly on Gibwork.  
Once a submission is approved, payment is released on-chain.`;

  await octokit.rest.issues.createComment({
    owner: issue.owner,
    repo: issue.repo,
    issue_number: issue.issueNumber,
    body,
  });

  console.log(chalk.green(`✓ Comment posted on ${issue.owner}/${issue.repo}#${issue.issueNumber}`));
}

/**
 * Check whether the issue already has a comment from this tool (simple heuristic).
 */
export async function hasExistingBountyComment(
  owner: string,
  repo: string,
  issueNumber: number
): Promise<boolean> {
  const octokit = getOctokit();
  const { data: comments } = await octokit.rest.issues.listComments({
    owner,
    repo,
    issue_number: issueNumber,
    per_page: 30,
  });

  return comments.some(c => 
    c.body?.includes('Gibwork Bounty Created') || 
    c.body?.includes('[DRY-RUN] Gibwork Bounty Prepared')
  );
}
