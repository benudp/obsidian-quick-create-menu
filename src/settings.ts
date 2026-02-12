import { App, PluginSettingTab, Setting, Notice, setIcon, Menu } from "obsidian";
import QuickNotePlugin from "./main";
import { NoteTarget } from "./types";
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

    const cardsContainer = containerEl.createDiv({ cls: "quick-note-cards" });

    this.plugin.settings.targets.forEach((target, index) => {
      const card = cardsContainer.createDiv({ 
        cls: `quick-note-card ${!target.enabled ? 'quick-note-card-disabled' : ''}`
      });

      // Card content (tappable)
      const cardContent = card.createDiv({ cls: "quick-note-card-content" });
      
      // Left: Icon and Label
      const leftSection = cardContent.createDiv({ cls: "quick-note-card-left" });
      
      const iconSpan = leftSection.createSpan({ cls: "quick-note-card-icon" });
      const iconName = this.getIconForType(target.type);
      setIcon(iconSpan, iconName);
      
      const labelSpan = leftSection.createSpan({ cls: "quick-note-card-label" });
      labelSpan.setText(target.label);

      // Right: Menu button
      const rightSection = cardContent.createDiv({ cls: "quick-note-card-right" });
      
      const menuButton = rightSection.createEl("button", { 
        cls: "quick-note-card-menu-btn"
      });
      menuButton.innerHTML = "⋯";
      menuButton.setAttribute("aria-label", "Options");
      
      // Context menu
      menuButton.addEventListener("click", (e) => {
        e.stopPropagation();
        this.showTargetMenu(target, index, menuButton);
      });

      // Make whole card tappable for edit
      cardContent.addEventListener("click", () => {
        new TargetEditModal(this.app, { ...target }, async (updated) => {
          this.plugin.settings.targets[index] = updated;
          await this.plugin.saveSettings();
          this.display();
          new Notice(`Updated "${updated.label}"`);
        }).open();
      });

      // Subtitle with preview
      const subtitle = card.createDiv({ cls: "quick-note-card-subtitle" });
      const previewText = this.getPreviewText(target);
      subtitle.setText(previewText);
    });
  }

  showTargetMenu(target: NoteTarget, index: number, buttonEl: HTMLElement) {
    const menu = new Menu();

    // Toggle enabled
    menu.addItem((item) => {
      item
        .setTitle(target.enabled ? "Disable" : "Enable")
        .setIcon(target.enabled ? "x" : "check")
        .onClick(async () => {
          target.enabled = !target.enabled;
          await this.plugin.saveSettings();
          this.display();
          new Notice(`${target.enabled ? 'Enabled' : 'Disabled'} "${target.label}"`);
        });
    });

    menu.addSeparator();

    // Move up
    if (index > 0) {
      menu.addItem((item) => {
        item
          .setTitle("Move Up")
          .setIcon("arrow-up")
          .onClick(async () => {
            const temp = this.plugin.settings.targets[index];
            this.plugin.settings.targets[index] = this.plugin.settings.targets[index - 1];
            this.plugin.settings.targets[index - 1] = temp;
            await this.plugin.saveSettings();
            this.display();
          });
      });
    }

    // Move down
    if (index < this.plugin.settings.targets.length - 1) {
      menu.addItem((item) => {
        item
          .setTitle("Move Down")
          .setIcon("arrow-down")
          .onClick(async () => {
            const temp = this.plugin.settings.targets[index];
            this.plugin.settings.targets[index] = this.plugin.settings.targets[index + 1];
            this.plugin.settings.targets[index + 1] = temp;
            await this.plugin.saveSettings();
            this.display();
          });
      });
    }

    menu.addSeparator();

    // Duplicate
    menu.addItem((item) => {
      item
        .setTitle("Duplicate")
        .setIcon("copy")
        .onClick(async () => {
          const duplicate = {
            ...target,
            id: Date.now().toString(),
            label: `${target.label} (Copy)`
          };
          this.plugin.settings.targets.splice(index + 1, 0, duplicate);
          await this.plugin.saveSettings();
          this.display();
          new Notice(`Duplicated "${target.label}"`);
        });
    });

    // Delete
    menu.addItem((item) => {
      item
        .setTitle("Delete")
        .setIcon("trash")
        .onClick(async () => {
          this.plugin.settings.targets.splice(index, 1);
          await this.plugin.saveSettings();
          this.display();
          new Notice(`Deleted "${target.label}"`);
        });
    });

    menu.showAtMouseEvent(buttonEl.getBoundingClientRect() as any);
  }

  getIconForType(type: string): string {
    switch (type) {
      case 'folder': return 'folder';
      case 'current-folder': return 'folder-open';
      case 'daily-note': return 'calendar-days';
      default: return 'file';
    }
  }

  getPreviewText(target: NoteTarget): string {
    try {
      if (target.type === 'daily-note') {
        return 'Opens today\'s daily note';
      }
      
      // @ts-ignore
      const dateStr = window.moment().format(target.dateFormat || 'YYYY-MM-DD');
      const filename = `${target.prefix || ''}${dateStr}.md`;
      
      if (target.type === 'folder') {
        return target.path ? `${target.path}/${filename}` : filename;
      } else {
        return `${filename} in current folder`;
      }
    } catch (e) {
      return 'Invalid format';
    }
  }
}
