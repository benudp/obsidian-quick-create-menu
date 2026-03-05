import { App, PluginSettingTab, Setting, Notice, setIcon } from "obsidian";
import QuickNotePlugin from "../main";
import { TargetEditModal } from "../modals/TargetEditModal";
import { NoteTarget } from "../types";
import Sortable from "sortablejs";
import { ConfirmDeleteModal } from "src/modals/ConfirmDeleteModal";

export class QuickNoteSettingTab extends PluginSettingTab {
  plugin: QuickNotePlugin;

  constructor(app: App, plugin: QuickNotePlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();

    containerEl.createEl("h2", { text: "Quick Note Settings" });

    // --- General Settings ---
    new Setting(containerEl)
      .setName("Show Icon in Header")
      .addToggle((toggle) =>
        toggle
          .setValue(this.plugin.settings.showInHeader)
          .onChange(async (value) => {
            this.plugin.settings.showInHeader = value;
            await this.plugin.saveSettings();
            this.plugin.refreshHeaderIcons();
          }),
      );

    // --- Targets Header ---
    containerEl.createEl("h3", { text: "Quick Create Targets" });

    new Setting(containerEl)
      .setName("Manage Targets")
      .setDesc("Drag to reorder.")
      .addButton((btn) =>
        btn
          .setButtonText("Add New Target")
          .setCta()
          .onClick(() => {
            new TargetEditModal(this.app, null, async (target) => {
              this.plugin.settings.targets.push(target);
              await this.plugin.saveSettings();
              this.display();
              new Notice(`Added "${target.label}"`);
            }).open();
          }),
      );

    // --- Target List ---
    const listContainer = containerEl.createDiv({ cls: "quick-note-list" });

    Sortable.create(listContainer, {
      handle: ".quick-note-drag-handle",
      animation: 150,
      ghostClass: "quick-note-ghost",
      dragClass: "quick-note-drag",
      touchStartThreshold: 3,
      onEnd: async (evt) => {
        const { oldIndex, newIndex } = evt;
        if (
          oldIndex !== undefined &&
          newIndex !== undefined &&
          oldIndex !== newIndex
        ) {
          const targets = this.plugin.settings.targets;
          const [item] = targets.splice(oldIndex, 1);
          targets.splice(newIndex, 0, item);
          await this.plugin.saveSettings();
          new Notice("Reordered targets");
        }
      },
    });

    if (this.plugin.settings.targets.length === 0) {
      listContainer.createDiv({
        cls: "quick-note-empty-state",
        text: "No targets configured yet.",
      });
      return;
    }

    this.plugin.settings.targets.forEach((target, index) => {
      const setting = new Setting(listContainer);
      setting.settingEl.addClass("quick-note-item");

      // 1. Drag Handle
      const dragHandle = createDiv({ cls: "quick-note-drag-handle" });
      setIcon(dragHandle, "grip-vertical");
      setting.settingEl.prepend(dragHandle);

      // 2. Name & Icon
      const nameContainer = createDiv({ cls: "quick-note-name-container" });
      const iconSpan = nameContainer.createSpan({
        cls: "quick-note-setting-icon",
      });
      setIcon(iconSpan, target.icon || "file");
      if (target.color) iconSpan.style.color = target.color;

      const labelSpan = nameContainer.createSpan({
        cls: "quick-note-label-text",
      });
      labelSpan.setText(target.label);
      if (target.color) labelSpan.style.color = target.color;
      setting.nameEl.appendChild(nameContainer);

      // 3. Description
      setting.setDesc(this.getPreviewText(target));

      // 4. Actions
      setting.addExtraButton((btn) =>
        btn
          .setIcon("pencil")
          .setTooltip("Edit")
          .onClick(() => {
            new TargetEditModal(this.app, { ...target }, async (updated) => {
              this.plugin.settings.targets[index] = updated;
              await this.plugin.saveSettings();
              this.display();
            }).open();
          }),
      );

      if (!target.isSystem) {
        setting.addExtraButton((btn) => {
          btn
            .setIcon("trash")
            .setTooltip("Delete")
            .onClick(() => {
              new ConfirmDeleteModal(this.app, target.label, async () => {
                this.plugin.settings.targets.splice(index, 1);
                await this.plugin.saveSettings();
                this.display();
                new Notice(`Deleted "${target.label}"`);
              }).open();
            });
          btn.extraSettingsEl.addClass("quick-note-delete-btn");
        });
      } else {
        const spacer = setting.controlEl.createDiv({
          cls: "quick-note-btn-spacer",
        });
        spacer.style.width = "28px";
      }

      setting.addToggle((toggle) =>
        toggle
          .setValue(target.enabled)
          .setTooltip("Enable/Disable")
          .onChange(async (val) => {
            target.enabled = val;
            await this.plugin.saveSettings();
            setting.settingEl.toggleClass("is-disabled", !val);
          }),
      );

      if (!target.enabled) setting.settingEl.addClass("is-disabled");
    });
  }

  getPreviewText(target: NoteTarget): string {
    if (target.type === "obsidian-command")
      return `Command: ${target.commandId || "None"}`;
    const pattern = target.filenamePattern || "{{date}}";
    return target.type === "folder"
      ? `${target.path}/${pattern}.md`
      : `./${pattern}.md`;
  }
}
