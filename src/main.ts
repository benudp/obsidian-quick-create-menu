import { Plugin, WorkspaceLeaf, Notice, setIcon } from "obsidian";
import { QuickNoteSettings, DEFAULT_SETTINGS } from "./types";
import { QuickNoteSettingTab } from "./ui/SettingsTab";
import { PopupMenu } from "./ui/PopupMenu";

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
        new Notice("Use the + icon in the header to open the menu.");
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

    // NEW: Re-inject icons when a new file is opened
    this.registerEvent(
      this.app.workspace.on("file-open", () => {
        this.refreshHeaderIcons();
      }),
    );

    this.registerDomEvent(document, "click", (e: MouseEvent) => {
      document
        .querySelectorAll(".quick-note-container")
        .forEach((container) => {
          if (!container.contains(e.target as Node)) {
            if ((container as HTMLElement).dataset.pinned === "true") {
              (container as HTMLElement).dataset.pinned = "false";
              const popup = container.querySelector(".quick-note-popup");
              if (popup) popup.removeClass("is-visible");
            }
          }
        });
    });
  }

  onunload() {
    this.removeHeaderIcons();
  }

  removeHeaderIcons() {
    this.app.workspace.iterateAllLeaves((leaf) => {
      const el = this.iconElements.get(leaf);
      if (el) {
        el.remove();
        this.iconElements.delete(leaf);
      }
    });
  }

  refreshHeaderIcons(forceRebuild: boolean = false) {
    if (forceRebuild) {
      this.removeHeaderIcons();
    }

    if (!this.settings.showInHeader) {
      this.removeHeaderIcons();
      return;
    }

    this.app.workspace.iterateAllLeaves((leaf) => {
      const viewType = leaf.view.getViewType();
      if (viewType === "markdown" || viewType === "empty") {
        // @ts-ignore
        const viewActions =
          leaf.view.containerEl.querySelector(".view-actions");

        if (viewActions) {
          // FIX: Check if the element exists AND is actually still attached to the DOM
          const existingWrapper = this.iconElements.get(leaf);
          if (existingWrapper && viewActions.contains(existingWrapper)) {
            return; // It's still there, do nothing
          }

          // If it was destroyed by Obsidian (e.g. switching views), clean up the cache
          if (existingWrapper) {
            this.iconElements.delete(leaf);
          }

          // 1. Create Wrapper
          const wrapper = viewActions.createDiv({
            cls: "quick-note-container",
          });

          // 2. Create Button
          const btn = wrapper.createDiv({
            cls: "clickable-icon view-action quick-note-action",
          });
          btn.setAttribute("aria-label", "Quick Create Note");
          setIcon(btn, "plus-circle");

          // 3. Let PopupMenu attach the menu contents and event listeners
          this.popupMenu.attach(wrapper, btn, this.settings.targets);

          this.iconElements.set(leaf, wrapper);
          viewActions.prepend(wrapper);
        }
      }
    });
  }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
    this.refreshHeaderIcons(true);
  }
}
