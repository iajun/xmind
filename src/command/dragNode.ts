import { ICommand, TreeGraphData } from "../types";
import Graph from "../graph";
import _ from "lodash";
import { cloneTree } from "../utils";

export interface DragNodeCommandParams {
  model: TreeGraphData;
  newModel: TreeGraphData;
  parentId: string;
  nextId: string | null;
  mapItem?: (item: TreeGraphData) => TreeGraphData;
}

class DragNodeCommand implements ICommand<DragNodeCommandParams> {
  private graph: Graph;

  name = "drag-node";

  shortcuts = [];

  params = {
    model: {},
    newModel: {},
    parentId: "",
    nextId: null,
  } as DragNodeCommandParams;

  constructor(graph: Graph) {
    this.graph = graph;
  }

  canExecute(): boolean {
    return true;
  }

  canUndo(): boolean {
    return true;
  }

  execute(): void {
    const { graph, params } = this;
    const { parentId, nextId, model, newModel } = params;
    if (graph.findById(model.id)) {
      graph.removeChild(model.id);
    }

    if (nextId) {
      graph.insertBefore(newModel, nextId);
    } else {
      graph.addChild(newModel, parentId);
    }
  }

  undo(): void {
    const { graph, params } = this;
    const { model, newModel } = params;
    graph.executeBatch(() => {
      graph.removeChild(newModel.id);
      graph.placeNode(model);
    });
  }

  init(): void {
    const { model, mapItem } = this.params;
    this.params.newModel = cloneTree<TreeGraphData>(model, mapItem);
  }
}

export default DragNodeCommand;
