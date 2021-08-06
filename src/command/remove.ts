import { ICommand, TreeGraphData } from "../types";
import Graph from "../graph";

export interface RemoveCommandParams {
  id: string;
  originalModel: TreeGraphData;
}

class RemoveCommand implements ICommand<RemoveCommandParams> {
  private graph: Graph;
  name = "remove";

  params = {
    id: "",
    originalModel: {} as TreeGraphData,
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
    const { originalModel } = params;
    if (originalModel.nextId) {
      graph.keepMatrix(graph.insertBefore)(originalModel, originalModel.nextId);
    } else if (originalModel.parentId) {
      graph.keepMatrix(graph.addChild)(originalModel, originalModel.parentId);
    }
    graph.setSelectedItems([originalModel.id]);
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
    const model = (this.params.originalModel =
      selectedNodes[0].getModel() as TreeGraphData);
    this.params.id = model.id;
  }

  execute() {
    const { graph, params } = this;
    const { id, originalModel } = params;
    graph.keepMatrix(graph.removeChild)(id);
    originalModel.parentId &&
      graph.setSelectedItems([originalModel.parentId]);
  }
}

export default RemoveCommand;
