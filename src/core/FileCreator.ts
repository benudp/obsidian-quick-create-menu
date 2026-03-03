import { App, TFile, Notice } from "obsidian";
import { NoteTarget } from "../types";

export class FileCreator {
  app: App;

  constructor(app: App) {
    this.app = app;
  }

  async executeCreate(target: NoteTarget) {
    // 1. Handle Obsidian Commands
    if (target.type === "obsidian-command") {
      if (target.commandId) {
        // @ts-ignore - Internal command API
        this.app.commands.executeCommandById(target.commandId);
      } else {
        new Notice("No command ID specified for this target.");
      }
      return;
    }

    // 2. Handle File Creation
    let folderPath = "";
    if (target.type === "folder") {
      folderPath = target.path || "";
    } else if (target.type === "current-folder") {
      const activeFile = this.app.workspace.getActiveFile();
      if (activeFile && activeFile.parent && activeFile.parent.path !== "/") {
        folderPath = activeFile.parent.path;
      }
    }

    // Clean up folderPath just in case it's literally "/"
    if (folderPath === "/") folderPath = "";

    if (folderPath) {
      const folderExists = this.app.vault.getAbstractFileByPath(folderPath);
      if (!folderExists) {
        try {
          await this.app.vault.createFolder(folderPath);
        } catch (e) {
          new Notice(`Error creating folder: ${folderPath}`);
          return;
        }
      }
    }

    const dateFormat = target.dateFormat || "YYYY-MM-DD";
    const dateString = (window as any).moment().format(dateFormat);

    let pattern = target.filenamePattern;
    if (!pattern) {
      const oldPrefix = (target as any).prefix || "";
      pattern = `${oldPrefix}{{date}}`;
    }

    // Replace date and sanitize the file name to remove illegal characters (\ / : * ? < > " |)
    let filenameBase = pattern.replace("{{date}}", dateString).trim();
    filenameBase = filenameBase.replace(/[\\/:*?"<>|]/g, "-"); // Replaces illegal chars with a hyphen

    let filename = `${filenameBase}.md`;

    let fullPath = folderPath ? `${folderPath}/${filename}` : filename;

    let counter = 1;
    while (this.app.vault.getAbstractFileByPath(fullPath)) {
      filename = `${filenameBase} (${counter}).md`;
      fullPath = folderPath ? `${folderPath}/${filename}` : filename;
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

    try {
      const newFile = await this.app.vault.create(fullPath, content);

      // Always open the newly created file
      const leafToOpen = this.app.workspace.getLeaf(false);
      await leafToOpen.openFile(newFile);
      this.app.workspace.activeLeaf?.view.setEphemeralState({ focus: true });

      new Notice(`Created: ${newFile.basename}`);
    } catch (error) {
      new Notice(`Failed to create note: ${error.message}`);
      console.error(error);
    }
  }
}
