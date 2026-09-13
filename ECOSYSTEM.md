# Gibwork Tooling Ecosystem

Three complementary tools that form a complete bounty workflow on Gibwork.

| Tool | Purpose | Repo |
|------|---------|------|
| **gibwork-github-bounty** | Auto-create funded bounties from labeled GitHub issues | https://github.com/mrphatom/gibwork-github-bounty |
| **gibwork-agent** | Discover, rank, track and submit work on open bounties | https://github.com/mrphatom/gibwork-agent |
| **gibwork-orchestrator** | Team control plane – create, list, review, approve/reject | https://github.com/mrphatom/gibwork-orchestrator |

## Recommended flow

1. **Create**  
   - Label a GitHub issue with `gibwork-bounty` → GitHub Action creates the bounty  
   - Or use the Orchestrator CLI / workflow_dispatch to create from a ticket or YAML

2. **Discover & Work**  
   - Run `gibwork-agent discover` or the scheduled Action  
   - Agent scores tasks against skills/tags and can submit work

3. **Review & Pay**  
   - Use Orchestrator to list submissions and approve/reject  
   - Funds are released on-chain via the official SDK

## Shared conventions

All three tools use the same environment variables where possible:

```env
SOLANA_PRIVATE_KEY=
GIBWORK_ENVIRONMENT=stage|production
DRY_RUN=true|false
```

- Always start with `DRY_RUN=true`
- Prefer `stage` until you are ready for real funds
- Node.js ≥ 22 required
- Official `@gibwork/sdk` is the single source of truth for API calls

## MCP / Agent skill

`gibwork-agent` ships with a skill definition under `skills/gibwork-agent/SKILL.md`  
that can be installed into Claude Code or Codex.
