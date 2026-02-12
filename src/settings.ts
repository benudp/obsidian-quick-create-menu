import { App, PluginSettingTab, Setting, Notice, setIcon } from "obsidian";
import QuickNotePlugin from "./main";
import { TargetEditModal } from "./modal";
import Sortable from "sortablejs";

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
      .setDesc("Toggle the + icon in tab headers.")
      .addToggle((toggle) =>
        toggle
          .setValue(this.plugin.settings.showInHeader)
          .onChange(async (value) => {
            this.plugin.settings.showInHeader = value;
            await this.plugin.saveSettings();
            this.plugin.refreshHeaderIcons();
          })
      );

    // --- Targets Header ---
    containerEl.createEl("h3", { text: "Quick Create Targets" });

    new Setting(containerEl)
      .setName("Manage Targets")
      .setDesc("Drag to reorder. These appear in your quick menu.")
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
          })
      );

    // --- Target List ---
    const listContainer = containerEl.createDiv({ cls: "quick-note-list" });

    // SortableJS Init
    Sortable.create(listContainer, {
      handle: ".quick-note-drag-handle",
      animation: 150,
      ghostClass: "quick-note-ghost",
      dragClass: "quick-note-drag",
      touchStartThreshold: 3,
      onEnd: async (evt) => {
        const { oldIndex, newIndex } = evt;
        if (oldIndex !== undefined && newIndex !== undefined && oldIndex !== newIndex) {
          const targets = this.plugin.settings.targets;
          const [item] = targets.splice(oldIndex, 1);
          targets.splice(newIndex, 0, item);
          await this.plugin.saveSettings();
          new Notice("Reordered targets");
        }
      },
    });

    if (this.plugin.settings.targets.length === 0) {
      listContainer.createDiv({ cls: "quick-note-empty-state", text: "No targets configured yet." });
      return;
    }

    this.plugin.settings.targets.forEach((target, index) => {
      const setting = new Setting(listContainer);
      setting.settingEl.addClass("quick-note-item");
      setting.settingEl.dataset.index = index.toString();

      // 1. Create Drag Handle (PREPENDED independently)
      // This places it outside the text flow, allowing vertical centering
      const dragHandle = createDiv({ cls: "quick-note-drag-handle" });
      setIcon(dragHandle, "grip-vertical");
      setting.settingEl.prepend(dragHandle);

      // 2. Name Section (Icon + Label)
      const nameContainer = createDiv({ cls: "quick-note-name-container" });
      const iconSpan = nameContainer.createSpan({ cls: "quick-note-setting-icon" });
      setIcon(iconSpan, this.getIconForType(target.type));
      
      const labelSpan = nameContainer.createSpan({ cls: "quick-note-label-text" });
      labelSpan.setText(target.label);
      labelSpan.title = target.label; // Tooltip for full text
      
      // FIX: Append directly to nameEl to avoid type error
      setting.nameEl.appendChild(nameContainer);

      // 3. Description Section (Preview)
      const previewText = this.getPreviewText(target);
      setting.setDesc(previewText);

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
          })
      );

      // Delete Button
      setting.addExtraButton((btn) => {
        btn
          .setIcon("trash")
          .setTooltip("Delete")
          .onClick(async () => {
            this.plugin.settings.targets.splice(index, 1);
            await this.plugin.saveSettings();
            this.display();
          });
        btn.extraSettingsEl.addClass("quick-note-delete-btn");
      });

      // Toggle
      setting.addToggle((toggle) =>
        toggle
          .setValue(target.enabled)
          .setTooltip("Enable/Disable")
          .onChange(async (val) => {
            target.enabled = val;
            await this.plugin.saveSettings();
            setting.settingEl.toggleClass("is-disabled", !val);
          })
      );

      if (!target.enabled) {
        setting.settingEl.addClass("is-disabled");
      }
    });
  }

  getIconForType(type: string): string {
    switch (type) {
      case "folder": return "folder";
      case "current-folder": return "folder-open";
      case "daily-note": return "calendar-days";
      default: return "file";
    }
  }

  getPreviewText(target: any): string {
    try {
      if (target.type === "daily-note") return "Daily Note";
      // @ts-ignore
      const dateStr = window.moment().format(target.dateFormat || "YYYY-MM-DD");
      const pathPrefix = target.type === "folder" ? `${target.path}/` : "./";
      return `${pathPrefix}${target.prefix || ""}${dateStr}.md`;
    } catch (e) {
      return "Invalid Format";
    }
  }
}
