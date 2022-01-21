import { getFirstChildId } from "../utils";
import BaseCommand from "./base";

class MoveRightCommand extends BaseCommand {
  name = "move-right";
  shortcuts = [["ArrowRight"]];

  canUndo(): boolean {
    return false;
  }

  canExecute(): boolean {
    return !!(this.target && getFirstChildId(this.target));
  }

  execute() {
    const { graph } = this;
    graph.setSelectedItems([getFirstChildId(this.target)]);

    return [];
  }
}

export default MoveRightCommand;
