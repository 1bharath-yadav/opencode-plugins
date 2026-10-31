# Anthropic source integrations

Checked out 2026-10-31:

- `anthropics/knowledge-work-plugins` — `vendor/knowledge-work-plugins`, commit `2574e29`.
- `anthropics/skills` — `vendor/anthropic-skills`, commit `ca45fc4`.

Both vendor directories are ignored by the parent monorepo and are not modified by adapters. Adapter runtime reads skill/command files directly from these clones. To update source, fetch/fast-forward these repositories separately after reviewing source/license changes.

## Knowledge Work Plugins

The repository contains Anthropic role-focused first-party bundles, partner-built plugins, markdown skills, explicit commands, and MCP server declarations. The current checkout has 252 `SKILL.md` files, 15 command files, and 21 `.mcp.json` files. Connector placeholders with empty URL values are not valid deployments. The native adapter loads the skills and command definitions; external service connectors are optional and must be explicitly enabled in the OpenCode config.

Source license: repository `LICENSE` (Apache License 2.0). Preserve copyright/license notices if copying or distributing source-derived files.

## Anthropic Skills

The current checkout has 19 top-level skill folders. Each skill includes a `SKILL.md`; many include scripts and references. License is per-skill: several are Apache 2.0, document-processing skills `docx`, `pdf`, `pptx`, `xlsx` are marked proprietary/source-available in their own skill metadata, and `doc-coauthoring` has no local `LICENSE.txt`. The adapter therefore reads the vendor checkout at runtime and does not copy these skills or scripts into this repository's history.

Upstream README: https://github.com/anthropics/skills

Do not represent any of these as guaranteed to be supported by Claude-specific execution features. The adapter exposes instructions to OpenCode; it cannot automatically recreate Claude runtime tools, Cowork surfaces, Claude API skill uploads, or partner MCP services.
