import { afterAll, beforeAll, describe, expect, it } from "bun:test";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

let plugin;
let configRoot;

beforeAll(async () => {
  configRoot = mkdtempSync(join(tmpdir(), "egm-opencode-test-"));
  process.env.OPENCODE_CONFIG_DIR = configRoot;
  process.env.EGM_UPSTREAM_DIR = join(process.env.HOME, ".local/share/opencode/egm-upstream");
  plugin = (await import("../src/index.js")).default;
});

afterAll(() => {
  if (configRoot) rmSync(configRoot, { recursive: true, force: true });
});

describe("EGM OpenCode V2 server plugin", () => {
  it("uses the V2 Plugin.define contract", () => {
    expect(plugin.id).toBe("elephant-goldfish-model-opencode");
    expect(typeof plugin.setup).toBe("function");
  });

  it("registers all upstream workflows and generates nine isolated agents", async () => {
    const skills = [];
    const commands = [];
    let agentReloadCount = 0;
    const context = {
      agent: { reload: async () => { agentReloadCount += 1; } },
      skill: {
        transform: async (apply) => {
          apply({
            get: (id) => skills.find((skill) => skill.id === id),
            add: (skill) => skills.push(skill),
            update: (id, update) => {
              const current = skills.find((skill) => skill.id === id);
              update(current);
            },
            remove: (id) => { const index = skills.findIndex((skill) => skill.id === id); if (index >= 0) skills.splice(index, 1); },
            list: () => skills,
          });
          return { dispose: async () => {} };
        },
      },
      command: {
        transform: async (apply) => {
          apply({ add: (command) => commands.push(command) });
          return { dispose: async () => {} };
        },
      },
      session: { prompt: async (input) => { context.lastPrompt = input; } },
      lastPrompt: undefined,
    };

    const cleanup = await plugin.setup(context);
    try {
      expect(skills.map((item) => item.id)).toEqual([
        "egm-bootstrap",
        "egm-brainstorm",
        "egm-draft",
        "egm-drift-report",
        "egm-resolve",
        "egm-review",
        "egm-review-loop",
      ]);
      expect(commands.map((item) => item.name).sort()).toEqual(skills.map((item) => item.id).sort());
      expect(agentReloadCount).toBe(1);

      const review = commands.find((item) => item.name === "egm-review");
      await review.execute({
        sessionID: "ses_test",
        prompt: {
          text: "Review the API boundary",
          files: [{ uri: "file:///tmp/api.ts" }],
          agents: [{ name: "explore" }],
          skills: [{ id: "existing-skill" }],
        },
        delivery: "queue",
      });
      expect(context.lastPrompt).toEqual({
        sessionID: "ses_test",
        text: "Review the API boundary",
        files: [{ uri: "file:///tmp/api.ts" }],
        agents: [{ name: "explore" }],
        skills: [{ id: "existing-skill" }, { id: "egm-review" }],
        delivery: "queue",
      });

      const agentDir = join(configRoot, "agents");
      const agentFiles = [
        "egm-bootstrap-orchestrator.md",
        "egm-codebase-details.md",
        "egm-comprehension.md",
        "egm-design.md",
        "egm-implementation-readiness.md",
        "egm-structural.md",
        "egm-style.md",
        "egm-synthesizer.md",
        "egm-zoom-out.md",
      ];
      for (const file of agentFiles) expect(readFileSync(join(agentDir, file), "utf8")).toContain("mode: subagent");
      expect(readFileSync(join(agentDir, "egm-design.md"), "utf8")).toContain('effect: deny');
    } finally {
      await cleanup?.();
    }
  });
});
