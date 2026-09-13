# gibwork-github-bounty

**Turn labeled GitHub issues into funded Gibwork bounties — automatically.**

A non-web-app developer tool built for the [Gibwork Developer Hackathon](https://gib.work).  
Uses the official **Gibwork SDK** + **CLI patterns** to create real (or dry-run) bounties from GitHub issues and post the bounty link back as a comment.

---

## Why this exists

Open-source maintainers often want to pay for specific work without leaving GitHub or learning a new marketplace UI.  

This tool lets you:

1. Label an issue with `gibwork-bounty`
2. Automatically create a funded Gibwork bounty from the issue title + body
3. Post a clear comment with the bounty URL so contributors know where to submit

It solves a real developer workflow problem using Gibwork’s SDK as the core integration layer.

---

## Features

- CLI for manual creation from any issue
- GitHub Action that triggers on label
- Dry-run mode (safe testing, zero funds moved)
- Configurable reward, token, tags, min submission
- Idempotent: skips if a previous bounty comment already exists
- Clean TypeScript, production-oriented structure

---

## Tech Stack

- **@gibwork/sdk** – official TypeScript SDK for creating tasks / bounties
- **@octokit/rest** – GitHub API
- **Commander** – CLI
- Node.js ≥ 22

---

## Quick Start

### 1. Install

```bash
git clone https://github.com/mrphatom/gibwork-github-bounty.git
cd gibwork-github-bounty
npm install
npm run build
```

### 2. Configure

```bash
cp .env.example .env
```

Edit `.env`:

```env
GITHUB_TOKEN=ghp_...
SOLANA_PRIVATE_KEY=...          # required unless DRY_RUN=true
GIBWORK_ENVIRONMENT=stage       # or production
DRY_RUN=true                    # start here
DEFAULT_REWARD_AMOUNT=25.00
```

> **Security note:** Never commit your private key. The SDK never sends the key to Gibwork; it only signs locally.

### 3. Create a bounty from an issue (CLI)

```bash
# Dry-run (recommended first)
npx tsx src/cli.ts create \
  --owner YOUR_ORG \
  --repo YOUR_REPO \
  --issue 42 \
  --dry-run

# Real creation (stage or production)
npx tsx src/cli.ts create \
  --owner YOUR_ORG \
  --repo YOUR_REPO \
  --issue 42 \
  --reward 50.00 \
  --tags "bug,typescript,help-wanted"
```

### 4. GitHub Action (automatic)

1. Add the workflow file (already included at `.github/workflows/create-bounty.yml`).
2. In the repository settings → Secrets and variables:
   - **Secret**: `SOLANA_PRIVATE_KEY`
   - **Variable** (optional): `GIBWORK_ENVIRONMENT`, `DRY_RUN`, `DEFAULT_REWARD_AMOUNT`, etc.
3. On any issue, add the label `gibwork-bounty`.
4. The action runs, creates the bounty, and comments on the issue.

---

## How it works

```
GitHub Issue labeled "gibwork-bounty"
        ↓
GitHub Action / CLI
        ↓
Fetch issue title + body via Octokit
        ↓
Build clean HTML content for Gibwork
        ↓
@gibwork/sdk → tasks.create(...)
        ↓
Post comment back on the GitHub issue with bounty URL
```

In **dry-run** mode the SDK call is skipped and a realistic fake task ID + URL are generated so you can test the full flow safely.

---

## Configuration Reference

| Variable | Description | Default |
|----------|-------------|---------|
| `GITHUB_TOKEN` | GitHub PAT or `GITHUB_TOKEN` from Actions | required |
| `SOLANA_PRIVATE_KEY` | Solana keypair (base58 or JSON byte array) | required (unless dry-run) |
| `GIBWORK_ENVIRONMENT` | `stage` or `production` | `stage` |
| `DRY_RUN` | Skip real API calls & funding | `false` |
| `DEFAULT_REWARD_AMOUNT` | Default USDC amount | `25.00` |
| `DEFAULT_MINT_ADDRESS` | Token mint (USDC mainnet) | `EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v` |
| `DEFAULT_TAGS` | Comma-separated tags | `github,open-source` |
| `LABEL_TRIGGER` | Label that triggers the Action | `gibwork-bounty` |

---

## Project Structure

```
gibwork-github-bounty/
├── src/
│   ├── cli.ts          # Commander CLI entrypoint
│   ├── config.ts       # Env + defaults
│   ├── gibwork.ts      # Official SDK wrapper + dry-run
│   ├── github.ts       # Octokit helpers
│   └── types.ts
├── .github/workflows/
│   └── create-bounty.yml
├── .env.example
├── package.json
├── tsconfig.json
└── README.md
```

---

## Demo / Validation Notes

For reviewers:

1. Clone the repo
2. `npm install && npm run build`
3. Set `DRY_RUN=true` and a valid `GITHUB_TOKEN`
4. Run against any public issue you have write access to
5. Observe the comment posted on the issue
6. (Optional) Switch to a funded stage/production wallet and set `DRY_RUN=false` to create a real bounty

The tool is fully functional in dry-run mode and requires only a GitHub token to demonstrate the complete workflow.

---

## License

MIT

---

Built for the Gibwork Developer Hackathon – non-web-app track.  
Uses the official Gibwork SDK as the core integration.
