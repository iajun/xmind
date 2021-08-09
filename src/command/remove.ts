import { ICommand, TreeGraphData } from "../types";
import Graph from "../graph";

export interface RemoveCommandParams {
  id: string;
  model: TreeGraphData;
}

class RemoveCommand implements ICommand<RemoveCommandParams> {
  private graph: Graph;
  name = "remove";

  params = {
    id: "",
    model: {} as TreeGraphData,
  };

  shortcuts = ["Backspace"];

  constructor(graph: Graph) {
    this.graph = graph;
  }

  canUndo(): boolean {
    return true;
  }

  undo(): void {
    const { graph, params } = this;
    const { model } = params;
    if (model.nextId) {
      graph.insertBefore(model, model.nextId);
    } else if (model.parentId) {
      graph.addChild(model, model.parentId);
    }
    graph.setSelectedItems([model.id]);
  }

  canExecute(): boolean {
    const { graph } = this;

    const selectedNodes = graph.getSelectedNodes();
    if (selectedNodes.length !== 1) return false;
    const selectedNode = selectedNodes[0];

    return !graph.isRootNode(selectedNode.getID());
  }

  init() {
    const { graph } = this;
    const selectedNodes = graph.getSelectedNodes();
    const model = (this.params.model =
      selectedNodes[0].getModel() as TreeGraphData);
    this.params.id = model.id;
  }

  execute() {
    const { graph, params } = this;
    const { id, model } = params;
    graph.removeChild(id);
    model.parentId &&
      graph.setSelectedItems([model.parentId]);
  }
}

export default RemoveCommand;
