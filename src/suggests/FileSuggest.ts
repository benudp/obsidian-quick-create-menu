import { App, AbstractInputSuggest, TFile } from "obsidian";

export class FileSuggest extends AbstractInputSuggest<TFile> {
  textInputEl: HTMLInputElement;

  constructor(app: App, textInputEl: HTMLInputElement) {
    super(app, textInputEl);
    this.textInputEl = textInputEl;
  }

  getSuggestions(query: string): TFile[] {
    const lowerCaseQuery = query.toLowerCase();
    const files = this.app.vault.getMarkdownFiles();

    return files.filter((file) =>
      file.path.toLowerCase().contains(lowerCaseQuery),
    );
  }

  renderSuggestion(file: TFile, el: HTMLElement): void {
    el.setText(file.path);
  }

  selectSuggestion(file: TFile): void {
    this.textInputEl.value = file.path;
    this.textInputEl.trigger("input");
    this.close();
  }
}
