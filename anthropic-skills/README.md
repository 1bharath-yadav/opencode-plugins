# OpenCode Anthropic Skills Plugin

Native OpenCode V2 adapter for [Anthropic's Agent Skills repository](https://github.com/anthropics/skills).

It loads each top-level `skills/*/SKILL.md` from the independent `vendor/anthropic-skills` checkout into OpenCode's native skill registry. Skill references and scripts remain in the source checkout; the adapter does not copy them into this repository.

## Coverage

Current source revision contains 19 top-level skills, including examples for creative work, frontend design, MCP construction, web-app testing, and document workflows.

## Licensing boundary

Licenses are per skill. The `docx`, `pdf`, `pptx`, and `xlsx` skills explicitly say proprietary/source-available. `doc-coauthoring` has no local `LICENSE.txt`. These remain local-only runtime loads from the source checkout and must not be redistributed as adapter content. Other skills include per-skill license files; retain their notices when using or redistributing source-derived files. See `vendor/anthropic-skills/THIRD_PARTY_NOTICES.md`.

## Source directory

Default: `~/projects/opencode-plugins/vendor/anthropic-skills`.
Override with `ANTHROPIC_SKILLS_DIR`.
