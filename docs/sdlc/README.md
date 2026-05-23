# Repo SDLC Documentation — Devilbomber1/auto-integrate-hub

This directory is the repo-local software-development lifecycle source of truth for `Devilbomber1/auto-integrate-hub`.

## Agent entrypoint

Before changing code in this repository, agents should read:

1. `00-source-of-truth.md`
2. `01-idea-brief.md`
3. `03-prd.md`
4. `05-technical-design.md`
5. `08-test-plan.md`
6. `11-runbook.md`

Then inspect current git status, tests, and the exact files being changed.

## Audit/backfill

Copy or keep an equivalent of `scripts/audit_sdlc_docs.py` in the repo, then run:

```bash
python3 scripts/audit_sdlc_docs.py --root .
```
