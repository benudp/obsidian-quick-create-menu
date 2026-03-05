import { App, Modal, ButtonComponent } from "obsidian";

export class ConfirmDeleteModal extends Modal {
  itemName: string;
  onConfirm: () => void;

  constructor(app: App, itemName: string, onConfirm: () => void) {
    super(app);
    this.itemName = itemName;
    this.onConfirm = onConfirm;
  }

  onOpen() {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.addClass("oqcm-confirm-delete-modal");
    this.setTitle("Delete Action");

    contentEl.createEl("p", {
      text: `Are you sure you want to delete "${this.itemName}"? This cannot be undone.`,
    });

    const footer = contentEl.createDiv();
    footer.addClass("oqcm-confirm-delete-modal-footer");

    new ButtonComponent(footer)
      .setButtonText("Cancel")
      .onClick(() => this.close());

    new ButtonComponent(footer)
      .setButtonText("Delete")
      .setWarning() // Makes the button natively red in Obsidian
      .onClick(() => {
        this.onConfirm();
        this.close();
      });
  }

  onClose() {
    this.contentEl.empty();
  }
}
