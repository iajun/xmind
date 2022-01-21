import { getPrevId } from "../utils";
import BaseCommand from "./base";

class MoveUpCommand extends BaseCommand {
  name = "move-up";
  shortcuts = [["ArrowUp"]];

  canUndo(): boolean {
    return false;
  }

  canExecute(): boolean {
    return !!(this.target && getPrevId(this.target));
  }

  execute() {
    const { graph } = this;
    graph.setSelectedItems([getPrevId(this.target)]);

    return [];
  }
}

export default MoveUpCommand;
