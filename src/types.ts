export interface BountyConfig {
  rewardAmount: string;
  mintAddress: string;
  tags: string[];
  minSubmissionAmount?: string;
  deadline?: string; // ISO string
  allowOnlyVerified?: boolean;
}

export interface IssuePayload {
  owner: string;
  repo: string;
  issueNumber: number;
  title: string;
  body: string;
  htmlUrl: string;
  labels: string[];
}

export interface CreateBountyResult {
  taskId: string;
  title: string;
  reward: string;
  bountyUrl: string;
  dryRun: boolean;
}
