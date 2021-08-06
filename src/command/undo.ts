import Graph from "../graph";
import { ICommand } from "../types";
import CommandManager from "./manager";

class undoCommand implements ICommand<{}> {
  private manager: CommandManager;
  private graph: Graph;

  name = "undo";

  params = {};

  shortcuts = [
    ["metaKey", "z"],
    ["ctrlKey", "z"],
  ];

  constructor(graph: Graph, manager: CommandManager) {
    this.manager = manager;
    this.graph = graph;
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

    if (lastCommand && (lastCommand.params as any).id) {
      const id = (lastCommand.params as any).id;
      this.graph.setSelectedItems([id]);
    }

    commandManager.commandIndex -= 1;
  }

  undo() {}
}

export default undoCommand;
