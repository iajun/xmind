import { ICommand } from "../types";
import Graph from "../graph";

export interface MoveUpCommandParams {
    id: string,
    targetId: string 
}

class MoveUpCommand implements ICommand<MoveUpCommandParams> {
  private graph: Graph;

  name = "move-up";

  params = {
    id: "",
    targetId: ''
  };

  shortcuts = [
    ["ArrowUp"],
  ];

  constructor(graph: Graph) {
    this.graph = graph;
  }

  canUndo(): boolean {
    return true;
  }

  undo(): void {
    this.execute();
  }

  canExecute(): boolean {
    const selectedNodes = this.graph.getSelectedNodes();

    if (selectedNodes.length !== 1) return false;
    if (!this.graph.getLastSibling(selectedNodes[0].getID())) return false;

    return true;
  }

  init() {
    const { graph } = this;
    const selectedNodes = graph.getSelectedNodes();
    if (!selectedNodes[0]) return;

    const id = selectedNodes[0].getID();
    this.params = {
      id,
      targetId: graph.getLastSibling(id).getID()
    };
  }

  execute() {
    const { targetId } = this.params;
    this.graph.setSelectedItems([targetId])
  }
}

export default MoveUpCommand;
