import { Plugin } from "@opencode/plugin";
import {
  existsSync,
  mkdirSync,
  readFileSync,
  renameSync,
  watch,
  writeFileSync,
} from "node:fs";
import { join } from "node:path";
import { homedir } from "node:os";

const UPSTREAM_ROOT =
  process.env.EGM_UPSTREAM_DIR || join(homedir(), ".local", "share", "opencode", "egm-upstream");
const SKILLS_DIR = join(UPSTREAM_ROOT, "skills");
const UPSTREAM_AGENTS_DIR = join(UPSTREAM_ROOT, "agents");
const CONFIG_ROOT = process.env.OPENCODE_CONFIG_DIR || join(homedir(), ".config", "opencode");
const LOCAL_AGENTS_DIR = join(CONFIG_ROOT, "agents");

const SKILL_NAMES = [
  "egm-bootstrap",
  "egm-brainstorm",
  "egm-draft",
  "egm-drift-report",
  "egm-resolve",
  "egm-review",
  "egm-review-loop",
];

const REVIEWER_FILES = [
  "codebase_details.md",
  "comprehension.md",
  "design_critic.md",
  "implementation_readiness.md",
  "structural.md",
  "style.md",
  "zoom_out.md",
];

const OPENCODE_ADAPTER = [
  "# OpenCode V2 runtime binding",
  "",
  `This is the unmodified upstream EGM workflow adapted to OpenCode V2. The upstream checkout is at ${UPSTREAM_ROOT}. Resolve bundled personas from its agents/ directory and document standards from its resources/document_standards/ directory; do not substitute similarly named files from the user's project.`,
  "",
  "Use OpenCode's native subagent tool to create genuinely fresh child sessions for Goldfish reviewers. The installed reviewer IDs are egm-design, egm-codebase-details, egm-zoom-out, egm-comprehension, egm-implementation-readiness, egm-structural, and egm-style. Each reviewer is a separate subagent with read-only permissions.",
  "",
  "For brainstorm and review swarms, dispatch required reviewers in parallel. Give each reviewer the exact target file, relevant line range, and explicit reading list. Do not pass the parent conversation transcript or conclusions the reviewer is meant to evaluate independently. Count a reviewer only after its child session returns a report. If a required reviewer or the native subagent tool is unavailable, report that stage as not run; never simulate a fresh reviewer in the current context.",
  "",
  "OpenCode experimental.subagent_depth is set to 2. The primary session may launch egm-synthesizer, and the synthesizer may launch one level of fresh Goldfish reviewers. Reviewers cannot launch further agents. Keep this depth limit intact.",
  "",
  "The upstream skill text below is loaded at runtime from the separate Git checkout. This adapter is additive; no upstream file is rewritten.",
].join("\n");

function splitFrontmatter(raw, label) {
  const match = raw.match(/^---\s*\r?\n([\s\S]*?)\r?\n---\s*\r?\n?([\s\S]*)$/);
  if (!match) throw new Error(`Invalid EGM file (missing YAML frontmatter): ${label}`);
  return { header: match[1], body: match[2] };
}

