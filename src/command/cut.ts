import { TreeGraphData, ICommand } from "../types";
import Graph from "../graph";
import { Clipboard, CTRL_KEY } from "../utils";

export interface CutCommandParams {
  id: string;
  parentId: string;
  model: TreeGraphData;
}

class CutCommand implements ICommand<CutCommandParams> {
  private graph: Graph;
  name = "cut";

  params = {
    id: "",
    parentId: "",
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
    const model = params.model!;
    if (model.nextId) {
      graph.insertBefore(model, model.nextId);
    } else {
      graph.addChild(model, model.parentId);
    }
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
    const selectedNodes = graph.getSelectedNodes();
    if (!selectedNodes.length) return;
    const id = selectedNodes[0].getID();
    this.params = {
      id,
      parentId: selectedNodes[0].getModel().parentId as string,
      model: graph.findDataById(id) as TreeGraphData,
    };
  }

  execute() {
    const { graph, params } = this;
    const { id, model } = params;
    Clipboard.set({ id, model });
    graph.removeChild(id);
  }
}

export default CutCommand;
