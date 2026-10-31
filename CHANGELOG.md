# Changelog

## 0.2.0

- Migrate EGM server and TUI entrypoints to the native OpenCode V2 `@opencode/plugin` SDK.
- Correct command callback forwarding to the V2 `SessionPromptInput` contract.
- Load server and TUI parts from one package configuration entry.
- Add server/TUI integration tests and pin the SDK to OpenCode 2.2.5.
- Preserve the original plugin-development gist and add verified V2 migration notes.
- Add Antigravity provider diagnostic evidence and safe troubleshooting steps.

## 0.1.0

- Establish the custom OpenCode plugin monorepo and add the EGM adapter.

## 0.3.0

- Add native OpenCode V2 Knowledge Work adapter for 252 skills and 15 explicit commands across 22 upstream bundles.
- Add native OpenCode V2 Anthropic Agent Skills adapter for 19 upstream skills.
- Keep both upstream repositories independently cloned under ignored `vendor/` and load skill assets from source paths at runtime.
- Inventory 186 connector definitions without enabling MCP servers automatically.
- Mark proprietary/source-available document skill packages and unlicensed doc-coauthoring as local runtime only.
- Add unit/integration tests for registration, unique IDs, command prompt forwarding, and local-only proprietary skill handling.
