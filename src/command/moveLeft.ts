import { ICommand } from "../types";
import Graph from "../graph";
import { getParentId } from "../utils";

export interface MoveLeftCommandParams {
  id: string;
  targetId: string;
}

class MoveLeftCommand implements ICommand<MoveLeftCommandParams> {
  private graph: Graph;

  name = "move-left";

  params = {
    id: "",
    targetId: "",
  };

  shortcuts = [["ArrowLeft"]];

  constructor(graph: Graph) {
    this.graph = graph;
  }

  canUndo(): boolean {
    return false;
  }

  undo(): void {}

  canExecute(): boolean {
    const selectedNodes = this.graph.getSelectedNodes();

    if (selectedNodes.length !== 1) return false;
    if (!getParentId(selectedNodes[0])) return false;
    return true;
  }

  init() {
    const { graph } = this;
    const selectedNodes = graph.getSelectedNodes();

    const id = selectedNodes[0].getID();
    this.params = {
      id,
      targetId: getParentId(selectedNodes[0]),
    };
  }

  execute() {
    const { targetId } = this.params;
    this.graph.setSelectedItems([targetId]);
  }
}

export default MoveLeftCommand;
