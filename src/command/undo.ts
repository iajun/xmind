import Graph from "../graph";
import { CTRL_KEY } from "../utils";
import BaseCommand from "./base";
import CommandManager from "./manager";

class undoCommand extends BaseCommand {
  private manager: CommandManager;

  name = "undo";

  params = {};

  shortcuts = [[CTRL_KEY, "z"]];

  constructor(graph: Graph, manager: CommandManager) {
    super(graph);
    this.manager = manager;
  }

  init(): void {}

  canExecute() {
    const { commandIndex } = this.manager;
    return commandIndex > 0;
  }

  canUndo() {
    return false;
  }

  execute() {
    const commandManager: CommandManager = this.manager;
    const { commandQueue, commandIndex } = commandManager;
    const lastCommand = commandQueue[commandIndex - 1];
    commandManager.commandIndex -= 1;
    return lastCommand.undo();
  }
}

export default undoCommand;
