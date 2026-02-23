import { Plugin, WorkspaceLeaf, Notice, setIcon } from "obsidian";
import { QuickNoteSettings, DEFAULT_SETTINGS } from "./types";
import { QuickNoteSettingTab } from "./ui/SettingsTab";
import { PopupMenu } from "./ui/PopupMenu";
/** klovesbp*/
/** klovesbp*/
export default class QuickNotePlugin extends Plugin {
  settings: QuickNoteSettings;
  popupMenu: PopupMenu;

  iconElements: WeakMap<WorkspaceLeaf, HTMLElement> = new WeakMap();

  async onload() {
    await this.loadSettings();
    this.popupMenu = new PopupMenu(this.app);
    this.addSettingTab(new QuickNoteSettingTab(this.app, this));

    this.addCommand({
      id: "open-quick-create-menu",
      name: "Open Quick Create Menu",
      callback: () => {
        const leaf = this.app.workspace.getMostRecentLeaf();
        if (leaf) {
          new Notice("Use the + icon in the header to open the menu.");
        }
      },
    });

    this.app.workspace.onLayoutReady(() => {
      this.refreshHeaderIcons();
    });

    this.registerEvent(
      this.app.workspace.on("layout-change", () => {
        this.refreshHeaderIcons();
      }),
    );
  }

  onunload() {
    this.app.workspace.iterateAllLeaves((leaf) => {
      const el = this.iconElements.get(leaf);
      if (el) {
        el.remove();
        this.iconElements.delete(leaf);
      }
    });
  }

  refreshHeaderIcons() {
    if (!this.settings.showInHeader) return;

    this.app.workspace.iterateAllLeaves((leaf) => {
      const viewType = leaf.view.getViewType();
      if (viewType === "markdown" || viewType === "empty") {
        if (this.iconElements.has(leaf)) return;

        // @ts-ignore
        const container = leaf.view.containerEl.querySelector(".view-actions");

        if (container) {
          const btn = container.createDiv({
            cls: "clickable-icon view-action quick-note-action",
          });
          btn.setAttribute("aria-label", "Quick Create Note");

          setIcon(btn, "plus-circle");

          btn.addEventListener("click", (e) => {
            this.popupMenu.show(e, btn, this.settings.targets);
          });

          this.iconElements.set(leaf, btn);
          container.prepend(btn);
        }
      }
    });
  }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }
}
