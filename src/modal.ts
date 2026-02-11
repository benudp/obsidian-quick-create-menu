import { App, Modal, Setting, Notice } from 'obsidian';
import { NoteTarget, TargetType } from './types';

export class TargetEditModal extends Modal {
    target: NoteTarget;
    onSubmit: (target: NoteTarget) => void;
    isNew: boolean;
    previewDiv: HTMLElement | null = null;

    constructor(app: App, target: NoteTarget | null, onSubmit: (target: NoteTarget) => void) {
        super(app);
        this.isNew = target === null;
        this.target = target || {
            id: Date.now().toString(),
            label: 'New Target',
            type: 'folder',
            path: '',
            prefix: 'Note ',
            dateFormat: 'YYYY-MM-DD',
            templatePath: '',
            openAfterCreate: true,
            enabled: true
        };
        this.onSubmit = onSubmit;
    }

    onOpen() {
        const { contentEl } = this;
        contentEl.empty();

        contentEl.createEl('h2', { text: this.isNew ? 'Add New Target' : 'Edit Target' });

        // Label
        new Setting(contentEl)
            .setName('Label')
            .addText(text => text
                .setValue(this.target.label)
                .setPlaceholder('My Notes')
                .onChange(value => {
                    this.target.label = value;
                })
            );

        // Type
        new Setting(contentEl)
            .setName('Type')
            .addDropdown(drop => drop
                .addOption('folder', 'Specific Folder')
                .addOption('current-folder', 'Current Folder')
                .addOption('daily-note', 'Daily Note')
                .setValue(this.target.type)
                .onChange(value => {
                    this.target.type = value as TargetType;
                    this.refreshConditionalSettings();
                })
            );

        // Create container for conditional settings
        const conditionalContainer = contentEl.createDiv({ cls: 'quick-note-conditional-settings' });
        this.conditionalContainer = conditionalContainer;
        this.refreshConditionalSettings();

        // Template Path
        new Setting(contentEl)
            .setName('Template')
            .setDesc('Optional template file path')
            .addText(text => text
                .setValue(this.target.templatePath)
                .setPlaceholder('Templates/Note.md')
                .onChange(value => {
                    this.target.templatePath = value;
                })
            );

        // Enabled
        new Setting(contentEl)
            .setName('Enabled')
            .addToggle(toggle => toggle
                .setValue(this.target.enabled)
                .onChange(value => {
                    this.target.enabled = value;
                })
            );

        // Buttons
        new Setting(contentEl)
            .addButton(btn => btn
                .setButtonText('Cancel')
                .onClick(() => {
                    this.close();
                })
            )
            .addButton(btn => btn
                .setButtonText(this.isNew ? 'Add' : 'Save')
                .setCta()
                .onClick(() => {
                    if (!this.target.label.trim()) {
                        new Notice('Label cannot be empty');
                        return;
                    }
                    if (this.target.type === 'folder' && !this.target.path.trim()) {
                        new Notice('Folder path cannot be empty for folder type');
                        return;
                    }
                    this.onSubmit(this.target);
                    this.close();
                })
            );
    }

    conditionalContainer: HTMLElement;

    refreshConditionalSettings() {
        this.conditionalContainer.empty();
        this.previewDiv = null;

        // Folder Path (only for folder type)
        if (this.target.type === 'folder') {
            new Setting(this.conditionalContainer)
                .setName('Folder Path')
                .addText(text => text
                    .setValue(this.target.path)
                    .setPlaceholder('Inbox')
                    .onChange(value => {
                        this.target.path = value;
                    })
                );
        }

        // Filename settings (not for daily notes)
        if (this.target.type !== 'daily-note') {
            new Setting(this.conditionalContainer)
                .setName('Filename Prefix')
                .addText(text => text
                    .setValue(this.target.prefix)
                    .setPlaceholder('Note ')
                    .onChange(value => {
                        this.target.prefix = value;
                        this.updatePreview();
                    })
                );

            new Setting(this.conditionalContainer)
                .setName('Date Format')
                .setDesc('Moment.js format (YYYY-MM-DD, YYYY-MM-DD HHmm, etc.)')
                .addText(text => text
                    .setValue(this.target.dateFormat)
                    .setPlaceholder('YYYY-MM-DD')
                    .onChange(value => {
                        this.target.dateFormat = value;
                        this.updatePreview();
                    })
                );

            // Preview
            this.previewDiv = this.conditionalContainer.createDiv({ cls: 'quick-note-preview' });
            this.updatePreview();
        }
    }

    updatePreview() {
        if (!this.previewDiv) return;

        try {
            // @ts-ignore
            const dateString = window.moment().format(this.target.dateFormat || 'YYYY-MM-DD');
            const filenamePreview = `${this.target.prefix}${dateString}.md`;
            this.previewDiv.innerHTML = `<strong>Preview:</strong> <code>${filenamePreview}</code>`;
        } catch (e) {
            this.previewDiv.innerHTML = '<strong>Preview:</strong> <span style="color: var(--text-error);">Invalid date format</span>';
        }
    }

    onClose() {
        const { contentEl } = this;
        contentEl.empty();
    }
}
