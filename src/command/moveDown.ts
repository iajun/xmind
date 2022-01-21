import { getNextId } from "../utils";
import BaseCommand from "./base";

class MoveDownCommand extends BaseCommand {
  name = "move-down";

  shortcuts = [["ArrowDown"]];

  canUndo(): boolean {
    return false;
  }

  canExecute(): boolean {
    return !!(this.target && getNextId(this.target));
  }

  execute() {
    const { graph } = this;
    graph.setSelectedItems([getNextId(this.target)]);

    return [];
  }
}

export default MoveDownCommand;
