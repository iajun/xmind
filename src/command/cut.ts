import { TreeGraphData, ICommand } from "../types";
import Graph from "../graph";
import { Clipboard, CTRL_KEY, getNextId, getParentId } from "../utils";

export interface CutCommandParams {
  id: string;
  parentId: string;
  nextId: string | null;
  model: TreeGraphData;
}

class CutCommand implements ICommand<CutCommandParams> {
  private graph: Graph;
  name = "cut";

  params = {
    id: "",
    parentId: null,
    nextId: null,
    model: {},
  } as CutCommandParams;

  shortcuts = [[CTRL_KEY, "x"]];

  constructor(graph: Graph) {
    this.graph = graph;
  }

  canUndo(): boolean {
    return true;
  }

  undo(): void {
    const { graph, params } = this;
    const { model, parentId, nextId } = params!;
    graph.placeNode(model, { nextId, parentId });
  }

  canExecute(): boolean {
    const { graph } = this;
    const selectedNodes = this.graph.getSelectedNodes();
    if (selectedNodes.length !== 1) return false;
    const selectedNode = selectedNodes[0];
    return !graph.isRootNode(selectedNode.getID());
  }

  init() {
    const { graph } = this;
    const selectedNode = graph.getSelectedNodes()[0];
    const id = selectedNode.getID();
    this.params = {
      id,
      nextId: getNextId(selectedNode),
      parentId: getParentId(selectedNode),
      model: graph.findDataById(id) as TreeGraphData,
    };
  }

  execute() {
    const { graph, params } = this;
    const { id } = params;
    Clipboard.set(params);
    graph.removeChild(id);
  }
}

export default CutCommand;
