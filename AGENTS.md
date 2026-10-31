# Repository Agent Instructions

## Mission

Maintain a collection of production-quality custom plugins for OpenCode. This repository is a monorepo: each plugin is isolated in its own top-level directory and may have its own package manifest, tests, docs, and release workflow.

## Mandatory engineering rules

- Inspect the installed OpenCode version and current official V2 documentation before changing integration code.
- Treat old gists, blog posts, and examples as historical references, not authoritative API contracts.
- Do not invent hook names, context fields, permissions, event payloads, or keymap behavior. Verify against the installed SDK/types or official docs.
- Preserve existing OpenCode configuration and unrelated plugins. Make narrowly scoped changes and back up config before modifying it.
- Never modify an upstream project's source to add missing integration behavior. Build an adapter in this repository; when the required capability is absent, document the limitation and stop rather than faking it.
- Do not copy secrets, tokens, account files, `.env` files, private logs, or machine-specific state into this repository.
- Avoid hard-coded user home paths. Use runtime config, environment variables, or OS home-directory APIs.
- Prefer safe, reversible updates. Reject dirty or diverged upstream worktrees; never force-reset user changes.
- Keep server and TUI parts together in one package where possible. Export `.` and `./tui` from `package.json`; use `@opencode/plugin` and `@opencode/plugin/tui` for current V2 SDKs when needed.
- A TUI shortcut must preserve native behavior outside its intended UI context. Do not globally steal common keybindings.
- Report tests actually run. Do not imply runtime validation from syntax checks alone.

## Standard workflow

1. Inspect the target plugin, current OpenCode version, config, and relevant upstream API.
2. Write down behavior, compatibility constraints, and rollback path before editing.
3. Implement the smallest isolated change.
4. Run formatter, type checker, unit tests, syntax checks, and a real OpenCode load/smoke test where applicable.
5. Review the diff for secrets, unrelated config changes, unsafe permissions, hard-coded paths, and stale API usage.
6. Update the plugin README and changelog when behavior or setup changes.

## Plugin layout

Use this baseline unless the plugin has a justified alternative:

```text
plugin-name/
  package.json
  README.md
  src/
    index.ts       # server entrypoint
    tui.tsx        # optional TUI entrypoint
  tests/
  docs/
```

## EGM-specific constraints

- Google EGM is an upstream source dependency. Keep its checkout separate from this repository.
- The adapter may translate upstream skills/personas into OpenCode-native registrations, but must not edit upstream skill/persona files.
- Preserve the seven upstream EGM workflows and reviewer isolation rules unless upstream changes warrant a reviewed migration.
- Never report a reviewer as completed unless a real independent child session returned its report.
- Keep `experimental.subagent_depth=2` only while the two-level delegation strategy is in use and supported by the installed version.
- `Ctrl+R` should update the EGM upstream source only from the OpenCode Plugins manager and must fall through to native key handling elsewhere.
