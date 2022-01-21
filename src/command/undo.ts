import Graph from "../graph";
import { CTRL_KEY } from "../utils";
import BaseCommand from "./base";
import CommandManager from "./manager";
import Queue from "./queue";

class undoCommand extends BaseCommand {
  name = "undo";

  private queue: Queue<BaseCommand>;

  shortcuts = [[CTRL_KEY, "z"]];

  constructor(graph: Graph, manager: CommandManager) {
    super(graph);
    this.queue = manager.queue;
  }

  canExecute() {
    return !!this.queue.current;
  }

  canUndo() {
    return false;
  }

  execute() {
    const transactions = this.queue.current.undo();
    this.queue.back();
    return transactions;
  }
}

export default undoCommand;
