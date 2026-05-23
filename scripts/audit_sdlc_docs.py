#!/usr/bin/env python3
"""Audit and scaffold repo-local SDLC documentation.

Usage:
  python3 scripts/audit_sdlc_docs.py --root .
  python3 scripts/audit_sdlc_docs.py --root . --write
"""
from __future__ import annotations
import argparse
from pathlib import Path

REQUIRED_DOCS = [
    'README.md',
    '00-source-of-truth.md',
    '01-idea-brief.md',
    '02-discovery-report.md',
    '03-prd.md',
    '04-ux-flows.md',
    '05-technical-design.md',
    '06-architecture.md',
    '07-project-plan.md',
    '08-test-plan.md',
    '09-release-plan.md',
    '10-deployment-plan.md',
    '11-runbook.md',
    '12-maintenance-plan.md',
    '13-security-privacy.md',
    '14-golden-thread.md',
]

TEMPLATE = """# {title}\n\n## Purpose\nThis document is part of the repo-local SDLC source of truth.\n\n## Current state\nTBD. Fill from Product Lab, GitHub issues, implementation notes, and verified repo behavior.\n\n## Golden thread\nBusiness goal → User need → Requirement → Design → Technical implementation → Test case → Release item → Support procedure → Metric after launch\n\n## Open questions\n- What does Kevin need to decide?\n- What evidence is missing?\n- What should agents verify before changing code?\n"""

def title_for(filename: str) -> str:
    stem = Path(filename).stem
    return stem.replace('-', ' ').replace('_', ' ').title()

def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument('--root', default='.', help='repository root')
    parser.add_argument('--write', action='store_true', help='create missing docs')
    args = parser.parse_args()

    root = Path(args.root).resolve()
    docs_dir = root / 'docs' / 'sdlc'
    missing = [name for name in REQUIRED_DOCS if not (docs_dir / name).exists()]

    if args.write and missing:
        docs_dir.mkdir(parents=True, exist_ok=True)
        for name in missing:
            content = '# Repo SDLC Documentation\n\nScaffolded repo-local SDLC documentation index.\n' if name == 'README.md' else TEMPLATE.format(title=title_for(name))
            (docs_dir / name).write_text(content, encoding='utf-8')

    missing_after = [name for name in REQUIRED_DOCS if not (docs_dir / name).exists()]
    present = len(REQUIRED_DOCS) - len(missing_after)
    print(f'SDLC docs: {present}/{len(REQUIRED_DOCS)} present in {docs_dir}')
    if missing_after:
        print('Missing:')
        for name in missing_after:
            print(f'  - {name}')
        return 1
    print('All required SDLC docs are present.')
    return 0

if __name__ == '__main__':
    raise SystemExit(main())
