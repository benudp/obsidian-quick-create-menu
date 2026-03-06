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
    const popup = wrapper.createDiv({ cls: "quick-note-popup" });
    wrapper.dataset.pinned = "false";
    let hideTimeout: number | null = null;

    targets.forEach((target) => {
      if (!target.enabled) return;

      const item = popup.createDiv({ cls: "quick-note-popup-item" });

      const iconSpan = item.createSpan({ cls: "popup-icon" });
      setIcon(iconSpan, target.icon || this.getIconForType(target.type));
      if (target.color) iconSpan.style.color = target.color;

      const labelSpan = item.createSpan({ text: target.label });
      if (target.color) labelSpan.style.color = target.color;

      item.addEventListener("click", (e) => {
        e.stopPropagation();
        this.fileCreator.executeCreate(target);
        wrapper.dataset.pinned = "false";
        popup.removeClass("is-visible");
      });
    });

    // NEW: Safe display function that checks for window overflow
    const showPopupSafely = () => {
      popup.addClass("is-visible");

      // Clear any inline styles first so the CSS default (centered) applies
      popup.style.left = "";
      popup.style.right = "";
      popup.style.transform = "";

      // Measure the menu's bounding box
      const rect = popup.getBoundingClientRect();

      // If the right edge goes past the screen width (leaving a 12px safety gap)
      if (rect.right > window.innerWidth - 12) {
        popup.style.left = "auto";
        popup.style.right = "-40px"; // Align to the right edge of the wrapper
        popup.style.transform = "none";
      }
    };

    wrapper.addEventListener("mouseenter", () => {
      if (hideTimeout !== null) {
        window.clearTimeout(hideTimeout);
        hideTimeout = null;
      }
      showPopupSafely();
    });

    wrapper.addEventListener("mouseleave", () => {
      if (wrapper.dataset.pinned !== "true") {
        hideTimeout = window.setTimeout(() => {
          popup.removeClass("is-visible");
        }, 300);
      }
    });

    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const isPinned = wrapper.dataset.pinned === "true";

      if (isPinned) {
        wrapper.dataset.pinned = "false";
        popup.removeClass("is-visible");
      } else {
        wrapper.dataset.pinned = "true";
        showPopupSafely();
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
