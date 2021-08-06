import { ICommand } from "../types";
import Graph from "../graph";

export interface MoveRightCommandParams {
    id: string,
    targetId: string 
}

class MoveRightCommand implements ICommand<MoveRightCommandParams> {
  private graph: Graph;

  name = "move-right";

  params = {
    id: "",
    targetId: ''
  };

  shortcuts = [
    ["ArrowRight"],
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
    const children = selectedNodes[0].getModel().children as any[];
    if (!children || !children.length) return false;

    return true;
  }

  init() {
    const { graph } = this;
    const selectedNodes = graph.getSelectedNodes();

    const id = selectedNodes[0].getID();
    this.params = {
      id,
      targetId: selectedNodes[0].getModel().children[0].id
    };
  }

  execute() {
    const { targetId } = this.params;
    this.graph.setSelectedItems([targetId])
  }
}

export default MoveRightCommand;
