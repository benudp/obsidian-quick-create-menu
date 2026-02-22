import { App, Modal, getIconIds, setIcon, setTooltip } from "obsidian";

export class IconSuggestModal extends Modal {
  onChoose: (icon: string) => void;
  allIcons: string[];
  searchInput: HTMLInputElement;
  gridContainer: HTMLElement;

  constructor(app: App, onChoose: (icon: string) => void) {
    super(app);
    this.onChoose = onChoose;
    this.allIcons = getIconIds();
  }

  onOpen() {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.addClass("icon-picker-modal");
    this.setTitle("Choose an Icon");

    const searchContainer = contentEl.createDiv("icon-picker-search-container");
    this.searchInput = searchContainer.createEl("input", {
      type: "text",
      placeholder: "Search icons...",
      cls: "icon-picker-search",
    });

    this.searchInput.addEventListener("input", () => {
      this.filterIcons(this.searchInput.value);
    });

    this.gridContainer = contentEl.createDiv("icon-picker-grid");
    this.renderIcons(this.allIcons);
    this.searchInput.focus();
  }

  filterIcons(query: string) {
    const lowerQuery = query.toLowerCase();
    const filtered = this.allIcons.filter((icon) =>
      icon.toLowerCase().includes(lowerQuery),
    );
    this.renderIcons(filtered);
  }

  renderIcons(icons: string[]) {
    this.gridContainer.empty();
    if (icons.length === 0) {
      this.gridContainer.createDiv({
        cls: "icon-picker-empty",
        text: "No icons found",
      });
      return;
    }

    icons.forEach((iconId) => {
      const iconButton = this.gridContainer.createDiv("icon-picker-item");
      const iconEl = iconButton.createDiv("icon-picker-item-icon");
      setIcon(iconEl, iconId);
      setTooltip(iconButton, iconId);

      iconButton.addEventListener("click", () => {
        this.onChoose(iconId);
        this.close();
      });

      iconButton.setAttribute("tabindex", "0");
      iconButton.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          this.onChoose(iconId);
          this.close();
        }
      });
    });
  }

  onClose() {
    this.contentEl.empty();
  }
}
