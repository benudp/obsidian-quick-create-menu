import { App, Command, FuzzySuggestModal } from "obsidian";

export class CommandSuggestModal extends FuzzySuggestModal<Command> {
  onChoose: (command: Command) => void;

  constructor(app: App, onChoose: (command: Command) => void) {
    super(app);
    this.onChoose = onChoose;
    this.setPlaceholder("Search for an Obsidian command...");
  }

  getItems(): Command[] {
    // Gets all registered commands in Obsidian
    return (this.app as any).commands.listCommands();
  }

  getItemText(command: Command): string {
    return command.name;
  }

  onChooseItem(command: Command, evt: MouseEvent | KeyboardEvent): void {
    this.onChoose(command);
  }
}