function readYamlScalar(header, key) {
  const line = header.split(/\r?\n/).find((item) => item.startsWith(`${key}:`));
  if (!line) return "";
  return line.slice(key.length + 1).trim().replace(/^['"]|['"]$/g, "");
}

function readDescription(header) {
  const lines = header.split(/\r?\n/);
  const index = lines.findIndex((line) => line.startsWith("description:"));
  if (index < 0) return "Elephant-Goldfish Model workflow";
  const first = lines[index].slice("description:".length).trim();
  if (first && ![">-", ">", "|", "|-"].includes(first)) {
    return first.replace(/^['"]|['"]$/g, "");
  }
  const parts = [];
  for (let i = index + 1; i < lines.length; i += 1) {
    const line = lines[i];
    if (line && !/^\s/.test(line)) break;
    const value = line.trim();
    if (value) parts.push(value);
  }
  return parts.join(" ").replace(/^['"]|['"]$/g, "");
}

function loadSkills() {
  return SKILL_NAMES.map((name) => {
    const path = join(SKILLS_DIR, name, "SKILL.md");
    if (!existsSync(path)) throw new Error(`Missing required upstream skill: ${path}`);
    const raw = readFileSync(path, "utf8");
    const { header, body } = splitFrontmatter(raw, path);
    return {
      id: name,
      name,
      description: readDescription(header),
      path,
      content: `${OPENCODE_ADAPTER}\n\n---\n\n${body}`,
      autoinvoke: false,
    };
  });
}

function buildAgentProfile(fileName, { reviewer = false, synthesizer = false } = {}) {
  const sourcePath = join(UPSTREAM_AGENTS_DIR, fileName);
  const raw = readFileSync(sourcePath, "utf8");
  const { header, body } = splitFrontmatter(raw, sourcePath);
  const id = readYamlScalar(header, "name");
  const description = readDescription(header);
  if (!/^egm-[a-z0-9-]+$/.test(id)) throw new Error(`Unexpected EGM agent ID in ${sourcePath}: ${id}`);

  const permissions = [
    '  - action: read\n    resource: "*"\n    effect: allow',
    '  - action: glob\n    resource: "*"\n    effect: allow',
    '  - action: grep\n    resource: "*"\n    effect: allow',
    '  - action: webfetch\n    resource: "*"\n    effect: allow',
    '  - action: websearch\n    resource: "*"\n    effect: allow',
  ];

  if (reviewer) {
    permissions.push(
      '  - action: edit\n    resource: "*"\n    effect: deny',
      '  - action: shell\n    resource: "*"\n    effect: deny',
      '  - action: subagent\n    resource: "*"\n    effect: deny',
    );
  } else {
    permissions.push(
      '  - action: edit\n    resource: "*"\n    effect: deny',
      '  - action: edit\n    resource: "*.md"\n    effect: allow',
      '  - action: edit\n    resource: "**/*.md"\n    effect: allow',
      '  - action: shell\n    resource: "*"\n    effect: deny',
      '  - action: subagent\n    resource: "*"\n    effect: allow',
    );
  }

  let adaptedBody = body;
  if (fileName === "bootstrap_orchestrator.md") {
    adaptedBody += "\n\n## OpenCode V2 adapter constraint\n\nOpenCode is configured with experimental.subagent_depth=2. This coordinator may dispatch one level of fresh documentation workers, but must not attempt deeper nesting. Keep all file modifications within Markdown documentation files.\n";
  }
  if (synthesizer) {
    adaptedBody += "\n\n## OpenCode V2 adapter constraint\n\nOpenCode is configured with experimental.subagent_depth=2. You may dispatch one level of fresh Goldfish reviewers. Reviewers are read-only and may not spawn additional agents. Do not claim a reviewer completed unless the actual child session returned a report.\n";
  }

  return {
    id,
    filePath: join(LOCAL_AGENTS_DIR, `${id}.md`),
    content: [
      "---",
      `description: ${JSON.stringify(description)}`,
      "mode: subagent",
      "permissions:",
      permissions.join("\n"),
      "---",
      "",
      adaptedBody,
    ].join("\n"),
  };
}

function syncAgentProfiles() {
  mkdirSync(LOCAL_AGENTS_DIR, { recursive: true });
  const profiles = [
    ...REVIEWER_FILES.map((fileName) => buildAgentProfile(fileName, { reviewer: true })),
    buildAgentProfile("synthesizer.md", { synthesizer: true }),
    buildAgentProfile("bootstrap_orchestrator.md"),
  ];

  for (const profile of profiles) {
    const temporary = `${profile.filePath}.tmp`;
    writeFileSync(temporary, profile.content, "utf8");
    renameSync(temporary, profile.filePath);
  }
  return profiles.map((profile) => profile.id);
}

export default Plugin.define({
  id: "elephant-goldfish-model-opencode",
  async setup(ctx) {
    if (!existsSync(SKILLS_DIR) || !existsSync(UPSTREAM_AGENTS_DIR)) {
      throw new Error(`[egm] Upstream EGM checkout not found or incomplete: ${UPSTREAM_ROOT}`);
    }

    const agentIDs = syncAgentProfiles();
    await ctx.agent.reload();

    let skills = loadSkills();
    await ctx.skill.transform((editor) => {
      for (const skill of skills) {
        if (editor.get(skill.id)) editor.update(skill.id, (existing) => Object.assign(existing, skill));
        else editor.add(skill);
      }
    });

    await ctx.command.transform((editor) => {
      for (const skill of skills) {
        editor.add({
          name: skill.id,
          description: skill.description,
          execute: async ({ sessionID, prompt, delivery }) => {
            const originalText = typeof prompt?.text === "string" ? prompt.text.trim() : "";
            await ctx.session.prompt({
              sessionID,
              text: originalText || `Run the ${skill.id} workflow for this request.`,
              files: prompt?.files,
              agents: prompt?.agents,
              skills: [...(prompt?.skills ?? []), { id: skill.id }],
              delivery,
            });
          },
        });
      }
    });

    let reloadTimer;
    let refsWatcher;
    const refreshFromUpstream = async () => {
      try {
        skills = loadSkills();
        const refreshedAgentIDs = syncAgentProfiles();
        await ctx.skill.reload();
        await ctx.agent.reload();
        console.info(
          `[egm] Refreshed ${skills.length} skills and ${refreshedAgentIDs.length} agent profiles after upstream update.`,
        );
      } catch (error) {
        console.error(
          `[egm] Could not refresh registrations after upstream update: ${error instanceof Error ? error.message : String(error)}`,
        );
      }
    };

    try {
      refsWatcher = watch(join(UPSTREAM_ROOT, ".git", "refs", "heads"), { persistent: false }, () => {
        if (reloadTimer) clearTimeout(reloadTimer);
        reloadTimer = setTimeout(() => void refreshFromUpstream(), 500);
        reloadTimer.unref?.();
      });
    } catch (error) {
      console.warn(
        `[egm] Could not watch upstream Git refs for refresh: ${error instanceof Error ? error.message : String(error)}`,
      );
    }

    console.info(
      `[egm] Registered ${skills.length} upstream skills, seven EGM workflow commands, and ${agentIDs.length} generated agent profiles.`,
    );

    return () => {
      refsWatcher?.close();
      if (reloadTimer) clearTimeout(reloadTimer);
    };
  },
});
