import Graph from "../graph";
import { CTRL_KEY } from "../utils";
import BaseCommand from "./base";
import Queue from "./queue";

class redoCommand extends BaseCommand {
  name = "redo";

  private queue: Queue<BaseCommand>;

  shortcuts = [[CTRL_KEY, "shiftKey", "z"]];

  constructor(graph: Graph, queue: Queue<BaseCommand>) {
    super(graph);
    this.queue = queue;
  }

  canExecute() {
    return this.queue.canFore();
  }

  canUndo() {
    return false;
  }

  execute() {
    this.queue.fore();
    return this.queue.current.execute();
  }
}

export default redoCommand;
