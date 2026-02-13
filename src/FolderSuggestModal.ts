import { App, AbstractInputSuggest, TFolder } from 'obsidian';

export class FolderSuggest extends AbstractInputSuggest<TFolder> {
    textInputEl: HTMLInputElement;

    constructor(app: App, textInputEl: HTMLInputElement) {
        super(app, textInputEl);
        this.textInputEl = textInputEl;
    }

    getSuggestions(query: string): TFolder[] {
        const lowerCaseQuery = query.toLowerCase();
        
        // Get all loaded files and filter for Folders
        const folders = this.app.vault.getAllLoadedFiles()
            .filter((p): p is TFolder => p instanceof TFolder);

        // Return all folders if query is empty, otherwise filter by path
        return folders.filter(folder => 
            folder.path.toLowerCase().contains(lowerCaseQuery)
        );
    }

    renderSuggestion(folder: TFolder, el: HTMLElement): void {
        el.setText(folder.path);
    }

    selectSuggestion(folder: TFolder): void {
        // Update the input value
        this.textInputEl.value = folder.path;
        // Trigger the input event manually so Obsidian knows the value changed
        this.textInputEl.trigger("input");
        // Close the suggestion box
        this.close();
    }
}
