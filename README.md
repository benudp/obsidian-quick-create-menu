# Obsidian Quick Create Menu

A customizable and visually polished popup menu for Obsidian that lets you quickly create templated notes in specific folders or execute your favorite Obsidian commands — all from a convenient button in the note header.

## Features

- **Quick Action Menu**  
    Adds a persistent `+` icon to the header of your active pane. Hover or click it to open your personalized quick-action menu.
    
- **Three Powerful Action Types**
    
    - **Specific Folder** — Create a note in a predefined folder (e.g. `Journal/Daily`) using a filename pattern and template.
    - **Current Folder** — Dynamically create a note in the folder you are currently viewing.
    - **Obsidian Command** — Turn any Obsidian command into a quick-access action. Perfect for triggering scripts, syncing tools, or complex workflows without opening the command palette.
- **Modern Settings Interface**  
    A clean, card-based configuration UI with a **Live Filename Preview**, so you can see exactly what the generated note name will look like before saving.
    
- **Highly Customizable**
    
    - Choose from **1000+ built-in Obsidian icons**
    - Assign custom colors to make actions easy to identify
- **Smart UI Behavior**
    
    - Menu can be **pinned open** with a click or used as a quick hover menu
    - Automatically adjusts its position to avoid overflowing off the screen
    - Settings update the UI instantly without requiring a plugin reload
- **Drag-and-Drop Reordering**  
    Easily rearrange your actions in the settings panel using native drag and drop.
    

## Usage

### Opening the Menu

After enabling the plugin, a `+` icon will appear in the top-right corner of your active note (in the view actions bar).

- **Hover** over the icon to temporarily preview your actions
- **Click** the icon to pin the menu open
- Click anywhere outside the menu to close it

### Configuring Actions

Go to:

Settings → Quick Create Menu

From there you can add or edit actions.

**Available configuration options:**

- **Action Label** — The name shown in the popup menu
- **Menu Icon & Color** — Customize the appearance of each action
- **Filename Pattern** — Use `{{date}}` to insert the current date/time (e.g. `Meeting - {{date}}`)
- **Date Format** — Uses standard Moment.js formatting (e.g. `YYYY-MM-DD HHmm`)
- **Template File** — Automatically populate the new note with a chosen markdown template

## Installation

### Option 1 — Using BRAT (Recommended for early testing)

1. Install the **BRAT** plugin from the Community Plugins list.
2. Open the command palette and run:

BRAT: Add a beta plugin for testing

3. Enter the URL of this repository.
4. Enable the plugin in the Community Plugins settings.

### Option 2 — Manual Installation

1. Download the latest release files (`main.js`, `manifest.json`, `styles.css`) from the Releases page:

[https://github.com/benudp/obsidian-quick-create-menu/releases](https://github.com/benudp/obsidian-quick-create-menu/releases)

2. Extract them into your vault’s plugin directory:

`<vault>/.obsidian/plugins/obsidian-quick-create-menu/`

3. Restart Obsidian or reload plugins.
4. Enable **Quick Create Menu** in Community Plugins.

## Development

To build the plugin from source:

1. Clone this repository
2. Install dependencies

`npm install`

3. Start development mode

`npm run dev`

or build a production version

`npm run build`

4. Copy the generated files (`main.js`, `styles.css`, `manifest.json`) into a test vault.

## Acknowledgements

- Icons provided by **Lucide** (built into Obsidian)
- Popup menu UI inspired by the **Minidoro plugin**