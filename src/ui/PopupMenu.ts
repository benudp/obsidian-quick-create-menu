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

  show(event: MouseEvent, anchorBtn: HTMLElement, targets: NoteTarget[]) {
    // 1. Create Container
    const popup = document.body.createDiv({ cls: "quick-note-popup" });

    // 2. Populate Items
    targets.forEach((target) => {
      if (!target.enabled) return;

      // Removed the old daily-notes internalPlugin check here!

      const item = popup.createDiv({ cls: "quick-note-popup-item" });

      // Icon
      const iconSpan = item.createSpan({ cls: "popup-icon" });
      setIcon(iconSpan, this.getIconForType(target.type));
      if (target.color) iconSpan.style.color = target.color;

      // Label
      const labelSpan = item.createSpan({ text: target.label });
      if (target.color) labelSpan.style.color = target.color;

      // Click Handler
      item.addEventListener("click", (e) => {
        e.stopPropagation(); // Prevent triggering the window close listener immediately
        this.fileCreator.executeCreate(target);
        this.closePopup(popup);
      });
    });

    // 3. Position Logic
    const rect = anchorBtn.getBoundingClientRect();
    popup.style.top = `${rect.bottom + 5}px`;
    popup.style.right = `${window.innerWidth - rect.right}px`;

    // 4. Close on Click Outside
    const closeListener = (e: MouseEvent) => {
      if (!popup.contains(e.target as Node) && e.target !== anchorBtn) {
        this.closePopup(popup);
        document.removeEventListener("click", closeListener);
      }
    };

    // Delay adding listener to avoid immediate close from the triggering click
    setTimeout(() => {
      document.addEventListener("click", closeListener);
    }, 100);
  }

  closePopup(popup: HTMLElement) {
    if (popup && popup.parentElement) {
      popup.remove();
    }
  }
  private getIconForType(type: TargetType): string {
    switch (type) {
      case "folder":
        return "folder";
      case "current-folder":
        return "folder-open";
      case "obsidian-command":
        return "zap"; // Replaced daily-note with a bolt/zap icon
      default:
        return "file";
    }
  }
}
