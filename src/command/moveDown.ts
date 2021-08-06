import { ICommand } from "../types";
import Graph from "../graph";

export interface MoveDownCommandParams {
    id: string,
    targetId: string 
}

class MoveDownCommand implements ICommand<MoveDownCommandParams> {
  private graph: Graph;

  name = "move-down";

  params = {
    id: "",
    targetId: ''
  };

  shortcuts = [
    ["ArrowDown"],
  ];

  constructor(graph: Graph) {
    this.graph = graph;
  }

  canUndo(): boolean {
    return false;
  }

  undo(): void {
  }

  canExecute(): boolean {
    const selectedNodes = this.graph.getSelectedNodes();

    if (selectedNodes.length !== 1) return false;
    if (!selectedNodes[0].getModel().nextId) return false;

    return true;
  }

  init() {
    const { graph } = this;
    const selectedNodes = graph.getSelectedNodes();

    const id = selectedNodes[0].getID();
    this.params = {
      id,
      targetId: selectedNodes[0].getModel().nextId as string
    };
  }

  execute() {
    const { targetId } = this.params;
    this.graph.setSelectedItems([targetId])
  }
}

export default MoveDownCommand;
