# Agent Workflow

These rules apply to agent-driven work in this repository.

## Branching

- Start work on a branch, not directly on `main`.
- Use descriptive branch names, ideally with the `codex/` prefix.
- Keep work isolated so any feature or fix can be reverted independently.

## Commit Strategy

- Prefer micro commits over one large catch-all commit.
- Each commit should capture one coherent step: setup, bug fix, UI polish, docs, or refactor.
- Use clear prefixes such as `feat:`, `fix:`, `docs:`, `refactor:`, or `chore:`.

## Documentation

- When behavior changes, update the relevant docs in the same branch.
- Before finishing, ensure any agent-facing instructions and user-facing docs match the current codebase.
