# OpenCode Knowledge Work Plugin

Native OpenCode V2 adapter for Anthropic's [Knowledge Work Plugins](https://github.com/anthropics/knowledge-work-plugins).

The adapter loads skills and command definitions from the separate immutable source checkout in `vendor/knowledge-work-plugins`. It exposes the 11 first-party role bundles and partner-built bundles currently included in `src/index.js`; source content is not copied into this package.

## Coverage

The current upstream clone contains 252 skill files across 22 bundles, 15 explicit command files, and 21 `.mcp.json` connector inventories. The package registers the available skills and command files it discovers. Claude/Cowork-specific runtime capabilities are not recreated. External MCP services are not enabled automatically, particularly when upstream configuration has blank placeholder URLs.

## Safety

A runtime compatibility note is appended to loaded skill text. External content is treated as untrusted. Actions that send messages, create meetings, alter customer/financial records, or otherwise affect others require explicit approval.

## Source directory

Default: `~/projects/opencode-plugins/vendor/knowledge-work-plugins`.

Override with `ANTHROPIC_KNOWLEDGE_WORK_DIR`.

## Commands

Commands are namespaced with their source bundle to avoid collisions, for example `/kw-data-analyze` and `/kw-product-management-brainstorm`.
