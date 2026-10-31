# OpenCode EGM Plugin

A native OpenCode V2 server + TUI package for [Google's Elephant-Goldfish Model](https://github.com/google/elephant-goldfish-model). The Google repository is kept as an independent checkout and is never patched.

## Package layout

- `src/index.js` — V2 server plugin (`Plugin.define`): registers seven skills, seven slash commands, and nine generated agent profiles.
- `src/tui.js` — V2 TUI plugin (`Plugin.define`): adds the EGM upstream-update shortcut.
- `src/update-core.js` — clean-worktree-checked, fast-forward-only updater.
- `tests/` — server registration, command prompt forwarding, and TUI keybinding tests.

The package exports both parts. Configure this package once in OpenCode's `plugins` array; V2 automatically loads the TUI part when the server loads the package. It must not also be duplicated in `cli.json`.

## Requirements

- OpenCode `2.2.5` (or a compatible release using the pinned `@opencode/plugin` SDK).
- Bun for running the package's tests.
- Google EGM source checkout at `~/.local/share/opencode/egm-upstream`, or set `EGM_UPSTREAM_DIR`.

## Workflows

`/egm-bootstrap`, `/egm-brainstorm`, `/egm-draft`, `/egm-drift-report`, `/egm-resolve`, `/egm-review`, and `/egm-review-loop`.

Nine native agent profiles are generated from upstream persona definitions. Reviewer agents are read-only. Coordinators may write Markdown deliverables and use only the configured one-level nested delegation.

## Updating Google EGM upstream

Open the OpenCode Plugins manager and press `Ctrl+R`. The shortcut intercepts only while the plugin manager's update/check actions are reachable; elsewhere it returns `false` so OpenCode's native Ctrl+R behavior continues. The updater verifies Google's remote, requires a clean checkout, rejects detached/ahead/diverged worktrees, and fast-forwards only.

This updates Google's upstream EGM source data, not this adapter package. Adapter code is updated through this monorepo's Git/package release. No `/egm-update` command is registered.

## Local configuration

```json
{
  "plugins": [
    "/home/YOU/projects/opencode-plugins/egm"
  ]
}
```

For development, override paths without changing source:

- `EGM_UPSTREAM_DIR` — Google EGM checkout.
- `OPENCODE_CONFIG_DIR` — OpenCode config root used for generated agent profiles.

## Test

```bash
bun install --frozen-lockfile
bun run check
bun test
```
