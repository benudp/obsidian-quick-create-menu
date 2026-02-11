import { App, TFile, Notice, WorkspaceLeaf, setIcon } from 'obsidian';
// Note: setIcon import needed here too for the menu items
import { NoteTarget, TargetType } from './types';

export class ActionHandler {
    app: App;

    constructor(app: App) {
        this.app = app;
    }

    /**
     * Creates a custom DOM popup positioned relative to the clicked button
     */
    showCustomPopup(event: MouseEvent, anchorBtn: HTMLElement, targets: NoteTarget[]) {
        // 1. Create Container
        const popup = document.body.createDiv({ cls: 'quick-note-popup' });
        
        // 2. Populate Items
        targets.forEach(target => {
            if (!target.enabled) return;
            if (target.type === 'daily-note') {
                // @ts-ignore
                const dailyPlugin = this.app.internalPlugins.plugins['daily-notes'];
                if (dailyPlugin && !dailyPlugin.enabled) return;
            }

            const item = popup.createDiv({ cls: 'quick-note-popup-item' });
            
            // Icon
            const iconSpan = item.createSpan({ cls: 'popup-icon' });
            setIcon(iconSpan, this.getIconForType(target.type));
            
            // Label
            item.createSpan({ text: target.label });

            // Click Handler
            item.addEventListener('click', (e) => {
                e.stopPropagation(); // Prevent triggering the window close listener immediately
                this.executeCreate(target);
                this.closePopup(popup);
            });
        });

        // 3. Position Logic
        const rect = anchorBtn.getBoundingClientRect();
        
        // Basic positioning (Below button, aligned right)
        // You might want to add edge detection logic here for boundaries
        popup.style.top = `${rect.bottom + 5}px`;
        popup.style.right = `${window.innerWidth - rect.right}px`; 
        // Or align left: popup.style.left = `${rect.left}px`;

        // 4. Close on Click Outside
        const closeListener = (e: MouseEvent) => {
            if (!popup.contains(e.target as Node) && e.target !== anchorBtn) {
                this.closePopup(popup);
                document.removeEventListener('click', closeListener);
            }
        };

        // Delay adding listener to avoid immediate close from the triggering click
        setTimeout(() => {
            document.addEventListener('click', closeListener);
        }, 100);
    }

    closePopup(popup: HTMLElement) {
        if (popup && popup.parentElement) {
            popup.remove();
        }
    }

    private getIconForType(type: TargetType): string {
        switch (type) {
            case 'folder': return 'folder';
            case 'current-folder': return 'folder-open';
            case 'daily-note': return 'calendar-with-checkmark';
            default: return 'file';
        }
    }

    async executeCreate(target: NoteTarget) {
        // ... (Same creation logic as before) ...
        // Ensure you use (window as any).moment() if not importing moment
        
        if (target.type === 'daily-note') {
            // @ts-ignore
            this.app.commands.executeCommandById('daily-notes:goto-today');
            return;
        }

        let folderPath = '';
        if (target.type === 'folder') {
            folderPath = target.path || '/';
        } else if (target.type === 'current-folder') {
            const activeFile = this.app.workspace.getActiveFile();
            if (activeFile && activeFile.parent) {
                folderPath = activeFile.parent.path;
            } else {
                folderPath = '/';
            }
        }

        const folderExists = this.app.vault.getAbstractFileByPath(folderPath);
        if (!folderExists) {
            try {
                await this.app.vault.createFolder(folderPath);
            } catch (e) {
                new Notice(`Error creating folder: ${folderPath}`);
                return;
            }
        }

        const prefix = target.prefix || '';
        const dateFormat = target.dateFormat || 'YYYY-MM-DD';
        

        // @ts-ignore
        const dateString = window.moment().format(dateFormat);
        
        const filenameBase = `${prefix}${dateString}`.trim(); // Combine them

        let filename = `${filenameBase}.md`;
        
        let fullPath = `${folderPath}/${filename}`.replace('//', '/');

        let counter = 1;
        while (this.app.vault.getAbstractFileByPath(fullPath)) {
            filename = `${filenameBase} (${counter}).md`;
            fullPath = `${folderPath}/${filename}`.replace('//', '/');
            counter++;
        }

        let content = '';
        if (target.templatePath) {
            const templateFile = this.app.vault.getAbstractFileByPath(target.templatePath);
            if (templateFile instanceof TFile) {
                content = await this.app.vault.read(templateFile);
            }
        }

        const newFile = await this.app.vault.create(fullPath, content);

        if (target.openAfterCreate) {
            const leafToOpen = this.app.workspace.getLeaf(false);
            await leafToOpen.openFile(newFile);
            // Re-focus
            this.app.workspace.activeLeaf?.view.setEphemeralState({ focus: true });
        }
        
        new Notice(`Created: ${newFile.basename}`);
    }
}
