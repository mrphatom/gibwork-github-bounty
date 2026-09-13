#!/usr/bin/env node
import { Command } from 'commander';
import chalk from 'chalk';
import { config, validateConfig } from './config.js';
import { fetchIssue, postBountyComment, hasExistingBountyComment } from './github.js';
import { createBountyFromIssue } from './gibwork.js';
import type { BountyConfig } from './types.js';

const program = new Command();

program
  .name('gibwork-github-bounty')
  .description('Turn labeled GitHub issues into funded Gibwork bounties')
  .version('1.0.0');

program
  .command('create')
  .description('Create a Gibwork bounty from a specific GitHub issue')
  .requiredOption('-o, --owner <owner>', 'GitHub repository owner')
  .requiredOption('-r, --repo <repo>', 'GitHub repository name')
  .requiredOption('-i, --issue <number>', 'Issue number', parseInt)
  .option('--reward <amount>', 'Reward amount (e.g. 25.00)', config.defaultReward)
  .option('--mint <address>', 'Token mint address', config.defaultMint)
  .option('--tags <tags>', 'Comma-separated tags', config.defaultTags.join(','))
  .option('--min-submission <amount>', 'Minimum submission amount', config.defaultMinSubmission)
  .option('--force', 'Create even if a previous bounty comment exists', false)
  .option('--dry-run', 'Do not call Gibwork or spend funds', config.dryRun)
  .action(async (opts) => {
    try {
      if (opts.dryRun) {
        process.env.DRY_RUN = 'true';
        config.dryRun = true;
      }

      validateConfig(true, !config.dryRun);

      console.log(chalk.bold.blue('\nGibwork × GitHub Bounty Creator\n'));

      const issue = await fetchIssue(opts.owner, opts.repo, opts.issue);
      console.log(`Issue     : ${issue.title}`);
      console.log(`URL       : ${issue.htmlUrl}`);
      console.log(`Labels    : ${issue.labels.join(', ') || '(none)'}`);

      if (!opts.force) {
        const already = await hasExistingBountyComment(opts.owner, opts.repo, opts.issue);
        if (already) {
          console.log(chalk.yellow('\n⚠ A previous bounty comment already exists on this issue.'));
          console.log('  Use --force to create another one anyway.');
          process.exit(0);
        }
      }

      const bountyConfig: Partial<BountyConfig> = {
        rewardAmount: opts.reward,
        mintAddress: opts.mint,
        tags: opts.tags.split(',').map((t: string) => t.trim()).filter(Boolean),
        minSubmissionAmount: opts.minSubmission,
      };

      const result = await createBountyFromIssue(issue, bountyConfig);
      await postBountyComment(issue, result);

      console.log(chalk.bold.green('\nDone.\n'));
    } catch (err: any) {
      console.error(chalk.red('\nError:'), err.message || err);
      process.exit(1);
    }
  });

program
  .command('from-event')
  .description('Handle a GitHub issue event (used by the GitHub Action)')
  .option('--event-path <path>', 'Path to the GitHub event JSON file', process.env.GITHUB_EVENT_PATH)
  .option('--dry-run', 'Do not call Gibwork or spend funds', config.dryRun)
  .action(async (opts) => {
    try {
      if (opts.dryRun) {
        process.env.DRY_RUN = 'true';
        config.dryRun = true;
      }

      validateConfig(true, !config.dryRun);

      if (!opts.eventPath) {
        throw new Error('GITHUB_EVENT_PATH is not set and --event-path was not provided');
      }

      const fs = await import('fs');
      const event = JSON.parse(fs.readFileSync(opts.eventPath, 'utf-8'));

      // We only care about issues that just received the trigger label
      if (event.action !== 'labeled') {
        console.log(`Ignoring action: ${event.action}`);
        return;
      }

      const labelName = event.label?.name;
      if (labelName !== config.labelTrigger) {
        console.log(`Ignoring label: ${labelName} (trigger is "${config.labelTrigger}")`);
        return;
      }

      const issueData = event.issue;
      const repo = event.repository;

      if (!issueData || !repo) {
        throw new Error('Invalid event payload: missing issue or repository');
      }

      const issue = {
        owner: repo.owner.login,
        repo: repo.name,
        issueNumber: issueData.number,
        title: issueData.title,
        body: issueData.body || '',
        htmlUrl: issueData.html_url,
        labels: (issueData.labels || []).map((l: any) => l.name),
      };

      console.log(chalk.bold.blue('\nGibwork × GitHub – Event Handler\n'));
      console.log(`Triggered by label "${labelName}" on ${issue.owner}/${issue.repo}#${issue.issueNumber}`);

      const already = await hasExistingBountyComment(issue.owner, issue.repo, issue.issueNumber);
      if (already) {
        console.log(chalk.yellow('A bounty comment already exists. Skipping.'));
        return;
      }

      const result = await createBountyFromIssue(issue);
      await postBountyComment(issue, result);

      console.log(chalk.bold.green('\nDone.\n'));
    } catch (err: any) {
      console.error(chalk.red('\nError:'), err.message || err);
      process.exit(1);
    }
  });

program.parse();
