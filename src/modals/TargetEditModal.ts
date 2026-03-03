import {
  App,
  Modal,
  Setting,
  Notice,
  setIcon,
  ButtonComponent,
  DropdownComponent,
} from "obsidian";
import { FolderSuggest } from "../suggests/FolderSuggest";
import { FileSuggest } from "../suggests/FileSuggest";
import { IconSuggestModal } from "./IconSuggestModal";
import { CommandSuggestModal } from "./CommandSuggestModal";
import { NoteTarget, TargetType } from "../types";

const AVAILABLE_COLORS = [
  { label: "Default", value: "" },
  { label: "Red", value: "var(--color-red)" },
  { label: "Orange", value: "var(--color-orange)" },
  { label: "Yellow", value: "var(--color-yellow)" },
  { label: "Green", value: "var(--color-green)" },
  { label: "Cyan", value: "var(--color-cyan)" },
  { label: "Blue", value: "var(--color-blue)" },
  { label: "Purple", value: "var(--color-purple)" },
  { label: "Pink", value: "var(--color-pink)" },
];

export class TargetEditModal extends Modal {
  target: NoteTarget;
  onSubmit: (target: NoteTarget) => void;
  isNew: boolean;

  previewDiv: HTMLElement | null = null;
  iconPreviewEl: HTMLElement | null = null;
  iconButton: ButtonComponent | null = null;
  colorDropdown: DropdownComponent | null = null;

  constructor(
    app: App,
    target: NoteTarget | null,
    onSubmit: (t: NoteTarget) => void,
  ) {
    super(app);
    this.isNew = target === null;
    this.target = target || {
      id: Date.now().toString(),
      label: "New Action",
      type: "folder",
      icon: "file",
      color: "",
      isSystem: false,
      path: "",
      filenamePattern: "Note - {{date}}",
      dateFormat: "YYYY-MM-DD",
      templatePath: "",
      enabled: true,
    };

    if (
      !this.target.filenamePattern &&
      this.target.type !== "obsidian-command"
    ) {
      // @ts-ignore migration
      const oldPrefix = this.target.prefix || "Note ";
      this.target.filenamePattern = `${oldPrefix}{{date}}`;
    }

    this.onSubmit = onSubmit;
    this.setTitle(
      this.isNew ? "Create Quick Action" : `Edit Action: ${this.target.label}`,
    );
  }

