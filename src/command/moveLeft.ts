import { getParentId } from "../utils";
import BaseCommand from "./base";

class MoveLeftCommand extends BaseCommand {
  name = "move-left";
  shortcuts = [["ArrowLeft"]];

  canUndo(): boolean {
    return false;
  }

  canExecute(): boolean {
    return !!(this.target && getParentId(this.target));
  }

  execute() {
    const { graph } = this;
    graph.setSelectedItems([getParentId(this.target)]);

    return [];
  }
}

export default MoveLeftCommand;
