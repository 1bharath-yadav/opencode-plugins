# OpenCode Plugins

Native OpenCode V2 plugin monorepo.

## Packages

| Package | Purpose | Source |
|---|---|---|
| `egm/` | Google Elephant-Goldfish Model workflows, reviewers, and Plugins-manager upstream updater | [google/elephant-goldfish-model](https://github.com/google/elephant-goldfish-model) |
| `knowledge-work/` | Anthropic role-focused Knowledge Work bundles: skills, slash commands, connector inventory | [anthropics/knowledge-work-plugins](https://github.com/anthropics/knowledge-work-plugins) |
| `anthropic-skills/` | Anthropic's reusable Agent Skills collection | [anthropics/skills](https://github.com/anthropics/skills) |

## V2 plugin contract

Each package exports its server part at `.` and its TUI part at `./tui`. Add the package directory once to OpenCode's `opencode.json` `plugins` array. OpenCode discovers the TUI part from that same package; do not add another copy to `cli.json`.

## Vendor sources

`vendor/` contains independent shallow Git clones and is excluded from this repository's Git history. Plugin adapters read source content at runtime and do not alter upstream files. Update upstream sources by reviewing and fast-forwarding their own Git repositories independently.

- `vendor/knowledge-work-plugins` — Apache-2.0 repository license; 22 included bundles, 252 skills, 15 slash command files at the pinned local revision.
- `vendor/anthropic-skills` — 19 skills; licenses vary by skill. The document-processing skills `docx`, `pdf`, `pptx`, and `xlsx` are proprietary/source-available; `doc-coauthoring` has no per-skill license file. These five are runtime-local only and must not be redistributed by this adapter.

## External connectors

The Knowledge Work adapter inventories connector declarations but does not auto-configure MCP services. Empty URLs, credentials, OAuth, and vendor access must be explicitly set up by the user. A loaded skill does not imply that its required external tools are connected.

## Tests

```bash
cd egm && bun install --frozen-lockfile && bun test
cd ../knowledge-work && bun install --frozen-lockfile && bun test
cd ../anthropic-skills && bun install --frozen-lockfile && bun test
```
