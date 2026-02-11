import { App, PluginSettingTab, Setting, Notice, setIcon } from "obsidian";
import QuickNotePlugin from "./main";
import { TargetType } from "./types";
import { TargetEditModal } from "./modal";

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
      .setDesc("Create and reorder your note generation targets.")
      .addButton((btn) =>
        btn
          .setButtonText("Add New Target")
          .setCta()
          .onClick(() => {
            new TargetEditModal(this.app, null, async (target) => {
              this.plugin.settings.targets.push(target);
              await this.plugin.saveSettings();
              this.display();
            }).open();
          })
      );

    // --- Target List ---
    const listContainer = containerEl.createDiv({ cls: "quick-note-list" });

    if (this.plugin.settings.targets.length === 0) {
      const empty = listContainer.createDiv({ cls: "quick-note-empty-state" });
      empty.setText("No targets configured yet.");
      return;
    }

    this.plugin.settings.targets.forEach((target, index) => {
      const setting = new Setting(listContainer);

      // 1. Logic to determine Icon and Preview Text
      let iconName = "folder";
      let previewText = "";
      
      // Calculate preview string
      try {
        // @ts-ignore
        const dateStr = window.moment().format(target.dateFormat || 'YYYY-MM-DD');
        if (target.type === 'daily-note') {
            iconName = "calendar-days";
            previewText = "Daily Note (System Default)";
        } else {
            iconName = target.type === 'current-folder' ? "folder-open" : "folder";
            const pathPrefix = target.type === 'folder' ? `${target.path}/` : './';
            previewText = `${pathPrefix}${target.prefix || ''}${dateStr}.md`;
        }
      } catch (e) { previewText = "Invalid Format"; }

      // 2. Set Name (Label) and Description (Preview)
      setting.setName(target.label);
      
      // Inject icon before the name
      const iconSpan = createSpan({ cls: "quick-note-setting-icon" });
      setIcon(iconSpan, iconName);
      setting.nameEl.prepend(iconSpan);

      // Set Description with custom class
      const descEl = document.createDocumentFragment();
      const code = descEl.createEl("code", { text: previewText, cls: "quick-note-preview-text" });
      setting.setDesc(descEl);

      // 3. Action Buttons (Reorder, Edit, Delete)
      
      // Move Up
      setting.addExtraButton(btn => {
        btn.setIcon("arrow-up")
           .setTooltip("Move Up")
           .setDisabled(index === 0)
           .onClick(async () => {
             if (index === 0) return;
             const temp = this.plugin.settings.targets[index];
             this.plugin.settings.targets[index] = this.plugin.settings.targets[index - 1];
             this.plugin.settings.targets[index - 1] = temp;
             await this.plugin.saveSettings();
             this.display();
           });
        // Hide visually if disabled to keep alignment clean
        if (index === 0) btn.extraSettingsEl.style.opacity = "0.3";
      });

      // Move Down
      setting.addExtraButton(btn => {
        btn.setIcon("arrow-down")
           .setTooltip("Move Down")
           .setDisabled(index === this.plugin.settings.targets.length - 1)
           .onClick(async () => {
             if (index === this.plugin.settings.targets.length - 1) return;
             const temp = this.plugin.settings.targets[index];
             this.plugin.settings.targets[index] = this.plugin.settings.targets[index + 1];
             this.plugin.settings.targets[index + 1] = temp;
             await this.plugin.saveSettings();
             this.display();
           });
         if (index === this.plugin.settings.targets.length - 1) btn.extraSettingsEl.style.opacity = "0.3";
      });

      // Edit
      setting.addExtraButton(btn => {
        btn.setIcon("lucide-pencil") // or "pencil" depending on obsidian version
           .setTooltip("Edit")
           .onClick(() => {
             new TargetEditModal(this.app, { ...target }, async (updated) => {
               this.plugin.settings.targets[index] = updated;
               await this.plugin.saveSettings();
               this.display();
             }).open();
           });
      });

      // Delete
      setting.addExtraButton(btn => {
        btn.setIcon("trash")
           .setTooltip("Delete")
           .onClick(async () => {
             this.plugin.settings.targets.splice(index, 1);
             await this.plugin.saveSettings();
             this.display();
           });
        btn.extraSettingsEl.style.color = "var(--text-error)";
      });

      // Toggle (Main Control)
      setting.addToggle(toggle => {
        toggle.setValue(target.enabled)
              .setTooltip("Enable/Disable")
              .onChange(async (val) => {
                target.enabled = val;
                await this.plugin.saveSettings();
                // Optional: Dim the row if disabled
                setting.settingEl.style.opacity = val ? "1" : "0.6";
              });
      });
      
      // Visual styling for disabled state
      if (!target.enabled) {
          setting.settingEl.style.opacity = "0.6";
      }
    });
  }
}