  onOpen() {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.addClass("oqcm-modal-v2");

    /* =========================================
       CARD 1: GENERAL & IDENTITY
       ========================================= */
    const identityCard = contentEl.createDiv("oqcm-card");
    identityCard.createEl("h3", {
      text: "General",
      cls: "oqcm-card-title",
    });

    new Setting(identityCard).setName("Action Label").addText((t) =>
      t
        .setValue(this.target.label)
        .setPlaceholder("e.g., Daily Journal")
        .onChange((v) => {
          this.target.label = v;
          this.updatePreview();
        }),
    );

    new Setting(identityCard).setName("Action Type").addDropdown((cb) => {
      cb.addOption("folder", "Create in specific folder")
        .addOption("current-folder", "Create in current folder")
        .addOption("obsidian-command", "Run Obsidian Command")
        .setValue(this.target.type)
        .onChange((v) => {
          this.target.type = v as TargetType;
          this.onOpen();
        });
    });

    /* =========================================
       CARD 2: APPEARANCE
       ========================================= */
    const appearanceCard = contentEl.createDiv("oqcm-card");
    appearanceCard.createEl("h3", {
      text: "Appearance",
      cls: "oqcm-card-title",
    });

    const visualSetting = new Setting(appearanceCard)
      .setName("Menu Icon & Color")
      .setDesc("How this action appears in the popup menu.")
      .setClass("oqcm-visual-setting");

    visualSetting.controlEl.empty();
    const wrap = visualSetting.controlEl.createDiv("oqcm-visual-wrap");

    const iconCol = wrap.createDiv("oqcm-col");
    this.iconButton = new ButtonComponent(iconCol)
      .setClass("oqcm-icon-btn")
      .onClick(() => {
        new IconSuggestModal(this.app, (icon) => {
          this.target.icon = icon;
          this.updateIconPreview();
        }).open();
      });

    this.iconPreviewEl = this.iconButton.buttonEl.createDiv("oqcm-icon-inner");
    this.updateIconPreview();

    const colorCol = wrap.createDiv("oqcm-col");
    this.colorDropdown = new DropdownComponent(colorCol);
    AVAILABLE_COLORS.forEach((c) =>
      this.colorDropdown!.addOption(c.value, c.label),
    );
    this.colorDropdown.setValue(this.target.color).onChange((value) => {
      this.target.color = value;
      this.updateIconPreview();
    });

    /* =========================================
       CARD 3: ACTION CONFIGURATION
       ========================================= */
    const configCard = contentEl.createDiv("oqcm-card");
    configCard.createEl("h3", {
      text:
        this.target.type === "obsidian-command"
          ? "Command Details"
          : "File Details",
      cls: "oqcm-card-title",
    });

    if (this.target.type !== "obsidian-command") {
      if (this.target.type === "folder") {
        new Setting(configCard)
          .setName("Target Folder")
          .setDesc("Where should this note be saved?")
          .addText((text) => {
            text
              .setValue(this.target.path)
              .setPlaceholder("e.g., Inbox/Notes")
              .onChange((v) => {
                this.target.path = v;
                this.updatePreview();
              });
            new FolderSuggest(this.app, text.inputEl);
          });
      }

      new Setting(configCard)
        .setName("Filename Pattern")
        .setDesc("Use {{date}} to inject the current time.")
        .addText((text) =>
          text
            .setValue(this.target.filenamePattern)
            .setPlaceholder("Note - {{date}}")
            .onChange((v) => {
              this.target.filenamePattern = v;
              this.updatePreview();
            }),
        );

      new Setting(configCard)
        .setName("Date Format")
        .setDesc("MomentJS formatting (e.g., YYYY-MM-DD).")
        .addText((text) =>
          text
            .setValue(this.target.dateFormat)
            .setPlaceholder("YYYY-MM-DD")
            .onChange((v) => {
              this.target.dateFormat = v;
              this.updatePreview();
            }),
        );

      new Setting(configCard)
        .setName("Template File")
        .setDesc("Optional template to apply to the new note.")
        .addText((text) => {
          text
            .setValue(this.target.templatePath)
            .setPlaceholder("e.g., Templates/Daily.md")
            .onChange((v) => (this.target.templatePath = v));
          new FileSuggest(this.app, text.inputEl);
        });
    } else {
      new Setting(configCard)
        .setName("Obsidian Command")
        .setDesc(
          this.target.commandId
            ? `Selected: ${this.target.commandId}`
            : "No command selected yet.",
        )
        .addButton((btn) =>
          btn.setButtonText("Browse Commands").onClick(() => {
            new CommandSuggestModal(this.app, (command) => {
              this.target.commandId = command.id;
              this.onOpen();
            }).open();
          }),
        );
    }

    /* =========================================
       LIVE PREVIEW AREA
       ========================================= */
    this.previewDiv = contentEl.createDiv("oqcm-preview-area");
    this.updatePreview();

    /* =========================================
       FOOTER
       ========================================= */
    const footer = contentEl.createDiv("oqcm-footer");
    new ButtonComponent(footer)
      .setButtonText("Cancel")
      .onClick(() => this.close());

    new ButtonComponent(footer)
      .setButtonText(this.isNew ? "Create Action" : "Save Changes")
      .setCta()
      .onClick(() => {
        if (!this.target.label.trim()) {
          new Notice("Please provide an Action Label.");
          return;
        }
        if (this.target.type === "folder" && !this.target.path.trim()) {
          new Notice("Please provide a target folder path.");
          return;
        }
        if (
          this.target.type === "obsidian-command" &&
          !this.target.commandId?.trim()
        ) {
          new Notice("Please select an Obsidian Command.");
          return;
        }
        this.onSubmit(this.target);
        this.close();
      });
  }

  updateIconPreview() {
    if (!this.iconPreviewEl) return;
    this.iconPreviewEl.empty();
    const inner = this.iconPreviewEl.createDiv("oqcm-icon-svg");
    setIcon(inner, this.target.icon || "file");
    inner.style.color = this.target.color || "var(--text-normal)";
    this.updatePreview(); // Update preview to reflect new icon/color
  }

  updatePreview() {
    if (!this.previewDiv) return;
    this.previewDiv.empty();

    const titleEl = this.previewDiv.createEl("div", {
      cls: "oqcm-preview-title",
      text: "Live Preview",
    });

    const chipContainer = this.previewDiv.createDiv("oqcm-preview-chip");

    // Add icon to chip
    const iconSpan = chipContainer.createSpan("oqcm-preview-chip-icon");
    setIcon(iconSpan, this.target.icon || "file");
    iconSpan.style.color = this.target.color || "var(--text-muted)";

    if (this.target.type === "obsidian-command") {
      chipContainer.createSpan({
        text: `Execute: ${this.target.label || "Unnamed Action"}`,
      });
      this.previewDiv.createEl("div", {
        cls: "oqcm-preview-subtext",
        text: `Command ID: ${this.target.commandId || "None selected"}`,
      });
    } else {
      try {
        const dateString = (window as any)
          .moment()
          .format(this.target.dateFormat || "YYYY-MM-DD");
        let pattern = this.target.filenamePattern || "{{date}}";
        let filenameBase = pattern.replace("{{date}}", dateString).trim();
        filenameBase = filenameBase.replace(/[\\/:*?"<>|]/g, "-");

        const folderText =
          this.target.type === "folder"
            ? `${this.target.path || "Vault Root"}/`
            : "Current Folder/";

        chipContainer.createSpan({ text: `${folderText}${filenameBase}.md` });
      } catch {
        chipContainer.createSpan({ text: "Invalid date format" });
      }
    }
  }

  onClose() {
    this.contentEl.empty();
  }
}
