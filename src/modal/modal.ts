import { App, Modal, Setting, Notice, setIcon, ButtonComponent, DropdownComponent } from "obsidian";
import { FolderSuggest } from "./FolderSuggestModal";
import { FileSuggest } from "./FileSuggestModal";
import { IconSuggestModal } from "./IconSuggestModal";
import { NoteTarget } from "src/types";

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

  constructor(app: App, target: NoteTarget | null, onSubmit: (t: NoteTarget) => void) {
    super(app);

    this.isNew = target === null;

    this.target = target || {
      id: Date.now().toString(),
      label: "New Note",
      type: "folder",
      icon: "file",
      color: "",
      isSystem: false,
      path: "",
      filenamePattern: "Note - {{date}}",
      dateFormat: "YYYY-MM-DD",
      templatePath: "",
      openAfterCreate: true,
      enabled: true,
    };

    if (!this.target.filenamePattern && this.target.type !== "daily-note") {
      // @ts-ignore migration
      const oldPrefix = this.target.prefix || "Note ";
      this.target.filenamePattern = `${oldPrefix}{{date}}`;
    }

    this.onSubmit = onSubmit;
    this.setTitle(this.isNew ? "Add New Target" : `Edit: ${this.target.label}`);
  }

  onOpen() {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.addClass("quick-note-modal");

    /* LABEL */

    new Setting(contentEl)
      .setName("Label")
      .addText(t =>
        t.setValue(this.target.label)
          .setPlaceholder("My Notes")
          .onChange(v => (this.target.label = v))
      );

    /* ICON + COLOR */

    const visualSetting = new Setting(contentEl)
      .setName("Icon & Color")
      .setClass("oqcm-visual-setting");

    visualSetting.controlEl.empty();

    const wrap = visualSetting.controlEl.createDiv("oqcm-visual-wrap");

    /* ICON BUTTON */

    const iconCol = wrap.createDiv("oqcm-col");

    this.iconButton = new ButtonComponent(iconCol)
      .setClass("oqcm-icon-btn")
      .onClick(() => {
        new IconSuggestModal(this.app, icon => {
          this.target.icon = icon;
          this.updateIconPreview();
        }).open();
      });

    this.iconPreviewEl = this.iconButton.buttonEl.createDiv("oqcm-icon-inner");
    this.updateIconPreview();

    /* COLOR DROPDOWN */

    const colorCol = wrap.createDiv("oqcm-col");

    this.colorDropdown = new DropdownComponent(colorCol);

    AVAILABLE_COLORS.forEach(c => {
      this.colorDropdown!.addOption(c.value, c.label);
    });

    this.colorDropdown.setValue(this.target.color)
      .onChange(value => {
        this.target.color = value;
        this.updateIconPreview();
      });

    /* FILE SETTINGS */

    if (this.target.type !== "daily-note") {

      if (this.target.type === "folder") {
        new Setting(contentEl)
          .setName("Folder Path")
          .addText(text => {
            text.setValue(this.target.path)
              .setPlaceholder("Inbox")
              .onChange(v => (this.target.path = v));

            new FolderSuggest(this.app, text.inputEl);
          });
      }

      new Setting(contentEl)
        .setName("Filename Pattern")
        .setDesc("Use {{date}} for timestamp")
        .addText(text =>
          text.setValue(this.target.filenamePattern)
            .setPlaceholder("Note - {{date}}")
            .onChange(v => {
              this.target.filenamePattern = v;
              this.updatePreview();
            })
        );

      new Setting(contentEl)
        .setName("Date Format")
        .setDesc("MomentJS format")
        .addText(text =>
          text.setValue(this.target.dateFormat)
            .setPlaceholder("YYYY-MM-DD")
            .onChange(v => {
              this.target.dateFormat = v;
              this.updatePreview();
            })
        );

      new Setting(contentEl)
        .setName("Template")
        .addText(text => {
          text.setValue(this.target.templatePath)
            .setPlaceholder("Templates/Note.md")
            .onChange(v => (this.target.templatePath = v));

          new FileSuggest(this.app, text.inputEl);
        });

      this.previewDiv = contentEl.createDiv("quick-note-preview-box");
      this.updatePreview();

    } else {

      contentEl.createDiv({
        cls: "quick-note-info-box",
        text:
          "This target triggers the built-in Daily Note command. Format handled by Daily Notes plugin.",
      });
    }

    /* FOOTER */

    const footer = contentEl.createDiv("oqcm-footer");

    new ButtonComponent(footer)
      .setButtonText("Cancel")
      .onClick(() => this.close());

    new ButtonComponent(footer)
      .setButtonText(this.isNew ? "Add" : "Save")
      .setCta()
      .onClick(() => {
        if (!this.target.label.trim()) {
          new Notice("Label cannot be empty");
          return;
        }
        if (this.target.type === "folder" && !this.target.path.trim()) {
          new Notice("Folder path required");
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
  }

  updatePreview() {
    if (!this.previewDiv) return;

    try {
      // @ts-ignore
      const dateString = window.moment().format(
        this.target.dateFormat || "YYYY-MM-DD"
      );

      const pattern = this.target.filenamePattern || "{{date}}";
      const filename = pattern.replace("{{date}}", dateString);

      this.previewDiv.empty();
      this.previewDiv.createEl("small", { text: "Preview filename:" });
      this.previewDiv.createEl("div", {
        cls: "quick-note-preview-code",
        text: `${filename}.md`,
      });

    } catch {
      this.previewDiv.setText("Invalid format");
    }
  }

  onClose() {
    this.contentEl.empty();
  }
}
