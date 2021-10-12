import { ICommand, TreeGraphData } from "../types";
import Graph from "../graph";
import _ from "lodash";
import { cloneTree, CTRL_KEY, Clipboard } from "../utils";

export interface PasteCommandParams {
  parentId: string;
  newModel: TreeGraphData;
  mapItem?: (item: TreeGraphData) => TreeGraphData;
}

class PasteCommand implements ICommand<PasteCommandParams> {
  private graph: Graph;
  name = "paste";

  params = {
    parentId: "",
    newModel: {},
  } as PasteCommandParams;

  shortcuts = [[CTRL_KEY, "v"]];

  constructor(graph: Graph) {
    this.graph = graph;
  }

  canUndo(): boolean {
    return true;
  }

  undo(): void {
    const { graph, params } = this;
    const { newModel, parentId } = params;
    graph.removeChild(newModel.id);
    graph.setSelectedItems([parentId]);
  }

  canExecute(): boolean {
    const { graph } = this;
    const selectedNodes = graph.getSelectedNodes();
    if (selectedNodes.length !== 1) {
      return false;
    }
    const data: any = Clipboard.get();

    return data && data.id && data.model;
  }

  init() {
    const data: any = Clipboard.get();
    this.params.newModel = cloneTree(data.model, this.params.mapItem);
  }

  execute() {
    const { graph, params } = this;
    const { newModel } = params;
    const selectedNode = graph.getSelectedNodes()[0];
    const parentId = (this.params.parentId = selectedNode.getID());
    newModel.parentId = parentId;
    graph.addChild(newModel, parentId);
    graph.setSelectedItems([newModel.id]);
  }
}

export default PasteCommand;
