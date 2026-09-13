# Gibwork Tooling Ecosystem

Four complementary tools that form a complete, high-trust bounty workflow on Gibwork.

| Tool | Purpose | Repo |
|------|---------|------|
| **gibwork-github-bounty** | Auto-create funded bounties from labeled GitHub issues | https://github.com/mrphatom/gibwork-github-bounty |
| **gibwork-agent** | Discover, rank, track and submit work on open bounties | https://github.com/mrphatom/gibwork-agent |
| **gibwork-orchestrator** | Team control plane – create, list, review, approve/reject | https://github.com/mrphatom/gibwork-orchestrator |
| **gibwork-proof-runner** | **Flagship** – execute verification policies, generate structured proof bundles, submit high-trust evidence | https://github.com/mrphatom/gibwork-proof-runner |

## Recommended flow

1. **Create**  
   - Label a GitHub issue with `gibwork-bounty` → GitHub Action creates the bounty  
   - Or use the Orchestrator CLI / workflow_dispatch

2. **Discover**  
   - `gibwork-agent` scores open tasks against skills/tags

3. **Execute & Prove**  
   - **Proof Runner** runs a declarative verification policy, builds a versioned Proof Bundle (JSON + Markdown), and submits structured evidence via the official SDK

4. **Review & Pay**  
   - Orchestrator lists submissions and approves/rejects  
   - Reviewers receive machine-checkable proof instead of just a link

## Shared conventions

```env
SOLANA_PRIVATE_KEY=
GIBWORK_ENVIRONMENT=stage|production
DRY_RUN=true|false
```

- Always start with `DRY_RUN=true`
- Prefer `stage` until ready for real funds
- Node.js ≥ 22
- Official `@gibwork/sdk` is the single source of truth for API calls

## Why Proof Runner is the flagship

Most existing tools only wrap create/list/submit.  
Proof Runner is the first production-oriented system that turns agent work into **verifiable, auditable evidence** — raising the quality bar for both human and agent submissions on Gibwork.
