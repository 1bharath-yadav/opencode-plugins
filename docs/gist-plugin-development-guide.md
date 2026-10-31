# Gist reference: OpenCode plugin development guide

Original source: https://gist.github.com/rstacruz/946d02757525c9a0f49b25e316fbe715
Retrieved: 2026-10-31

The full original document is preserved in `opencode-plugin-development-guide-original.md`. It is a historical reference written against an older plugin API, not a current V2 contract.

## Current V2 rules

- Server part: default-export `Plugin.define({ id, setup })` from `@opencode/plugin`.
- TUI part: default-export `Plugin.define({ id, setup })` from `@opencode/plugin/tui`.
- A single package declares both entrypoints through `package.json` `exports` (`.` and `./tui`).
- Configure a combined server+TUI package once in `opencode.json(c)`. The CLI discovers its TUI part automatically; do not list it a second time in `cli.json`.
- A TUI-only plugin belongs in `cli.json`.
- V2 plugin contexts are not V1 plugin contexts. Check current types and do not copy obsolete `chat.params`, `permission.ask`, or old context argument shapes.
- The V2 Promise server SDK exposes namespaced transform/reload APIs. Command callbacks receive `{ sessionID, prompt, delivery }`; `ctx.session.prompt` receives a `SessionPromptInput` containing `sessionID`, `text`, optional `files`, `agents`, `skills`, and `delivery`.
- TUI keyboard commands are registered through `context.keymap.layer`. A command returns `false` to continue dispatch to lower-priority/native handlers.
- Use the same `@opencode/plugin` release as the OpenCode version being targeted. Local package loading still needs runtime dependencies declared in that package.

## Official references checked for this migration

- https://dev.opencode.ai/v2/docs/build/plugins/
- https://dev.opencode.ai/v2/docs/build/plugins/server
- https://dev.opencode.ai/v2/docs/build/plugins/cli
- https://dev.opencode.ai/v2/docs/cli/plugins
