# Gist reference: OpenCode plugin development guide

Original source: https://gist.github.com/rstacruz/946d02757525c9a0f49b25e316fbe715
Retrieved: 2026-10-31

The original guide is preserved in this repository's history/source reference. It was written against an older plugin API and is not a current V2 specification. Consult `AGENTS.md` and the official V2 documentation before using an API described in the gist.

Current official references:

- Overview: https://opencode.ai/v2/docs/build/plugins/
- TUI plugins: https://opencode.ai/v2/docs/build/plugins/cli/
- CLI plugin discovery: https://opencode.ai/v2/docs/cli/plugins
- Plugin management: https://dev.opencode.ai/v2/docs/plugins/

## Important V2 migrations from the gist

- The current package SDK is `@opencode/plugin`; the TUI SDK is `@opencode/plugin/tui`. Do not copy the gist's `@opencode-ai/plugin` import without checking package/API compatibility.
- Package entrypoints are declared through `exports`, commonly `.` for the server part and `./tui` for the terminal UI part.
- The documented V2 plugin package structure supports server, TUI, GUI, and RPC parts. A package with a TUI part can be loaded as one plugin when the server package is configured in `opencode.json(c)`; CLI-only plugins belong in `cli.json`.
- Do not assume old hook names and signatures such as `chat.params`, `permission.ask`, `chat.message`, or old auth interfaces still exist. Verify every hook against the installed V2 SDK/types.
- Current TUI keyboard commands use `context.keymap.layer(...)`; a command may return `false` to let keyboard dispatch continue.
- Current TUI plugins use `context.ui.toast.show(...)` and the documented V2 context. Avoid legacy or guessed TUI context shapes.
- The V2 docs describe local plugins and package plugins differently. Package references support normal Git/npm installation and updates; local paths are not automatically updated as packages.

## Reading policy

Treat the gist as a conceptual checklist (tools, events, lifecycle, error handling, testing, distribution), not as code to paste. For actual implementation, check the installed OpenCode version and current official documentation, and add a smoke test for the integration path.
