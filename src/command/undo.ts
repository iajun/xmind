import { ICommand } from "../types";
import { CTRL_KEY } from "../utils";
import CommandManager from "./manager";

class undoCommand implements ICommand<{}> {
  private manager: CommandManager;

  name = "undo";

  params = {};

  shortcuts = [[CTRL_KEY, "z"]];

  constructor(manager: CommandManager) {
    this.manager = manager;
  }

  init(): void {}

  canExecute() {
    const { commandIndex } = this.manager;

    return commandIndex > 0;
  }

  shouldExecute() {
    return true;
  }

  canUndo() {
    return false;
  }

  execute() {
    const commandManager: CommandManager = this.manager;
    const { commandQueue, commandIndex } = commandManager;
    const lastCommand = commandQueue[commandIndex - 1];
    lastCommand.undo();

    commandManager.commandIndex -= 1;
  }

  undo() {}
}

export default undoCommand;
