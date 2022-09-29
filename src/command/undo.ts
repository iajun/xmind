import Graph from "../graph";
import { CTRL_KEY } from "../utils";
import BaseCommand from "./base";
import Queue from "./queue";

class undoCommand extends BaseCommand {
  name = "undo";

  private queue: Queue<BaseCommand>;

  shortcuts = [[CTRL_KEY, "z"]];

  constructor(graph: Graph, queue: Queue<BaseCommand>) {
    super(graph);
    this.queue = queue;
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
