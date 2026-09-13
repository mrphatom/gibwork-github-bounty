import { createGibworkClient } from '@gibwork/sdk/node';
import { config } from './config.js';
import type { BountyConfig, CreateBountyResult, IssuePayload } from './types.js';
import chalk from 'chalk';

let client: ReturnType<typeof createGibworkClient> | null = null;

function getClient() {
  if (!client) {
    if (!config.solanaPrivateKey) {
      throw new Error('No Solana private key configured');
    }
    client = createGibworkClient({
      privateKey: config.solanaPrivateKey,
      production: config.gibworkEnvironment === 'production',
    });
  }
  return client;
}

/**
 * Build a clean HTML content string for the Gibwork bounty from a GitHub issue.
 */
export function buildBountyContent(issue: IssuePayload): string {
  return `
<p><strong>Source:</strong> <a href="${issue.htmlUrl}">GitHub Issue #${issue.issueNumber}</a> in <code>${issue.owner}/${issue.repo}</code></p>
<hr/>
${issue.body || '<p><em>No description provided.</em></p>'}
<hr/>
<p><em>This bounty was automatically created from a GitHub issue labeled <code>${config.labelTrigger}</code>.</em></p>
`.trim();
}

/**
 * Create a Gibwork bounty from a GitHub issue.
 * Supports dry-run mode.
 */
export async function createBountyFromIssue(
  issue: IssuePayload,
  bountyConfig: Partial<BountyConfig> = {}
): Promise<CreateBountyResult> {
  const finalConfig: BountyConfig = {
    rewardAmount: bountyConfig.rewardAmount || config.defaultReward,
    mintAddress: bountyConfig.mintAddress || config.defaultMint,
    tags: bountyConfig.tags || config.defaultTags,
    minSubmissionAmount: bountyConfig.minSubmissionAmount || config.defaultMinSubmission,
    deadline: bountyConfig.deadline,
    allowOnlyVerified: bountyConfig.allowOnlyVerified ?? false,
  };

  const title = issue.title.length > 120 
    ? issue.title.slice(0, 117) + '...' 
    : issue.title;

  const content = buildBountyContent(issue);

  console.log(chalk.cyan('\n→ Preparing Gibwork bounty...'));
  console.log(`  Title     : ${title}`);
  console.log(`  Reward    : ${finalConfig.rewardAmount} (mint: ${finalConfig.mintAddress})`);
  console.log(`  Tags      : ${finalConfig.tags.join(', ')}`);
  console.log(`  Dry-run   : ${config.dryRun}`);
  console.log(`  Env       : ${config.gibworkEnvironment}`);

  if (config.dryRun) {
    const fakeId = `dry-run-${Date.now()}`;
    console.log(chalk.yellow('\n[DRY-RUN] Skipping actual Gibwork API call.'));
    return {
      taskId: fakeId,
      title,
      reward: finalConfig.rewardAmount,
      bountyUrl: `https://gib.work/task/${fakeId}`,
      dryRun: true,
    };
  }

  const gibwork = getClient();

  const task = await gibwork.tasks.create({
    title,
    content,
    tags: finalConfig.tags,
    payment: {
      mintAddress: finalConfig.mintAddress,
      amount: finalConfig.rewardAmount,
    },
    minSubmissionAmount: finalConfig.minSubmissionAmount,
  });

  const bountyUrl = `https://gib.work/task/${task.taskId}`;

  console.log(chalk.green(`\n✓ Bounty created successfully`));
  console.log(`  Task ID   : ${task.taskId}`);
  console.log(`  URL       : ${bountyUrl}`);

  return {
    taskId: task.taskId,
    title,
    reward: finalConfig.rewardAmount,
    bountyUrl,
    dryRun: false,
  };
}
