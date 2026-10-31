import { Plugin } from "@opencode/plugin/tui";
import { updateEgmUpstream } from "./update-core.js";

let updating = false;

export default Plugin.define({
  id: "elephant-goldfish-model-opencode.tui",
  setup(ctx) {
    ctx.keymap.layer(() => ({
      mode: "global",
      priority: 1000,
      commands: [
        {
          id: "egm.update.from.plugin.manager",
          title: "Update EGM and refresh its skills",
          description:
            "Fast-forward Google's EGM source and refresh the installed OpenCode skills and reviewer agents.",
          group: "EGM",
          bind: "ctrl+r",
          run: () => {
            // The plugin-manager commands exist only while that UI is active.
            // Returning false elsewhere preserves OpenCode's native Ctrl+R.
            const pluginDialogOpen = ctx.keymap.commands().some(
              (command) => command.id === "dialog.plugins.check" || command.id === "dialog.plugins.update",
            );
            if (!pluginDialogOpen) return false;
            if (updating) return;
            updating = true;

            void (async () => {
              ctx.ui.toast.show({ message: "Checking Google EGM for updates…", variant: "info" });
              try {
                const result = await updateEgmUpstream();
                ctx.ui.toast.show({
                  message: result.updated
                    ? `${result.message} Refreshing EGM skills and agents…`
                    : result.message,
                  variant: result.updated ? "success" : "info",
                  duration: 7000,
                });
              } catch (error) {
                ctx.ui.toast.show({
                  message: `EGM update stopped safely: ${error instanceof Error ? error.message : String(error)}`,
                  variant: "error",
                  duration: 9000,
                });
              } finally {
                updating = false;
              }
            })();
          },
        },
      ],
    }));
  },
});
