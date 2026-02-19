import { getAllTags } from "obsidian";

export type TargetType = 'folder' | 'current-folder' | 'daily-note';

export interface NoteTarget {
    id: string;
    label: string;
    type: TargetType;
    
    // Visuals
    icon: string;       // e.g. "file-plus"
    color: string;      // e.g. "var(--color-red)" or "" for default

    // System flags
    isSystem?: boolean; // If true, cannot be deleted

    // Paths & Patterns
    path: string;       // Folder path (ignored for current-folder/daily-note)
    filenamePattern: string; // e.g. "Note - {{date}}"
    dateFormat: string;      // e.g. "YYYY-MM-DD"
    
    templatePath: string;
    openAfterCreate: boolean;
    enabled: boolean;
}

export interface QuickNoteSettings {
    targets: NoteTarget[];
    showInHeader: boolean;
}

export const DEFAULT_SETTINGS: QuickNoteSettings = {
    showInHeader: true,
    targets: [
        {
            id: 'system-daily',
            label: "Today's Daily Note",
            type: 'daily-note',
            icon: 'calendar-days',
            color: '',
            isSystem: true,
            path: '',
            filenamePattern: '', 
            dateFormat: '',
            templatePath: '',
            openAfterCreate: true,
            enabled: true
        },
        {
            id: 'system-current',
            label: 'Current Folder Note',
            type: 'current-folder',
            icon: 'folder-open',
            color: '',
            isSystem: true,
            path: '',
            filenamePattern: 'Note - {{date}}',
            dateFormat: 'YYYY-MM-DD',
            templatePath: '',
            openAfterCreate: true,
            enabled: true
        },
        {
            id: '1',
            label: 'Inbox',
            type: 'folder',
            icon: 'inbox',
            color: '',
            isSystem: false,
            path: 'Inbox',
            filenamePattern: 'Inbox - {{date}}',
            dateFormat: 'YYYY-MM-DD HHmm',
            templatePath: '',
            openAfterCreate: true,
            enabled: true
        }
    ]
};
