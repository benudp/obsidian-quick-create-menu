import { App, setIcon } from "obsidian";
import { NoteTarget, TargetType } from "../types";
import { FileCreator } from "../core/FileCreator";

export class PopupMenu {
  app: App;
  fileCreator: FileCreator;

  constructor(app: App) {
    this.app = app;
    this.fileCreator = new FileCreator(app);
  }

  attach(wrapper: HTMLElement, btn: HTMLElement, targets: NoteTarget[]) {
    // 1. Create the Popup container inside the wrapper
    const popup = wrapper.createDiv({ cls: "quick-note-popup" });

    // Store pinned state in the DOM so the global document click can access it
    wrapper.dataset.pinned = "false";
    let hideTimeout: number | null = null;

    // 2. Populate Items
    targets.forEach((target) => {
      if (!target.enabled) return;

      const item = popup.createDiv({ cls: "quick-note-popup-item" });

      // Icon
      const iconSpan = item.createSpan({ cls: "popup-icon" });
      setIcon(iconSpan, target.icon || this.getIconForType(target.type));
      if (target.color) iconSpan.style.color = target.color;

      // Label
      const labelSpan = item.createSpan({ text: target.label });
      if (target.color) labelSpan.style.color = target.color;

      // Click Handler for executing the action
      item.addEventListener("click", (e) => {
        e.stopPropagation();
        this.fileCreator.executeCreate(target);

        // Unpin and hide the menu after executing
        wrapper.dataset.pinned = "false";
        popup.removeClass("is-visible");
      });
    });

    // 3. Hover logic
    wrapper.addEventListener("mouseenter", () => {
      if (hideTimeout !== null) {
        window.clearTimeout(hideTimeout);
        hideTimeout = null;
      }
      popup.addClass("is-visible");
    });

    wrapper.addEventListener("mouseleave", () => {
      // Only start the hide timeout if it's not pinned
      if (wrapper.dataset.pinned !== "true") {
        hideTimeout = window.setTimeout(() => {
          popup.removeClass("is-visible");
        }, 300); // 300ms delay like Minidoro
      }
    });

    // 4. Click to Pin logic
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const isPinned = wrapper.dataset.pinned === "true";

      if (isPinned) {
        wrapper.dataset.pinned = "false";
        popup.removeClass("is-visible");
      } else {
        wrapper.dataset.pinned = "true";
        popup.addClass("is-visible");
      }
    });
  }

  private getIconForType(type: TargetType): string {
    switch (type) {
      case "folder":
        return "folder";
      case "current-folder":
        return "folder-open";
      case "obsidian-command":
        return "zap";
      default:
        return "file";
    }
  }
}
