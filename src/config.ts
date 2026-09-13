import 'dotenv/config';

export const config = {
  // GitHub
  githubToken: process.env.GITHUB_TOKEN || process.env.GH_TOKEN || '',
  
  // Gibwork / Solana
  solanaPrivateKey: process.env.SOLANA_PRIVATE_KEY || process.env.GIBWORK_PRIVATE_KEY || '',
  gibworkEnvironment: (process.env.GIBWORK_ENVIRONMENT || 'stage') as 'stage' | 'production',
  
  // Defaults for bounties created from issues
  defaultReward: process.env.DEFAULT_REWARD_AMOUNT || '25.00',
  defaultMint: process.env.DEFAULT_MINT_ADDRESS || 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', // USDC
  defaultMinSubmission: process.env.DEFAULT_MIN_SUBMISSION || '5.00',
  defaultTags: (process.env.DEFAULT_TAGS || 'github,open-source').split(',').map(t => t.trim()),
  
  // Behavior
  labelTrigger: process.env.LABEL_TRIGGER || 'gibwork-bounty',
  dryRun: process.env.DRY_RUN === 'true' || process.env.DRY_RUN === '1',
};

export function validateConfig(requireGithub = true, requireWallet = true) {
  const errors: string[] = [];
  
  if (requireGithub && !config.githubToken) {
    errors.push('GITHUB_TOKEN (or GH_TOKEN) is required');
  }
  
  if (requireWallet && !config.solanaPrivateKey && !config.dryRun) {
    errors.push('SOLANA_PRIVATE_KEY (or GIBWORK_PRIVATE_KEY) is required unless DRY_RUN=true');
  }
  
  if (errors.length > 0) {
    throw new Error(`Configuration error:\n- ${errors.join('\n- ')}`);
  }
}
