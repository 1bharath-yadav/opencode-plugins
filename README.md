# OpenCode Plugins

A monorepo for custom OpenCode plugins maintained by `1bharath-yadav`.

## Layout

- `egm/` — Google's Elephant-Goldfish Model integration for OpenCode V2.
- `docs/` — shared development notes and architecture decisions.

Each plugin lives in its own directory and should be independently installable, testable, and versioned. Keep upstream projects as separate source dependencies; never patch upstream source to make an adapter work.

## EGM

See [`egm/README.md`](egm/README.md) for setup, source synchronization, commands, and update behavior. The upstream source is Google's repository: https://github.com/google/elephant-goldfish-model

## Development principles

1. Prefer current OpenCode V2 APIs over legacy examples.
2. Keep server and TUI entrypoints in one package (`exports`, including `./tui`).
3. Never claim support for an OpenCode feature unless the installed API actually exposes it.
4. Keep user data, credentials, tokens, and local machine paths out of Git.
5. Add tests for safety boundaries, failure modes, and plugin lifecycle behavior.
