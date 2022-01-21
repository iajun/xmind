import Graph from "../graph";
import { CTRL_KEY } from "../utils";
import BaseCommand from "./base";
import CommandManager from "./manager";
import Queue from "./queue";

class redoCommand extends BaseCommand {
  name = "redo";

  private queue: Queue<BaseCommand>;

  shortcuts= [
    [CTRL_KEY, 'shiftKey', 'z'],
  ]

  constructor(graph: Graph, manager: CommandManager) {
    super(graph);
    this.queue = manager.queue;
  };

  canExecute() {
    return this.queue.canFore()
  }

  canUndo() {
    return false;
  }

  execute() {
    this.queue.fore();
    return this.queue.current.execute()
  }
}

export default redoCommand;
