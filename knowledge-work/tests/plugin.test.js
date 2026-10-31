import { afterAll, beforeAll, describe, expect, it } from "bun:test";
import plugin from "../src/index.js";

const skills = [];
const commands = [];
const context = {
  skill: { transform: async (apply) => apply({ get: (id) => skills.find((item) => item.id === id), add: (value) => skills.push(value), update: (id, fn) => fn(skills.find((item) => item.id === id)) }) },
  command: { transform: async (apply) => apply({ add: (item) => commands.push(item) }) },
  session: { prompt: async (input) => { context.lastPrompt = input; } },
  lastPrompt: undefined,
};

describe("Knowledge Work V2 plugin", () => {
  beforeAll(async () => { await plugin.setup(context); });
  it("registers all discovered skill and command assets with unique names", () => {
    expect(plugin.id).toBe("anthropic-knowledge-work-opencode");
    expect(skills.length).toBeGreaterThan(200);
    expect(commands.length).toBeGreaterThan(10);
    expect(new Set(skills.map((item) => item.id)).size).toBe(skills.length);
    expect(new Set(commands.map((item) => item.name)).size).toBe(commands.length);
  });
  it("forwards command invocations using the V2 session.prompt input shape", async () => {
    const action = commands.find((item) => item.name === "product-management-brainstorm");
    expect(action).toBeTruthy();
    await action.execute({ sessionID: "session-test", prompt: { text: "Design onboarding", files: [{ uri: "file:///tmp/brief.md" }] }, delivery: "queue" });
    expect(context.lastPrompt.sessionID).toBe("session-test");
    expect(context.lastPrompt.text).toContain("Design onboarding");
    expect(context.lastPrompt.files[0].uri).toBe("file:///tmp/brief.md");
    expect(context.lastPrompt.delivery).toBe("queue");
    expect(context.lastPrompt.text).toContain("explicit user approval");
  });
});
