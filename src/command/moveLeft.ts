import { ICommand } from "../types";
import Graph from "../graph";

export interface MoveLeftCommandParams {
    id: string,
    targetId: string 
}

class MoveLeftCommand implements ICommand<MoveLeftCommandParams> {
  private graph: Graph;

  name = "move-left";

  params = {
    id: "",
    targetId: ''
  };

  shortcuts = [
    ["ArrowLeft"],
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
    if (!selectedNodes[0].getModel().parentId) return false;

    return true;
  }

  init() {
    const { graph } = this;
    const selectedNodes = graph.getSelectedNodes();

    const id = selectedNodes[0].getID();
    this.params = {
      id,
      targetId: selectedNodes[0].getModel().parentId as string
    };
  }

  execute() {
    const { targetId } = this.params;
    this.graph.setSelectedItems([targetId])
  }
}

export default MoveLeftCommand;
