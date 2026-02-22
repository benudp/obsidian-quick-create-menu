import { App, AbstractInputSuggest, TFolder } from "obsidian";

export class FolderSuggest extends AbstractInputSuggest<TFolder> {
  textInputEl: HTMLInputElement;

  constructor(app: App, textInputEl: HTMLInputElement) {
    super(app, textInputEl);
    this.textInputEl = textInputEl;
  }

  getSuggestions(query: string): TFolder[] {
    const lowerCaseQuery = query.toLowerCase();
    const folders = this.app.vault
      .getAllLoadedFiles()
      .filter((p): p is TFolder => p instanceof TFolder);

    return folders.filter((folder) =>
      folder.path.toLowerCase().contains(lowerCaseQuery),
    );
  }

  renderSuggestion(folder: TFolder, el: HTMLElement): void {
    el.setText(folder.path);
  }

  selectSuggestion(folder: TFolder): void {
    this.textInputEl.value = folder.path;
    this.textInputEl.trigger("input");
    this.close();
  }
}
