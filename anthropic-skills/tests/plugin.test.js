import { afterAll, beforeAll, describe, expect, it } from "bun:test";
import plugin from "../src/index.js";

const skills = [];
const context = {
  skill: { transform: async (apply) => apply({ get: (id) => skills.find((item) => item.id === id), add: (value) => skills.push(value), update: (id, fn) => fn(skills.find((item) => item.id === id)) }) },
};

describe("Anthropic Agent Skills V2 plugin", () => {
  beforeAll(async () => { await plugin.setup(context); });
  it("registers all top-level Agent Skills with unique IDs", () => {
    expect(plugin.id).toBe("anthropic-agent-skills-opencode");
    expect(skills.length).toBeGreaterThanOrEqual(18);
    expect(new Set(skills.map((item) => item.id)).size).toBe(skills.length);
  });
  it("retains local source paths and flags proprietary skills for non-redistribution", () => {
    const docx = skills.find((item) => item.id === "anthropic-docx");
    const pdf = skills.find((item) => item.id === "anthropic-pdf");
    expect(docx.path).toContain("vendor/anthropic-skills/skills/docx/SKILL.md");
    expect(docx.content).toContain("must not be redistributed");
    expect(pdf.content).toContain("proprietary/source-available");
  });
});
