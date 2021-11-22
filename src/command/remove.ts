import { ICommand, TreeGraphData } from "../types";
import Graph from "../graph";
import { getNextId, getParentId } from "../utils";

export interface RemoveCommandParams {
  id: string;
  parentId: string;
  nextId: string;
  model: TreeGraphData;
}

class RemoveCommand implements ICommand<RemoveCommandParams> {
  private graph: Graph;
  name = "remove";

  params = {
    id: "",
    parentId: "",
    nextId: "",
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
    const { model, nextId, parentId, id } = params;
    graph.placeNode(model, { nextId, parentId });
    graph.setSelectedItems([id]);
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
    this.params = {
      model: selectedNodes[0].getModel() as TreeGraphData,
      id: selectedNodes[0].getID(),
      nextId: getNextId(selectedNodes[0]),
      parentId: getParentId(selectedNodes[0]),
    };
  }

  execute() {
    const { graph, params } = this;
    const { id, nextId } = params;
    graph.removeChild(id);
    const focusId = nextId;
    focusId && graph.setSelectedItems([focusId]);
  }
}

export default RemoveCommand;
