export type TargetType = "folder" | "current-folder" | "obsidian-command";

export interface NoteTarget {
  id: string;
  label: string;
  type: TargetType;

  // Visuals
  icon: string;
  color: string;

  // System flags
  isSystem?: boolean;

  // Paths & Patterns
  path: string;
  filenamePattern: string;
  dateFormat: string;

  templatePath: string;
  enabled: boolean;

  // Commands
  commandId?: string;
}

export interface QuickNoteSettings {
  targets: NoteTarget[];
  showInHeader: boolean;
}

export const DEFAULT_SETTINGS: QuickNoteSettings = {
  showInHeader: true,
  targets: [
    {
      id: "system-daily",
      label: "Today's Daily Note",
      type: "obsidian-command",
      icon: "calendar-days",
      color: "",
      isSystem: true,
      path: "",
      filenamePattern: "",
      dateFormat: "",
      templatePath: "",
      enabled: true,
      commandId: "daily-notes:goto-today",
    },
    {
      id: "system-current",
      label: "Current Folder Note",
      type: "current-folder",
      icon: "folder-open",
      color: "",
      isSystem: true,
      path: "",
      filenamePattern: "Note - {{date}}",
      dateFormat: "YYYY-MM-DD",
      templatePath: "",
      enabled: true,
    },
    {
      id: "1",
      label: "Inbox",
      type: "folder",
      icon: "inbox",
      color: "",
      isSystem: false,
      path: "Inbox",
      filenamePattern: "Inbox - {{date}}",
      dateFormat: "YYYY-MM-DD HHmm",
      templatePath: "",
      enabled: true,
    },
  ],
};
