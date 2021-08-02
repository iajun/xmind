import { ICommand, ModelNode } from "./../types";
import Graph from "../graph";

export interface FoldCommandParams {
  id: string;
}

class FoldCommand implements ICommand<FoldCommandParams> {
  private graph: Graph;
  name = "fold";

  params = {
    id: "",
  };

  shortcuts = [
    ["metaKey", "/"],
    ["ctrlKey", "/"],
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

    if (!selectedNodes.length) return false;

    const selectedNode = selectedNodes[0];

    const model = selectedNode.getModel() as ModelNode;

    if (model.collapsed || !model.children) return false;

    return true;
  }

  init() {
    const { graph } = this;
    const selectedNodes = graph.getSelectedNodes();
    if (!selectedNodes.length) return;
    this.params = {
      id: selectedNodes[0].getID(),
    };
  }

  execute() {
    const { id } = this.params;
    const item = this.graph.findDataById(id);
    if (!item) return;
    item.collapsed = !item.collapsed;
    this.graph.layout(false);
  }
}

export default FoldCommand;
