export type TargetType = 'folder' | 'current-folder' | 'daily-note';

export interface NoteTarget {
    id: string;
    label: string;
    type: TargetType;
    path: string;
    // Split the rule into two safe parts
    prefix: string;      // e.g. "Inbox Note" (Raw text, safe)
    dateFormat: string;  // e.g. "YYYY-MM-DD" (Moment codes only)
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
            id: '1',
            label: 'Inbox',
            type: 'folder',
            path: 'Inbox',
            prefix: 'Inbox Note ',  // Space at the end is important
            dateFormat: 'YYYY-MM-DD HHmm',
            templatePath: '',
            openAfterCreate: true,
            enabled: true
        },
        {
            id: '2',
            label: 'Current Folder',
            type: 'current-folder',
            path: '',
            prefix: 'Note ',
            dateFormat: 'YYYY-MM-DD',
            templatePath: '',
            openAfterCreate: true,
            enabled: true
        },
        {
            id: '3',
            label: "Today's Daily Note",
            type: 'daily-note',
            path: '',
            prefix: '',
            dateFormat: '', // Daily notes handle their own format
            templatePath: '',
            openAfterCreate: true,
            enabled: true
        }
    ]
};
