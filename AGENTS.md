# Repository Agent Instructions

## Mission

Maintain a collection of production-quality custom plugins for OpenCode. This repository is a monorepo: each plugin is isolated in its own top-level directory and may have its own package manifest, tests, docs, and release workflow.

## Mandatory engineering rules

- Inspect the installed OpenCode version and current official V2 documentation before changing integration code.
- Treat old gists, blog posts, and examples as historical references, not authoritative API contracts.
- Do not invent hook names, context fields, permissions, event payloads, or keymap behavior. Verify against installed SDK/types or official docs.
- Preserve existing OpenCode configuration and unrelated plugins. Make narrowly scoped changes and back up config before modifying it.
- Never modify an upstream project's source to add missing integration behavior. Build an adapter in this repository; if the required capability is absent, document the limitation and stop rather than faking it.
- Never copy secrets, tokens, OAuth account files, `.env` files, private logs, or machine-specific state into this repository.
- Avoid hard-coded user home paths. Use runtime configuration, environment variables, or OS home-directory APIs.
- Prefer safe, reversible updates. Reject dirty or diverged upstream worktrees; never force-reset user changes.
- Keep server and TUI parts together in one package where possible. Export `.` and `./tui` from `package.json`; use current `@opencode/plugin` and `@opencode/plugin/tui` SDK APIs after checking the installed version.
- A TUI shortcut must preserve native behavior outside its intended UI context. Do not globally steal common keybindings.
- Report tests actually run. Syntax checks are not runtime integration tests.

## Standard workflow

1. Inspect the target plugin, OpenCode version, configuration, and relevant upstream API.
2. Record behavior, compatibility constraints, and rollback path before editing.
3. Implement the smallest isolated change.
4. Run formatting, type checking, unit tests, syntax checks, and a real OpenCode load/smoke test where applicable.
5. Review the diff for secrets, unrelated changes, unsafe permissions, hard-coded paths, and stale API usage.
6. Update plugin documentation and changelog when behavior or setup changes.

## Plugin layout

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
- Translate upstream workflows/personas into OpenCode-native registrations without rewriting upstream skills/persona files.
- Preserve reviewer isolation and only report a reviewer complete after a real independent child session returns its report.
- Keep `experimental.subagent_depth=2` only while the corresponding two-level delegation strategy is used and supported.
- `Ctrl+R` updates EGM upstream only from OpenCode's Plugins manager and must fall through to native key handling elsewhere.

## Antigravity diagnostics constraints

- Do not confuse `opencode-serve` being active with a successful provider request.
- Use lowercase OpenCode log levels (`debug`, not `DEBUG`).
- Capture the actual session error and correlate it with the provider plugin version and requested model ID.
- Do not expose OAuth tokens, account JSON, refresh tokens, or private account metadata in logs or commits.
- Do not rotate credentials, delete account state, or switch provider versions without evidence and a rollback path.
