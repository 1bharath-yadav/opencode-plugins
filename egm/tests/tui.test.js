import { describe, expect, it, mock } from "bun:test";

let updateCalls = 0;
mock.module("../src/update-core.js", () => ({
  updateEgmUpstream: async () => {
    updateCalls += 1;
    return { updated: false, message: "EGM test checkout is already up to date." };
  },
}));
const { default: plugin } = await import("../src/tui.js");

describe("EGM OpenCode V2 TUI plugin", () => {
  it("uses the V2 TUI Plugin.define contract", () => {
    expect(plugin.id).toBe("elephant-goldfish-model-opencode.tui");
    expect(typeof plugin.setup).toBe("function");
  });

  it("preserves native Ctrl+R outside the Plugins manager", () => {
    let layerFactory;
    plugin.setup({
      keymap: {
        layer: (factory) => { layerFactory = factory; },
        commands: () => [],
      },
      ui: { toast: { show: () => { throw new Error("No toast should be shown outside the Plugins manager"); } } },
    });

    const layer = layerFactory();
    expect(layer.mode).toBe("global");
    const shortcut = layer.commands.find((item) => item.id === "egm.update.from.plugin.manager");
    expect(shortcut.bind).toBe("ctrl+r");
    expect(shortcut.run()).toBe(false);
  });

  it("updates EGM only while the Plugins manager commands are reachable", async () => {
    let layerFactory;
    const toasts = [];
    let finishToast;
    const completed = new Promise((resolve) => { finishToast = resolve; });
    plugin.setup({
      keymap: {
        layer: (factory) => { layerFactory = factory; },
        commands: () => [{ id: "dialog.plugins.check" }],
      },
      ui: { toast: { show: (options) => { toasts.push(options); if (options.message.includes("already up to date")) finishToast(); } } },
    });

    const shortcut = layerFactory().commands.find((item) => item.id === "egm.update.from.plugin.manager");
    expect(shortcut.run()).toBeUndefined();
    await completed;
    expect(updateCalls).toBe(1);
    expect(toasts[0].message).toContain("Checking Google EGM");
    expect(toasts[1].message).toContain("already up to date");
    expect(toasts[1].variant).toBe("info");
  });
});
