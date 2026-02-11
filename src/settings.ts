import { App, PluginSettingTab, Setting, Notice } from "obsidian";
import QuickNotePlugin from "./main";
import { TargetType } from "./types";

export class QuickNoteSettingTab extends PluginSettingTab {
  plugin: QuickNotePlugin;

  constructor(app: App, plugin: QuickNotePlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();

    containerEl.createEl("h2", { text: "Quick Note Targets" });

    // --- General Settings ---
    new Setting(containerEl)
      .setName("Show Icon in Header")
      .setDesc(
        "Toggle the top-right icon in tab headers. (Requires reload/reopen tabs to hide)",
      )
      .addToggle((toggle) =>
        toggle
          .setValue(this.plugin.settings.showInHeader)
          .onChange(async (value) => {
            this.plugin.settings.showInHeader = value;
            await this.plugin.saveSettings();
            this.plugin.refreshHeaderIcons();
          }),
      );

    containerEl.createEl("hr");

    // --- Target List ---
    this.plugin.settings.targets.forEach((target, index) => {
      const div = containerEl.createDiv({ cls: "quick-note-target-setting" });

      // Header & Delete
      new Setting(div)
        .setName(`Option ${index + 1}: ${target.label}`)
        .setHeading()
        .addExtraButton((btn) =>
          btn
            .setIcon("trash")
            .setTooltip("Delete Option")
            .onClick(async () => {
              this.plugin.settings.targets.splice(index, 1);
              await this.plugin.saveSettings();
              this.display();
            }),
        );

      // Label
      new Setting(div).setName("Menu Label").addText((text) =>
        text.setValue(target.label).onChange(async (value) => {
          target.label = value;
          await this.plugin.saveSettings();
        }),
      );

      // Type
      new Setting(div).setName("Type").addDropdown((drop) =>
        drop
          .addOption("folder", "Specific Folder")
          .addOption("current-folder", "Current Folder")
          .addOption("daily-note", "Daily Note")
          .setValue(target.type)
          .onChange(async (value) => {
            target.type = value as TargetType;
            this.display(); // Refresh to update fields
            await this.plugin.saveSettings();
          }),
      );

      // Conditional: Path
      if (target.type === "folder") {
        new Setting(div)
          .setName("Folder Path")
          .setDesc("Example: Inbox/ or Projects/Active")
          .addText((text) =>
            text.setValue(target.path).onChange(async (value) => {
              target.path = value;
              await this.plugin.saveSettings();
            }),
          );
      }

      // ... inside the settings loop in display() ...

      // Conditional: Filename Settings (Split into Prefix + Date)
      if (target.type !== "daily-note") {
        // 1. Text Prefix
        new Setting(div)
          .setName("Filename Prefix")
          .setDesc('Fixed text at start. e.g. "Inbox Note "')
          .addText((text) =>
            text.setValue(target.prefix).onChange(async (value) => {
              target.prefix = value;
              await this.plugin.saveSettings();
            }),
          );

        // 2. Date Format
        new Setting(div)
          .setName("Date Format")
          .setDesc('Moment.js format. e.g. "YYYY-MM-DD"')
          .addText((text) =>
            text.setValue(target.dateFormat).onChange(async (value) => {
              target.dateFormat = value;
              await this.plugin.saveSettings();
            }),
          );
      }

      // ... rest of file ...
      // Conditional: Filename

      // Open Toggle
      new Setting(div).setName("Open after create").addToggle((toggle) =>
        toggle.setValue(target.openAfterCreate).onChange(async (value) => {
          target.openAfterCreate = value;
          await this.plugin.saveSettings();
        }),
      );

      div.createEl("hr");
    });

// --- Add New Target ---
new Setting(containerEl)
    .addButton(btn => btn
        .setButtonText('Add New Target')
        .setCta()
        .onClick(async () => {
            this.plugin.settings.targets.push({
                id: Date.now().toString(),
                label: 'New Target',
                type: 'folder',
                path: '',
                // FIX: Use the new properties here
                prefix: 'New Note ',
                dateFormat: 'YYYY-MM-DD',
                templatePath: '',
                openAfterCreate: true,
                enabled: true
            });
            await this.plugin.saveSettings();
            this.display();
        }));
    // --- Add New Target ---
  }
}
