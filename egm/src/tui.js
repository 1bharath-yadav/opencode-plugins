import { updateEgmUpstream } from "./update-core.js";

let updating = false;

function setup(api) {
  api.keymap.layer(() => ({
    mode: "global",
    priority: 1000,
    commands: [
      {
        id: "egm.update.from.plugin.manager",
        title: "Update EGM and refresh its skills",
        description: "Fast-forward Google's EGM source and refresh the installed OpenCode skills and reviewer agents.",
        group: "EGM",
        bind: "ctrl+r",
        run: () => {
          const pluginDialogOpen = api.keymap.commands().some(
            (command) => command.id === "dialog.plugins.check" || command.id === "dialog.plugins.update",
          );
          if (!pluginDialogOpen) return false;
          if (updating) return;
          updating = true;
          void (async () => {
            api.ui.toast.show({ message: "Checking Google EGM for updates…", variant: "info" });
            try {
              const result = await updateEgmUpstream();
              api.ui.toast.show({
                message: result.updated
                  ? `${result.message} Refreshing EGM skills and agents…`
                  : result.message,
                variant: result.updated ? "success" : "info",
                duration: 7000,
              });
            } catch (error) {
              api.ui.toast.show({
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
}

export default {
  id: "elephant-goldfish-model-opencode.tui",
  setup,
  tui: setup,
};
