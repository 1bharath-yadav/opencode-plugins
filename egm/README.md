# OpenCode EGM Plugin

An additive OpenCode V2 adapter for [Google's Elephant-Goldfish Model](https://github.com/google/elephant-goldfish-model). The upstream checkout remains separate and is never patched.

## Package parts

- `src/index.js` — registers upstream EGM skills, slash commands, and OpenCode-native agent profiles.
- `src/tui.js` — TUI keybinding for safe upstream refresh from the Plugins manager.
- `src/update-core.js` — clean-worktree-checked, fast-forward-only Git updater.

The adapter currently reads Google's checkout from `~/.local/share/opencode/egm-upstream`. Keep this checkout outside this monorepo; it is the upstream source dependency, not plugin-owned code.

## Workflows

`/egm-bootstrap`, `/egm-brainstorm`, `/egm-draft`, `/egm-drift-report`, `/egm-resolve`, `/egm-review`, and `/egm-review-loop`.

Nine native agent profiles are generated from upstream persona definitions. Reviewer agents are read-only. Coordinators may write Markdown deliverables and use only the configured one-level nested delegation.

## Updating upstream

Open the OpenCode Plugins manager and press `Ctrl+R`. The shortcut is intended to run only while the manager's update/check actions are reachable; elsewhere it must preserve normal Ctrl+R behavior. The updater verifies the Google remote, requires a clean checkout, refuses detached/ahead/diverged worktrees, and fast-forwards only.

This updates Google's EGM source data, not this adapter package. Adapter releases are updated separately through the package's Git/npm source.

## Local install

Add the absolute package path to OpenCode's `plugins` array:

```json
{
  "plugins": ["/home/YOU/projects/opencode-plugins/egm"]
}
```

A current V2 package can expose server and TUI parts together through `exports`. During migration, ensure there is only one active EGM server registration and one active EGM TUI registration; do not load the old copies and the new package simultaneously.
