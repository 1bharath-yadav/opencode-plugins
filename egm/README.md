# OpenCode EGM Plugin

An additive OpenCode V2 adapter for [Google's Elephant-Goldfish Model](https://github.com/google/elephant-goldfish-model). The upstream checkout remains separate and is never patched.

## Package parts

- `src/index.js` — registers upstream EGM skills, slash commands, and OpenCode-native agent profiles.
- `src/tui.js` — TUI keybinding for safe upstream refresh from the Plugins manager.
- `src/update-core.js` — clean-worktree-checked, fast-forward-only Git updater.

The plugin expects the upstream repository at `~/.local/share/opencode/egm-upstream` by default. The integration can be configured further in a later revision to allow an explicit `EGM_UPSTREAM_DIR` environment variable; currently the runtime adapter uses the default path.

## Workflows

`/egm-bootstrap`, `/egm-brainstorm`, `/egm-draft`, `/egm-drift-report`, `/egm-resolve`, `/egm-review`, and `/egm-review-loop`.

The adapter generates nine OpenCode agent profiles from the upstream persona definitions. Reviewer agents are read-only. Coordinators may write Markdown deliverables and use only the configured one-level nested delegation.

## Updating upstream

Open the OpenCode Plugins manager and press `Ctrl+R`. The shortcut should be active only in that manager; outside it, normal OpenCode `Ctrl+R` behavior must continue. The updater verifies the Google remote, requires a clean checkout, refuses detached/ahead/diverged worktrees, and fast-forwards only.

This updates Google's EGM source data, not this adapter package. Adapter releases are updated separately through the package's Git/npm source.

## Install (local development)

Add the absolute package path to OpenCode's `plugins` configuration:

```json
{
  "plugins": ["/home/YOU/projects/opencode-plugins/egm"]
}
```

The directory is configured as one package; its server and TUI exports load together on current OpenCode V2.
