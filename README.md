# gibwork-github-bounty

**Turn labeled GitHub issues into funded Gibwork bounties — automatically.**

A non-web-app developer tool built for the [Gibwork Developer Hackathon](https://gib.work).  
Uses the official **Gibwork SDK** to create real (or dry-run) bounties from GitHub issues and post the bounty link back as a comment.

> **Part of a larger ecosystem**  
> See [ECOSYSTEM.md](./ECOSYSTEM.md) for how this tool works with  
> [gibwork-agent](https://github.com/mrphatom/gibwork-agent) and  
> [gibwork-orchestrator](https://github.com/mrphatom/gibwork-orchestrator).

---

## Why this exists

Open-source maintainers often want to pay for specific work without leaving GitHub or learning a new marketplace UI.

This tool lets you:

1. Label an issue with `gibwork-bounty`
2. Automatically create a funded Gibwork bounty from the issue title + body
3. Post a clear comment with the bounty URL so contributors know where to submit

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

- **@gibwork/sdk** – official TypeScript SDK
- **@octokit/rest** – GitHub API
- **Commander** – CLI
- Node.js ≥ 22

---

## Quick Start

```bash
git clone https://github.com/mrphatom/gibwork-github-bounty.git
cd gibwork-github-bounty
npm install
npm run build
cp .env.example .env
```

Edit `.env` (start with `DRY_RUN=true`).

### Create a bounty from an issue (CLI)

```bash
npx tsx src/cli.ts create \
  --owner YOUR_ORG \
  --repo YOUR_REPO \
  --issue 42 \
  --dry-run
```

### GitHub Action

1. The workflow is already at `.github/workflows/create-bounty.yml`
2. Add secret `SOLANA_PRIVATE_KEY` and optional vars (`GIBWORK_ENVIRONMENT`, `DRY_RUN`, etc.)
3. Label any issue with `gibwork-bounty`

---

## Configuration

| Variable | Description | Default |
|----------|-------------|---------|
| `GITHUB_TOKEN` | GitHub token | required |
| `SOLANA_PRIVATE_KEY` | Solana keypair | required unless dry-run |
| `GIBWORK_ENVIRONMENT` | `stage` / `production` | `stage` |
| `DRY_RUN` | Skip real API calls | `false` |
| `DEFAULT_REWARD_AMOUNT` | Default USDC amount | `25.00` |
| `LABEL_TRIGGER` | Label that triggers the Action | `gibwork-bounty` |

---

## Ecosystem

| Tool | Role |
|------|------|
| **This repo** | Creates bounties from GitHub issues |
| [gibwork-agent](https://github.com/mrphatom/gibwork-agent) | Discovers, ranks and submits work |
| [gibwork-orchestrator](https://github.com/mrphatom/gibwork-orchestrator) | Team create / review / approve control plane |

Full details: [ECOSYSTEM.md](./ECOSYSTEM.md)

---

## License

MIT
