import { App, TFile, Notice } from "obsidian";
import { NoteTarget } from "../types";

export class FileCreator {
  app: App;

  constructor(app: App) {
    this.app = app;
  }

  async executeCreate(target: NoteTarget) {
    if (target.type === "daily-note") {
      // @ts-ignore - Internal command
      this.app.commands.executeCommandById("daily-notes:goto-today");
      return;
    }

    let folderPath = "";
    if (target.type === "folder") {
      folderPath = target.path || "/";
    } else if (target.type === "current-folder") {
      const activeFile = this.app.workspace.getActiveFile();
      if (activeFile && activeFile.parent) {
        folderPath = activeFile.parent.path;
      } else {
        folderPath = "/";
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
    const dateFormat = target.dateFormat || "YYYY-MM-DD";
    const dateString = (window as any).moment().format(dateFormat);

    let pattern = target.filenamePattern;

    // If pattern is missing (legacy data), construct it from the old prefix
    if (!pattern) {
      const oldPrefix = (target as any).prefix || "";
      pattern = `${oldPrefix}{{date}}`;
    }

    // Generate final filename
    const filenameBase = pattern.replace("{{date}}", dateString).trim();
    let filename = `${filenameBase}.md`;

    let fullPath = `${folderPath}/${filename}`.replace("//", "/");

    let counter = 1;
    while (this.app.vault.getAbstractFileByPath(fullPath)) {
      filename = `${filenameBase} (${counter}).md`;
      fullPath = `${folderPath}/${filename}`.replace("//", "/");
      counter++;
    }

    let content = "";
    if (target.templatePath) {
      const templateFile = this.app.vault.getAbstractFileByPath(
        target.templatePath,
      );
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
